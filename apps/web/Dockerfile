FROM node:20-alpine AS builder
WORKDIR /app
COPY apps/web/package*.json ./
RUN npm install --include=dev
COPY apps/web/ ./
RUN npm run build

FROM nginx:alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]