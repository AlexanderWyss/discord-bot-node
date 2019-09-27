import {Message} from "discord.js";
import {Command, CommandInfo, CommandMessage, CommandoClient} from "discord.js-commando";

export abstract class SafeCommand extends Command {

  protected constructor(client: CommandoClient, info: CommandInfo) {
    super(client, info);
  }

  public run(message: CommandMessage, args: object | string | string[], fromPattern: boolean): Promise<Message | Message[]> {
    try {
      const promise = this.runSafe(message, args, fromPattern);
      if (promise) {
        (promise as Promise<any>).catch(e => {
          console.log(e);
          return message.reply(e.toString());
        });
      }
    } catch (e) {
      return message.reply(e.toString());
    }
    return;
  }

  public abstract runSafe(message: CommandMessage, args: object | string | string[], fromPattern: boolean): Promise<any> | void;
}
