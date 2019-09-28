import {CommandMessage, CommandoClient} from "discord.js-commando";
import {Bot} from "../../Bot";
import {SafeCommand} from "../SafeCommand";

export class PauseCommand extends SafeCommand {

  public constructor(private bot: Bot) {
    super(bot.client, {
      name: "pause",
        group: "music",
        memberName: "pause",
        description: "Pauses the song",
        examples: ["pause"]
    });
  }

  public runSafe(message: CommandMessage, args: any, fromPattern: boolean): Promise<any> | void {
    this.bot.getGuildMusicManager(message.guild).pause();
  }
}
