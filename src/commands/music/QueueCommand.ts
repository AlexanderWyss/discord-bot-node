import {Message} from "discord.js";
import {CommandMessage, CommandoClient} from "discord.js-commando";
import {Bot} from "../../Bot";
import {SafeCommand} from "../SafeCommand";

export class QueueCommand extends SafeCommand {

  public constructor(private bot: Bot) {
    super(bot.client, {
      name: "queue",
        group: "music",
        memberName: "queue",
        description: "Queues a song",
        examples: ["queue https://www.youtube.com/watch?v=dQw4w9WgXcQ"],
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
    return this.bot.getGuildMusicManager(message.guild).queue(args.url);
  }
}
