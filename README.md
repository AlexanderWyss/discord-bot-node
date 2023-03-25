# Discord Music Bot with Website

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

## Deploy with replit
Replit is a free and easy way to deploy the bot for yourself.

This project was not designed for replit. The provided configuration is only meant to deploy it.

With the free version you may be limited by the available resources. 
The client cannot be built because it will run out of ram. 
Due to this the client will automatically be downloaded from the releases of this git repo.

### Step by Step
1. Create a free replit account. [SignUp](https://replit.com/signup)
2. Follow the instructions of [Create bot, get token and add to Discord server](https://github.com/AlexanderWyss/discord-bot-node/blob/master/DiscordBotREADME.md)
3. [Deploy to replit](https://repl.it/github/AlexanderWyss/discord-bot-node)
4. Change Language from "TypeScript" to "Blank Repl" and Import from GitHub
![Web UI](https://raw.githubusercontent.com/AlexanderWyss/README-assets/master/replit_import.png)
5. Open Secrets in the Tools menu
![Secrets](https://raw.githubusercontent.com/AlexanderWyss/README-assets/master/replit_secrets.png)
6. Add following Secrets (key : value)
   - NODE_ENV : production
   - TOKEN : {token from step 2}
   - OWNER : {owner id from step 2}
   - URL : https://{replit name}.{replit username}.repl.co
     - eg. https://discord-bot-node.awyss.repl.co
       ![Run](https://raw.githubusercontent.com/AlexanderWyss/README-assets/master/replit_secrets_list.png)
7. Run
![Run](https://raw.githubusercontent.com/AlexanderWyss/README-assets/master/replit_run.png)
8. Be patient.
   - Once the message "Logged in" appears in the console it's running, and a webview should open automatically.
From this webview you can double check your configured URL.
9. Open Discord and go to the server you added the bot to in step 2.
10. Send "!RegisterCommands" to a text chat of that server.
    - In the replit console it should print "Successfully registered X commands."
11. Enjoy.
    - The very first song will take quite some time to load, after that the speed should be reasonable.


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
- Search YouTube
- Manage your playlist
- Seek in song
- Make the bot join a voice channel or leave it
- Light/Dark mode
- Adjust volume
- ...
![Web UI](https://raw.githubusercontent.com/AlexanderWyss/README-assets/master/discord-bot-node-web-ui.png)

### Keyboard Shortcuts:
* `<ctrl> + f` Focus search
* While searchbar focused:
    * `<enter>` Search
    * `<ctrl> + <enter>` Play first result now
    * `<ctrl> + <shift> + <enter>` Play first result next
    * `<shift> + <enter>` Queue first result

Tested with Firefox & Chrome.
