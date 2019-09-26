import {CommandoClient} from "discord.js-commando";
import sqlite from "sqlite";
import {PlayCommand} from "./commands/PlayCommand";

export class Bot {

  private client: CommandoClient;

  public start(token: string, owner: string) {
    this.client = new CommandoClient({owner, commandPrefix: "!"});
    this.client.registry
      .registerGroups([
        ["music", "Music"]
      ])
      .registerDefaultGroups()
      .registerDefaultTypes()
      .registerDefaultCommands({ping: false})
      .registerCommands([new PlayCommand(this.client)]);
    this.client.login(token);
  }
}
