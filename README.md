# Discord Music Bot with Webinterface

## Update to new Discord Api WIP some things are missing

## Demo
[Discord Server](https://discord.gg/7v9jSsukYw)

[Web UI](https://discord-demo.wyss.tech/player/790550663280459786)

## Build & Run

[Create bot, get token and add to Discord server](https://github.com/AlexanderWyss/discord-bot-node/blob/master/DiscordBotREADME.md)

Node.js 16.13.0 or newer is required.

Create .env file or set environment variables in commandline and add NODE_ENV=production to disable .env file.
```
TOKEN=<discord token>
OWNER=<Discord owner User Id>
URL=<url/ip of this server in format http(s)://foo.bar:port>
PORT=<port to start server on (Default 3000)>
DEFAULT_VOLUME=<0-150 (optional: default 20)>
RADIO_MAX_VIDEO_LENGTH=<length in seconds, 0 for no max length, Default: 600)
```

Build the server first then the client.
```
> npm install
> npm run build
client> npm install
client> npm run build:prod
> node ./bin/www
```

If the client was build without prod flag it will always access the server via localhost:3000 (for development).

## Docker
Or run with Docker:
```
docker run -d -p 80:80 --restart unless-stopped --name discord-bot-node -e NODE_ENV=production -e PORT=80 -e TOKEN=<discord token> -e OWNER=<discord owner id> -e URL=<url/ip e.g http(s)://foo.bar:port> alexanderwyss/discord-bot-node:latest
```
[Docker Hub](https://hub.docker.com/r/alexanderwyss/discord-bot-node)

## Slash Commands
Slash commands are a way to interact with the bot through discord. Start typing / to see a list of available commands.

The slash commands must initially be registered with "!RegisterCommands".
- It can only be done by the bot owner, as defined by the env variable OWNER.
- It can be done in any text channel of a guild.
- It must be done for every guild separately.
- It should be repeated after every update of the bot.

## Web UI
The Web UI can be used by multiple Users concurrently.
![Web UI](https://raw.githubusercontent.com/AlexanderWyss/README-assets/master/discord-bot-node-web-ui.png)

### Keyboard Shortcuts:
* `<ctrl> + f` Focus search
* While searchbar focused:
    * `<enter>` Search
    * `<ctrl> + <enter>` Play first result now
    * `<ctrl> + <shift> + <enter>` Play first result next
    * `<shift> + <enter>` Queue first result

Tested with Firefox & Chrome.
