import os
from pathlib import Path
from typing import List, Optional, Any, Union
from fastapi import HTTPException, UploadFile
from pydantic import BaseModel, Field
from services.ai_service import AIService
from configs.setting import settings, UPLOAD_DIR

class ChatMessage(BaseModel):
    role: str = Field(..., example="user", description="'user', 'assistant' hoặc 'system'")
    content: Union[str, List[Any]] = Field(
        ..., 
        example="Xin chào, hãy giải giúp tôi bài tập này!",
        description="Nội dung tin nhắn dạng text hoặc danh sách các thành phần Vision đa phương thức"
    )

class MultiModelChatRequest(BaseModel):
    model: str = Field(default=settings.DEFAULT_MODEL, example="deepseek-v4-flash-vision-exp")
    messages: List[ChatMessage]
    temperature: Optional[float] = Field(default=0.3, ge=0.0, le=2.0)

class AIController:
    @staticmethod
    def get_models():
        """Lấy danh sách mô hình AI được hỗ trợ từ cấu hình."""
        return {
            "success": True,
            "default_model": settings.DEFAULT_MODEL,
            "models": AIService.get_supported_models()
        }

    @staticmethod
    async def chat(request: MultiModelChatRequest):
        """Xử lý chat tiêu chuẩn (nhận toàn bộ kết quả một lần)."""
        try:
            formatted_messages = [{"role": m.role, "content": m.content} for m in request.messages]
            
            result = await AIService.chat_completion(
                messages=formatted_messages,
                model=request.model,
                temperature=request.temperature
            )
            return {
                "success": True,
                "data": result
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Lỗi xử lý Model: {str(e)}")

    @staticmethod
    async def upload_and_process(file: UploadFile):
        """Xử lý upload và trích xuất nội dung từ tài liệu (PDF, Word, TXT, Ảnh)."""
        if not file or not file.filename:
            raise HTTPException(status_code=400, detail="Không tìm thấy tệp đính kèm hợp lệ")

        try:
            target_dir = Path(UPLOAD_DIR)
            target_dir.mkdir(parents=True, exist_ok=True)
            
            destination_path = target_dir / file.filename
            
            # Đọc ghi bất đồng bộ tránh nghẽn luồng UploadFile trên Docker
            file_bytes = await file.read()
            with open(destination_path, "wb") as buffer:
                buffer.write(file_bytes)

            # Đưa qua service để đọc và trích xuất text/thông số tài liệu
            result = await AIService.analyze_document_file(
                file_path=str(destination_path),
                filename=file.filename
            )
            
            return {
                "success": True,
                "message": "Tải lên và trích xuất tài liệu thành công",
                "data": result
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Lỗi khi xử lý file: {str(e)}")
        finally:
            await file.close()