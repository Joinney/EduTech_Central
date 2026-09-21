import os
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from controllers.ai_controller import AIController, MultiModelChatRequest, ChatSaveRequest
from services.ai_service import AIService

router = APIRouter(prefix="/ai", tags=["Multi-Model Chat"])

@router.get("/models", summary="Lấy danh sách các model khả dụng")
def list_models():
    return AIController.get_models()

@router.post("/chat", summary="Chat thông thường")
async def chat_with_model(payload: MultiModelChatRequest):
    return await AIController.chat(payload)

@router.post("/chat/stream", summary="Chat streaming chữ chạy theo thời gian thực")
async def chat_stream(payload: MultiModelChatRequest):
    formatted_messages = [{"role": m.role, "content": m.content} for m in payload.messages]
    
    headers = {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no"
    }
    
    return StreamingResponse(
        AIService.chat_completion_stream(
            messages=formatted_messages,
            model=payload.model,
            temperature=payload.temperature or 0.2
        ),
        headers=headers,
        media_type="text/event-stream"
    )

@router.post("/upload-document", summary="Upload tài liệu")
async def upload_document(file: UploadFile = File(...)):
    if not file:
        raise HTTPException(status_code=400, detail="Không có tệp nào được gửi lên")
    return await AIController.upload_and_process(file)

@router.post("/chat/save", summary="Lưu hoặc cập nhật lịch sử chat")
async def save_chat_history(payload: ChatSaveRequest):
    return await AIController.save_chat_history(payload)

@router.get("/chat/history", summary="Lấy danh sách lịch sử chat")
async def get_history(user_id: str = "guest"):
    return await AIController.get_chat_history(user_id)