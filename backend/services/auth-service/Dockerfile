FROM node:20-alpine

WORKDIR /app

COPY backend/services/auth-service/package.json ./

RUN npm install

COPY backend/services/auth-service/ ./

RUN npx prisma generate

EXPOSE 8001

CMD ["node", "server.js"]