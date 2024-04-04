FROM node:21-alpine3.18
WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
COPY tsconfig.json ./
COPY ./src ./src
COPY ./data ./data
RUN npm install
RUN npm run build
ENTRYPOINT ["node", "./bin/smartReductor.js"]