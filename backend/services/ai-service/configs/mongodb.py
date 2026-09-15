from motor.motor_asyncio import AsyncIOMotorClient
from configs.setting import settings
import logging

class MongoDB:
    client: AsyncIOMotorClient = None
    db = None

db = MongoDB()

async def connect_to_mongo():
    try:
        db.client = AsyncIOMotorClient(settings.MONGODB_URL)
        db.db = db.client[settings.DB_NAME]
        
        # 🎯 THÊM DÒNG NÀY ĐỂ ÉP KIỂM TRA KẾT NỐI THẬT
        await db.client.admin.command('ping')
        
        logging.info(f"Kết nối THẬT SỰ thành công tới Database: {settings.DB_NAME}")
    except Exception as e:
        logging.error(f"Lỗi kết nối MongoDB: {e}") # Báo lỗi chi tiết ở đây

async def close_mongo_connection():
    if db.client:
        db.client.close()