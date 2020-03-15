import {CommandoMessage} from "discord.js-commando";
import {Bot} from "../../Bot";
import {SafeCommand} from "../SafeCommand";

export class MusicPanelCommand extends SafeCommand {

  public constructor(private bot: Bot) {
    super(bot.client, {
      name: "musicpanel",
      group: "music",
      memberName: "musicpanel",
      description: "Display Music Control Panel",
      examples: ["musicpanel"]
    });
  }

  public runSafe(message: CommandoMessage, args: any, fromPattern: boolean): Promise<any> | void {
    this.bot.getGuildMusicManager(message.guild).displayMusicPanel(message.channel);
  }
}
