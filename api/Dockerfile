FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY api/package*.json api/
COPY web/package*.json web/
RUN npm ci
COPY . .
RUN npm run db:generate && npm run build -w api

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/api/dist ./api/dist
COPY --from=build /app/api/prisma ./api/prisma
COPY --from=build /app/api/package.json ./api/package.json
EXPOSE 3000
CMD ["node", "api/dist/main.js"]
