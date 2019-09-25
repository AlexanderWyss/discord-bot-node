import {CommandoClient} from "discord.js-commando";
import sqlite from "sqlite";

export class Bot {

  private client: CommandoClient;

  public start(token: string, owner: string) {
    this.client = new CommandoClient({owner, commandPrefix: "!"});
    this.client.registry
    // Registers your custom command groups
      .registerGroups([
      ])
      .registerDefaultGroups()
      .registerDefaultTypes()
      .registerDefaultCommands({prefix: false, ping: false})
      .registerCommands([]);
    this.client.login(token);
  }
}
