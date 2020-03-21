FROM node:12
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
CMD [ "npm", "run", "start:prod" ]
