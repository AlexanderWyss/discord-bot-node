# Discord Music Bot with Webinterface

Node.js 12.0.0 or newer is required.

Build the server first then the client.
```
> npm install
> npm run build --prod
client> npm install
client> npm run build --prod
> node ./bin/www
```

Create .env file or set environment variables in commandline and add NODE_ENV=production to disable .env file.

If you access the WebUI via localhost it will try to access the server on localhost:3000, for development.

## Docker
Or run with Docker:
```
docker run -d -p 80:80 --restart unless-stopped --name discord-bot-node -e NODE_ENV=production -e PORT=80 -e TOKEN=<discord token> -e OWNER=<discord owner id> -e URL=<url e.g http(s)://foo.bar> -e PREFIX=<prefix e.g !> alexanderwyss/discord-bot-node:latest
```
