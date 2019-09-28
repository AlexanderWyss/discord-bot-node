import {CommandMessage} from "discord.js-commando";
import {Bot} from "../../Bot";
import {SafeCommand} from "../SafeCommand";

export class PlayCommand extends SafeCommand {

  public constructor(private bot: Bot) {
    super(bot.client, {
      name: "play",
      group: "music",
      memberName: "play",
      description: "Play a song",
      examples: ["play https://www.youtube.com/watch?v=dQw4w9WgXcQ", "play https://www.youtube.com/watch?v=dQw4w9WgXcQ next"],
      args: [
        {
          key: "url",
          prompt: "What song do you want to play?",
          type: "string"
        }, {
          key: "nowOrNext",
          default: "now",
          type: "string",
          prompt: "",
          oneOf: ["now", "next"]
        }
      ]
    });
  }

  public runSafe(message: CommandMessage, args: any, fromPattern: boolean): Promise<any> {
    if (args.nowOrNext === "next") {
      console.log("Next");
      return this.bot.getGuildMusicManager(message.guild).playNext(args.url);
    }
    return this.bot.getGuildMusicManager(message.guild).playNow(args.url, message.member.voiceChannel);
  }
}
