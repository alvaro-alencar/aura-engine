FROM node:22-alpine AS base

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

EXPOSE 8787

ENV PORT=8787

CMD ["npm", "run", "server"]
