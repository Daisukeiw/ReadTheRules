FROM node:22-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
EXPOSE 3000
# aplica as migrations pendentes e sobe a API
CMD ["npm", "start"]
