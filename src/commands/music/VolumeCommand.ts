import {CommandMessage} from "discord.js-commando";
import {Bot} from "../../Bot";
import {SafeCommand} from "../SafeCommand";

export class VolumeCommand extends SafeCommand {

  public constructor(private bot: Bot) {
    super(bot.client, {
      name: "volume",
      group: "music",
      memberName: "volume",
      description: "Set the volume",
      examples: ["volume 1", "volume 0.5"],
      args: [
        {
          key: "volume",
          prompt: "What volume do you want to set?",
          type: "integer",
          min: 0,
          max: 200,
          default: -1
        },
      ]
    });
  }

  public runSafe(message: CommandMessage, args: any, fromPattern: boolean): Promise<any> | void {
    if (args.volume === -1) {
      return message.reply("Current Volume: " + this.bot.getGuildMusicManager(message.guild).getVolume() * 100);
    }
    this.bot.getGuildMusicManager(message.guild).setVolume(args.volume / 100);
  }
}
