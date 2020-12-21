FROM node:12
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci

WORKDIR client
COPY client/package*.json ./
RUN npm ci

WORKDIR ..
COPY . .
RUN npm run build
WORKDIR client
RUN npm run build:prod
WORKDIR ..
CMD [ "node", "./bin/www" ]
