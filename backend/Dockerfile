# Fashion Tinder Backend (NestJS)
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "start:dev"]
