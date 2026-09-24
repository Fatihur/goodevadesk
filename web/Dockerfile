FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY api/package*.json api/
COPY web/package*.json web/
RUN npm ci
COPY . .
RUN npm run build -w web

FROM nginx:1.27-alpine
COPY --from=build /app/web/dist /usr/share/nginx/html
COPY web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
