import {Message} from "discord.js";
import {CommandMessage, CommandoClient} from "discord.js-commando";
import {Bot} from "../Bot";
import {SafeCommand} from "./SafeCommand";

export class PlayCommand extends SafeCommand {

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

  public runSafe(message: CommandMessage, args: any, fromPattern: boolean): Promise<any> {
    return this.bot.getGuildMusicManager(message.guild).playNow(args.url, message.member.voiceChannel);
  }
}
