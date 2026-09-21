# Sử dụng Python image bản nhẹ (slim)
FROM python:3.11-slim

# Thiết lập thư mục làm việc
WORKDIR /app

# Thiết lập biến môi trường để Python in log trực tiếp, không tạo file .pyc
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Cài đặt các thư viện hệ thống cần thiết cho OpenCV, RapidOCR và curl
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy file requirements trước để tận dụng Docker cache layer
COPY requirements.txt .

# Cài đặt dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ mã nguồn vào container
COPY . .

# Tạo thư mục uploads nếu chưa có và cấp quyền
RUN mkdir -p uploads

# Mở cổng 8000
EXPOSE 8000

# Lệnh khởi chạy server bằng Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]