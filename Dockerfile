FROM node:18

WORKDIR /workspace/vrcarena-web

COPY package*.json ./

RUN npm install --legacy-peer-deps
