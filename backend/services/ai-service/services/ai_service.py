import os
from typing import List, Dict, Any, AsyncGenerator
from pypdf import PdfReader
import docx
from openai import AsyncOpenAI
from configs.setting import settings

# Khởi tạo AsyncOpenAI Client trỏ về Base URL nhà cung cấp
client = AsyncOpenAI(
    api_key=settings.DEEPSEEK_API_KEY,
    base_url=settings.DEEPSEEK_BASE_URL
)

class AIService:
    @staticmethod
    def get_supported_models() -> List[str]:
        """Trả về danh sách các model đang được hỗ trợ."""
        return settings.AVAILABLE_MODELS

    @staticmethod
    async def chat_completion(
        messages: List[Dict[str, Any]], 
        model: str,
        temperature: float = 0.5
    ) -> Dict[str, Any]:
        """Xử lý chat tiêu chuẩn (nhận toàn bộ kết quả một lần)."""
        selected_model = model if model in settings.AVAILABLE_MODELS else settings.DEFAULT_MODEL
        
        response = await client.chat.completions.create(
            model=selected_model,
            messages=messages,
            temperature=temperature
        )
        
        return {
            "model_used": selected_model,
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
        temperature: float = 0.3
    ) -> AsyncGenerator[str, None]:
        """Xử lý stream token theo thời gian thực (hiệu ứng chữ chạy ChatGPT)."""
        selected_model = model if model in settings.AVAILABLE_MODELS else settings.DEFAULT_MODEL
        
        response_stream = await client.chat.completions.create(
            model=selected_model,
            messages=messages,
            temperature=temperature,
            stream=True
        )
        
        async for chunk in response_stream:
            if chunk.choices and chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

    @staticmethod
    def extract_text_from_file(file_path: str, filename: str) -> str:
        """Đọc và trích xuất toàn bộ văn bản từ tệp PDF, DOCX, DOC, TXT."""
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
            extracted_text = f"[Lỗi khi đọc nội dung tệp {filename}: {str(e)}]"

        return extracted_text.strip()

    @staticmethod
    async def analyze_document_file(file_path: str, filename: str) -> Dict[str, Any]:
        """Phân tích và trích xuất nội dung file tài liệu tải lên."""
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