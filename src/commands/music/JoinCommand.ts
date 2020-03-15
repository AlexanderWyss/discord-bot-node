import {CommandoMessage} from "discord.js-commando";
import {Bot} from "../../Bot";
import {SafeCommand} from "../SafeCommand";

export class JoinCommand extends SafeCommand {

  public constructor(private bot: Bot) {
    super(bot.client, {
      name: "join",
      group: "music",
      memberName: "join",
      description: "Join your channel",
      examples: ["join"]
    });
  }

  public runSafe(message: CommandoMessage, args: any, fromPattern: boolean): Promise<any> {
    return this.bot.getGuildMusicManager(message.guild).join(message.member.voice.channel);
  }
}
