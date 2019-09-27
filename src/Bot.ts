import {Guild, Snowflake} from "discord.js";
import {CommandoClient} from "discord.js-commando";
import sqlite from "sqlite";
import {PlayCommand} from "./commands/PlayCommand";
import {GuildMusicManager} from "./music/GuildMusicManager";

export class Bot {

  private client: CommandoClient;
  private musicManagers = new Map<Snowflake, GuildMusicManager>();

  public start(token: string, owner: string) {
    this.client = new CommandoClient({owner, commandPrefix: "!"});
    this.client.registry
      .registerGroups([
        ["music", "Music"]
      ])
      .registerDefaultGroups()
      .registerDefaultTypes()
      .registerDefaultCommands({ping: false})
      .registerCommands([new PlayCommand(this.client, this)]);
    this.client.login(token);
  }

  public getGuildMusicManager(guild: Guild): GuildMusicManager {
    if (this.musicManagers.has(guild.id)) {
      return this.musicManagers.get(guild.id);
    }
    const musicManager = new GuildMusicManager(guild);
    this.musicManagers.set(guild.id, musicManager);
    return musicManager;
  }
}
