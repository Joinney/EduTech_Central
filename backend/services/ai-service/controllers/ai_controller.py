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
        description="Nội dung văn bản hoặc danh sách thành phần Vision"
    )

class MultiModelChatRequest(BaseModel):
    model: str = Field(default=settings.DEFAULT_MODEL, example="DeepSeek-V4-Flash")
    messages: List[ChatMessage]
    temperature: Optional[float] = Field(default=0.3, ge=0.0, le=2.0)

class ChatSaveRequest(BaseModel):
    session_id: Optional[str] = None
    user_id: str = "guest"
    subject: str = "Chung"
    messages: List[ChatMessage]

class AIController:
    @staticmethod
    def get_models():
        return {
            "success": True,
            "default_model": settings.DEFAULT_MODEL,
            "models": AIService.get_supported_models()
        }

    @staticmethod
    async def chat(request: MultiModelChatRequest):
        try:
            formatted_messages = [{"role": m.role, "content": m.content} for m in request.messages]
            result = await AIService.chat_completion(
                messages=formatted_messages,
                model=request.model,
                temperature=request.temperature
            )
            return {"success": True, "data": result}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Lỗi xử lý Model: {str(e)}")

    @staticmethod
    async def upload_and_process(file: UploadFile):
        if not file or not file.filename:
            raise HTTPException(status_code=400, detail="Không tìm thấy tệp đính kèm hợp lệ")

        try:
            target_dir = Path(UPLOAD_DIR)
            target_dir.mkdir(parents=True, exist_ok=True)
            destination_path = target_dir / file.filename

            file_bytes = await file.read()
            with open(destination_path, "wb") as buffer:
                buffer.write(file_bytes)

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

    @staticmethod
    async def save_chat_history(request: ChatSaveRequest):
        try:
            collection = db.db["chat_sessions"]
            formatted_messages = [{"role": m.role, "content": m.content} for m in request.messages]

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
            else:
                title = "Đoạn chat mới"
                if request.messages:
                    first_content = request.messages[0].content
                    if isinstance(first_content, str):
                        title = first_content[:40] + "..." if len(first_content) > 40 else first_content
                    elif isinstance(first_content, list):
                        for item in first_content:
                            if isinstance(item, dict) and item.get("type") == "text":
                                txt = item.get("text", "")
                                title = txt[:40] + "..." if len(txt) > 40 else txt
                                break

                new_session = {
                    "user_id": str(request.user_id),
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

    @staticmethod
    async def get_chat_history(user_id: str):
        try:
            collection = db.db["chat_sessions"]
            cursor = collection.find({"user_id": str(user_id)}).sort("updated_at", -1).limit(20)
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