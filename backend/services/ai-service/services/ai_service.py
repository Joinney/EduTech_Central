import os
import io
import base64
from typing import List, Dict, Any, AsyncGenerator
from PIL import Image
from pypdf import PdfReader
import docx
from openai import AsyncOpenAI, APIStatusError
from configs.setting import settings

# Khởi tạo công cụ đọc ảnh OCR
try:
    from rapidocr_onnxruntime import RapidOCR
    ocr_engine = RapidOCR()
    print("✅ [RapidOCR] Đã khởi tạo thành công engine nhận diện ảnh.")
except Exception as e:
    ocr_engine = None
    print(f"⚠️ [RapidOCR] Không thể khởi tạo engine: {e}")

client = AsyncOpenAI(
    api_key=settings.DEEPSEEK_API_KEY,
    base_url=settings.DEEPSEEK_BASE_URL,
    timeout=60.0,
    max_retries=0  # Tránh treo luồng khi gặp lỗi từ cổng kết nối
)

class AIService:
    @staticmethod
    def get_supported_models() -> List[str]:
        return settings.AVAILABLE_MODELS

    @staticmethod
    def _ocr_image_base64(base64_str: str) -> str:
        """Trích xuất văn bản và công thức từ ảnh base64."""
        if not ocr_engine:
            return "[Đã gửi ảnh bài tập nhưng hệ thống chưa sẵn sàng module OCR]"
        try:
            if "base64," in base64_str:
                base64_str = base64_str.split("base64,")[1]
            img_bytes = base64.b64decode(base64_str)
            img = Image.open(io.BytesIO(img_bytes))
            
            result, _ = ocr_engine(img)
            if result:
                text_lines = [line[1] for line in result]
                extracted_text = "\n".join(text_lines)
                print(f"📄 [OCR Trích xuất thành công]:\n{extracted_text}")
                return f"[NỘI DUNG ĐỀ BÀI NHẬN DIỆN TỪ ẢNH]:\n{extracted_text}"
        except Exception as e:
            print(f"❌ [Lỗi OCR ảnh]: {e}")
        return "[Ảnh bài tập không nhận diện được chữ]"

    @staticmethod
    def _format_messages_payload(messages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Bóc tách thẻ image_url thành text đã qua OCR để tránh lỗi 503 / 525 từ API provider."""
        cleaned_messages = []
        for msg in messages:
            content = msg.get("content")
            if isinstance(content, list):
                extracted_texts = []
                for part in content:
                    if isinstance(part, dict):
                        if part.get("type") == "text":
                            extracted_texts.append(part.get("text", ""))
                        elif part.get("type") == "image_url":
                            img_url = part.get("image_url", {}).get("url", "")
                            if img_url.startswith("data:image"):
                                ocr_text = AIService._ocr_image_base64(img_url)
                                extracted_texts.append(ocr_text)
                combined = "\n\n".join([t for t in extracted_texts if t]).strip()
                cleaned_messages.append({"role": msg.get("role"), "content": combined or "[Hình ảnh bài tập]"})
            else:
                cleaned_messages.append(msg)
        return cleaned_messages

    @staticmethod
    async def chat_completion(
        messages: List[Dict[str, Any]], 
        model: str,
        temperature: float = 0.3
    ) -> Dict[str, Any]:
        target_model = model if model in settings.AVAILABLE_MODELS else settings.DEFAULT_MODEL
        payload_messages = AIService._format_messages_payload(messages)

        response = await client.chat.completions.create(
            model=target_model,
            messages=payload_messages,
            temperature=temperature
        )
        return {
            "model_used": target_model,
            "message": response.choices[0].message.content,
            "usage": {
                "prompt_tokens": response.usage.prompt_tokens if response.usage else 0,
                "completion_tokens": response.usage.completion_tokens if response.usage else 0,
                "total_tokens": response.usage.total_tokens if response.usage else 0
            }
        }

    @staticmethod
    async def chat_completion_stream(
        messages: List[Dict[str, Any]], 
        model: str,
        temperature: float = 0.2
    ) -> AsyncGenerator[str, None]:
        target_model = model if model in settings.AVAILABLE_MODELS else settings.DEFAULT_MODEL
        payload_messages = AIService._format_messages_payload(messages)

        try:
            response_stream = await client.chat.completions.create(
                model=target_model,
                messages=payload_messages,
                temperature=temperature,
                stream=True
            )
            async for chunk in response_stream:
                if chunk.choices and chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content

        except APIStatusError as status_err:
            if status_err.status_code == 503:
                yield f"\n\n⚠️ Mô hình `{target_model}` bên nhà cung cấp hiện đang quá tải hoặc bảo trì (503). Vui lòng chọn mô hình khác."
            elif status_err.status_code == 525:
                yield f"\n\n⚠️ Cổng kết nối máy chủ gặp lỗi bắt tay SSL (525). Vui lòng thử lại hoặc chọn mô hình khác."[cite: 1]
            else:
                yield f"\n\n❌ Lỗi phản hồi API ({target_model}) [{status_err.status_code}]: {status_err.message}"
        except Exception as e:
            yield f"\n\n❌ Lỗi kết nối AI ({target_model}): {str(e)}"

    @staticmethod
    def extract_text_from_file(file_path: str, filename: str) -> str:
        ext = os.path.splitext(filename)[1].lower()
        extracted_text = ""
        try:
            if ext == ".pdf":
                reader = PdfReader(file_path)
                for page in reader.pages:
                    text = page.extract_text()
                    if text:
                        extracted_text += text + "\n"
            elif ext in [".docx", ".doc"]:
                doc = docx.Document(file_path)
                extracted_text = "\n".join([p.text for p in doc.paragraphs if p.text])
            elif ext == ".txt":
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    extracted_text = f.read()
            else:
                extracted_text = f"[Tệp {filename}]"
        except Exception as e:
            extracted_text = f"[Lỗi đọc tệp {filename}: {str(e)}]"

        return extracted_text.strip()

    @staticmethod
    async def analyze_document_file(file_path: str, filename: str) -> Dict[str, Any]:
        file_size = os.path.getsize(file_path)
        extracted_content = AIService.extract_text_from_file(file_path, filename)
        return {
            "filename": filename,
            "saved_location": file_path,
            "size_bytes": file_size,
            "file_type": os.path.splitext(filename)[1].lower().replace(".", "").upper(),
            "extracted_text": extracted_content,
            "status": "PROCESSED"
        }