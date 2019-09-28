import {CommandMessage} from "discord.js-commando";
import {Bot} from "../../Bot";
import {SafeCommand} from "../SafeCommand";

export class SkipCommand extends SafeCommand {

  public constructor(private bot: Bot) {
    super(bot.client, {
      name: "skip",
      group: "music",
      memberName: "skip",
      description: "Skip to the next/previous song or beginning of the song",
      examples: ["skip"],
      args: [
        {
          key: "backOrStart",
          label: "next (default) | back | start",
          default: "next",
          type: "string",
          prompt: "",
          oneOf: ["next", "back", "start"]
        }
      ]
    });
  }

  public runSafe(message: CommandMessage, args: any, fromPattern: boolean): Promise<any> | void {
    if (args.backOrStart == "back") {
      this.bot.getGuildMusicManager(message.guild).skipBack();
    } else if (args.backOrStart == "start") {
      this.bot.getGuildMusicManager(message.guild).restart();
    } else {
      this.bot.getGuildMusicManager(message.guild).skip();
    }
  }
}
