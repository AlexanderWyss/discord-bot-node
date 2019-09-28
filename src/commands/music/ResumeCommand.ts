import {CommandMessage, CommandoClient} from "discord.js-commando";
import {Bot} from "../../Bot";
import {SafeCommand} from "../SafeCommand";

export class ResumeCommand extends SafeCommand {

  public constructor(private bot: Bot) {
    super(bot.client, {
      name: "resume",
        group: "music",
        memberName: "resume",
        description: "Resumes the song",
        examples: ["resume"]
    });
  }

  public runSafe(message: CommandMessage, args: any, fromPattern: boolean): Promise<any> | void {
    this.bot.getGuildMusicManager(message.guild).resume();
  }
}
