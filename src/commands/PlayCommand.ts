import {Message} from "discord.js";
import {Command, CommandMessage, CommandoClient} from "discord.js-commando";
import {Bot} from "../Bot";

export class PlayCommand extends Command {

  public constructor(client: CommandoClient, private bot: Bot) {
    super(client, {
      name: "play",
      group: "music",
      memberName: "play",
      description: "Play a song",
      examples: ["play https://www.youtube.com/watch?v=dQw4w9WgXcQ"],
      args: [
        {
          key: "url",
          prompt: "What song do you want to play?",
          type: "string"
        }
      ]
    });
  }

  public run(message: CommandMessage, args: any, fromPattern: boolean): Promise<Message | Message[]> {
    const guildMusicManager = this.bot.getGuildMusicManager(message.guild);
    guildMusicManager.playNow(args.url, message.member.voiceChannel).catch(err => {
      console.log(err);
      message.reply(err);
    });
    return;
  }
}
