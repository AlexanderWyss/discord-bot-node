FROM node:10
RUN apk add  --no-cache ffmpeg
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install

WORKDIR client
COPY client/package*.json ./
RUN npm install

WORKDIR ..
COPY . .
RUN npm run build --prod
WORKDIR client
RUN npm run build --prod
WORKDIR ..
CMD [ "node", "./bin/www" ]
