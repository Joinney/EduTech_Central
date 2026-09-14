import uvicorn
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from configs.setting import settings
from middlewares.logging_middleware import LoggingMiddleware
from routes.ai_route import router as ai_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Microservice phụ trách AI và phân tích khóa học EduTech",
    version="1.0.0"
)

# Cấu hình CORS - Cho phép Web App (React/Vite) gọi API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gắn Middleware ghi log request
app.add_middleware(LoggingMiddleware)

# Đăng ký Router cho API
app.include_router(ai_router, prefix=settings.API_PREFIX)

@app.get("/", response_class=HTMLResponse, tags=["Service Dashboard"])
def root():
    return """
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>EduTech Central AI Service</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
        <style>
            * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
                font-family: 'Plus Jakarta Sans', sans-serif;
            }
            body {
                background-color: #fafbfc;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            .card {
                background: #ffffff;
                width: 100%;
                max-width: 620px;
                border-radius: 36px;
                padding: 56px 40px;
                text-align: center;
                border: 1.5px solid #fed7aa;
                box-shadow: 0 10px 30px -5px rgba(251, 146, 60, 0.08);
            }
            .badge {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                background-color: #fff7ed;
                padding: 6px 16px;
                border-radius: 9999px;
                font-size: 11px;
                font-weight: 700;
                color: #ea580c;
                letter-spacing: 0.05em;
                margin-bottom: 24px;
            }
            .badge-dot {
                width: 8px;
                height: 8px;
                background-color: #ea580c;
                border-radius: 50%;
                box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.2);
            }
            .title {
                color: #f9570c;
                font-size: 32px;
                font-weight: 800;
                margin-bottom: 16px;
                letter-spacing: -0.02em;
            }
            .subtitle {
                color: #475569;
                font-size: 15px;
                font-weight: 600;
                margin-bottom: 36px;
            }
            .btn-swagger {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(180deg, #f9570c 0%, #ea580c 100%);
                color: #ffffff;
                text-decoration: none;
                font-size: 15px;
                font-weight: 700;
                padding: 14px 28px;
                border-radius: 12px;
                box-shadow: 0 10px 20px -3px rgba(234, 88, 12, 0.4);
                transition: all 0.2s ease;
            }
            .btn-swagger:hover {
                transform: translateY(-2px);
                box-shadow: 0 14px 24px -3px rgba(234, 88, 12, 0.45);
            }
        </style>
    </head>
    <body>
        <div class="card">
            <div class="badge">
                <span class="badge-dot"></span>
                <span>MICROSERVICE ONLINE</span>
            </div>
            <h1 class="title">EduTech Central AI Service</h1>
            <p class="subtitle">Hệ thống trợ lý học tập AI &amp; xử lý bài tập đang hoạt động mượt mà! 🚀</p>
            <a href="/docs" class="btn-swagger">Vào Swagger xem API &rarr;</a>
        </div>
    </body>
    </html>
    """

if __name__ == "__main__":
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)