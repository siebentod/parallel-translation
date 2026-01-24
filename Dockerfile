# Stage 1: Сборка frontend
FROM node:20 AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . ./
RUN npm run build

# Stage 2: Финальный образ с nginx
FROM nginx:alpine AS runner

# Копируем собранный frontend в nginx
COPY --from=frontend-builder /app/dist /usr/share/nginx/html

# Настраиваем nginx для SPA с React Router
RUN echo 'server { \
    listen 3000; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    error_log /var/log/nginx/error.log debug; \
    access_log /var/log/nginx/access.log; \
    \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    \
    # Кэширование статических ресурсов \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Открываем порт
EXPOSE 3000

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"]