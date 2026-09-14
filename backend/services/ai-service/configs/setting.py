# configs/setting.py
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

class Settings:
    PROJECT_NAME: str = "EduTech AI Multi-Model Chat"
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", 8000))
    API_PREFIX: str = "/api/v1"
    
    # Provider Configs
    DEEPSEEK_API_KEY: str = os.getenv("DEEPSEEK_API_KEY", "")
    DEEPSEEK_BASE_URL: str = os.getenv("DEEPSEEK_BASE_URL", "https://api.iamhc.cn/v1")
    DEFAULT_MODEL: str = os.getenv("DEEPSEEK_MODEL", "DeepSeek-V4-Flash")

    # Danh sách model lấy từ Model Limits của bạn
    AVAILABLE_MODELS: list = [
        "DeepSeek-V4-Flash",
        "DeepSeek-V4-Pro",
        "deepseek-v4-flash-vision-exp",
        "glm-5.3-flash",
        "glm-4.5-air",
        "kimi-k3",
        "Qwen3.8-Flash-Next",
        "Qwen3.8-27B",
        "step-3.7-flash",
        "spark-x2.5"
    ]

settings = Settings()