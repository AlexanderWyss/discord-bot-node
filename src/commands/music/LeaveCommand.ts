import {CommandoMessage} from "discord.js-commando";
import {Bot} from "../../Bot";
import {SafeCommand} from "../SafeCommand";

export class LeaveCommand extends SafeCommand {

  public constructor(private bot: Bot) {
    super(bot.client, {
      name: "leave",
      group: "music",
      memberName: "leave",
      aliases: ["fuckoff"],
      description: "Leave current channel",
      examples: ["leave"]
    });
  }

  public runSafe(message: CommandoMessage, args: any, fromPattern: boolean): Promise<any> | void {
    this.bot.getGuildMusicManager(message.guild).leave();
  }
}
