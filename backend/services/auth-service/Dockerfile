FROM node:20-alpine

WORKDIR /app

# Cài đặt OpenSSL cho Alpine Linux
RUN apk add --no-cache openssl

COPY backend/services/auth-service/package*.json ./
RUN npm install

COPY backend/services/auth-service/ ./
RUN npx prisma generate

EXPOSE 8001
CMD ["npm", "run", "dev"]