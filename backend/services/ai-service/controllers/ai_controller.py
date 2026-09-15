import os
from pathlib import Path
from typing import List, Optional, Any, Union
from fastapi import HTTPException, UploadFile
from pydantic import BaseModel, Field
from services.ai_service import AIService
from configs.setting import settings, UPLOAD_DIR
from datetime import datetime
from bson import ObjectId
from configs.mongodb import db

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

# Bổ sung Model nhận dữ liệu lưu lịch sử từ React
class ChatSaveRequest(BaseModel):
    session_id: Optional[str] = None
    user_id: str = "guest"  # Sau này thay bằng ID user thực tế từ JWT token
    subject: str = "Chung"
    messages: List[ChatMessage]

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

    # ----------------------------------------------------------------------
    # HÀM BỔ SUNG: XỬ LÝ LƯU LỊCH SỬ CHAT VÀO MONGODB
    # ----------------------------------------------------------------------
    @staticmethod
    async def save_chat_history(request: ChatSaveRequest):
        """Lưu hoặc cập nhật lịch sử chat vào MongoDB."""
        try:
            collection = db.db["chat_sessions"]
            formatted_messages = [{"role": m.role, "content": m.content} for m in request.messages]
            
            # Nếu truyền lên session_id (chat tiếp đoạn chat cũ) -> Cập nhật
            if request.session_id:
                if not ObjectId.is_valid(request.session_id):
                    raise HTTPException(status_code=400, detail="session_id không hợp lệ")
                
                await collection.update_one(
                    {"_id": ObjectId(request.session_id)},
                    {"$set": {
                        "messages": formatted_messages,
                        "updated_at": datetime.utcnow()
                    }}
                )
                return {"success": True, "session_id": request.session_id}
            
            # Nếu không có session_id (đoạn chat mới hoàn toàn) -> Tạo mới
            else:
                title = "Chat mới"
                if request.messages:
                    first_content = request.messages[0].content
                    # Xử lý cắt chữ làm tiêu đề (hỗ trợ cả text thường và dạng Vision có kèm ảnh)
                    if isinstance(first_content, str):
                        title = first_content[:40] + "..." if len(first_content) > 40 else first_content
                    elif isinstance(first_content, list) and len(first_content) > 0:
                        for item in first_content:
                            if isinstance(item, dict) and item.get("type") == "text":
                                text_val = item.get("text", "")
                                title = text_val[:40] + "..." if len(text_val) > 40 else text_val
                                break

                new_session = {
                    "user_id": request.user_id,
                    "subject": request.subject,
                    "title": title,
                    "messages": formatted_messages,
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
                
                result = await collection.insert_one(new_session)
                return {"success": True, "session_id": str(result.inserted_id)}
                
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Lỗi lưu lịch sử Database: {str(e)}")

    # ----------------------------------------------------------------------
    # HÀM BỔ SUNG: LẤY LỊCH SỬ CHAT TỪ MONGODB
    # ----------------------------------------------------------------------
    @staticmethod
    async def get_chat_history(user_id: str):
        """Lấy danh sách lịch sử chat của user từ MongoDB."""
        try:
            collection = db.db["chat_sessions"]
            
            # Tìm tất cả phiên chat của user, sắp xếp thời gian mới nhất lên đầu, lấy tối đa 20 phiên
            cursor = collection.find({"user_id": user_id}).sort("updated_at", -1).limit(20)
            sessions = await cursor.to_list(length=20)
            
            result = []
            for s in sessions:
                result.append({
                    "id": str(s["_id"]),
                    "title": s.get("title", "Cuộc trò chuyện mới"),
                    "subject": s.get("subject", "Chung"),
                    "time": s.get("updated_at").strftime("%d/%m/%Y %H:%M") if s.get("updated_at") else "",
                    "messages": s.get("messages", [])
                })
                
            return {"success": True, "data": result}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Lỗi tải lịch sử Database: {str(e)}")