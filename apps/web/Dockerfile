FROM node:20-alpine AS builder
WORKDIR /app

COPY apps/web/package*.json ./
RUN npm install --include=dev

COPY apps/web/ ./
RUN npm run build

FROM nginx:alpine AS runner

RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf

COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]