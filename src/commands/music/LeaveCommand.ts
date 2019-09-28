import {Message, VoiceConnection} from "discord.js";
import {CommandMessage, CommandoClient} from "discord.js-commando";
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

  public runSafe(message: CommandMessage, args: any, fromPattern: boolean): Promise<any> | void {
    this.bot.getGuildMusicManager(message.guild).leave();
  }
}
