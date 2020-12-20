FROM node:12
WORKDIR /usr/src/app
COPY dist/ dist/
COPY bin/ bin/
COPY package*.json ./
RUN npm ci --production
CMD [ "node", "./bin/www" ]
