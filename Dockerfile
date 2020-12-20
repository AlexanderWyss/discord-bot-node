FROM node:12
WORKDIR /usr/src/app
RUN mkdir dist
COPY dist/ dist/
RUN mkdir bin
COPY bin/ bin/
COPY package*.json ./
RUN npm ci --production
CMD [ "node", "./bin/www" ]
