import {Guild, Snowflake} from "discord.js";
import {CommandoClient} from "discord.js-commando";
import {JoinCommand} from "./commands/JoinCommand";
import {LeaveCommand} from "./commands/LeaveCommand";
import {PlayCommand} from "./commands/PlayCommand";
import {QueueCommand} from "./commands/QueueCommand";
import {SkipCommand} from "./commands/SkipCommand";
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
      .registerCommands([
        new PlayCommand(this.client, this), new JoinCommand(this.client, this), new LeaveCommand(this.client, this),
        new QueueCommand(this.client, this), new SkipCommand(this.client, this)
      ]);
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
