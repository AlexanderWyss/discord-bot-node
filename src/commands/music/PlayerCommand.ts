import {CommandoMessage} from "discord.js-commando";
import {Bot} from "../../Bot";
import {SafeCommand} from "../SafeCommand";

export class PlayerCommand extends SafeCommand {

  public constructor(private bot: Bot) {
    super(bot.client, {
      name: "player",
      group: "music",
      memberName: "player",
      description: "Get the Player Url for this Guild",
      examples: ["player"]
    });
  }

  public runSafe(message: CommandoMessage, args: any, fromPattern: boolean): Promise<any> {
    return message.reply(this.bot.getGuildMusicManager(message.guild).getPlayerUrl(message.author.id));
  }
}
