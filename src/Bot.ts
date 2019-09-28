import {Guild, Snowflake} from "discord.js";
import {CommandoClient} from "discord.js-commando";
import {JoinCommand} from "./commands/JoinCommand";
import {LeaveCommand} from "./commands/LeaveCommand";
import {PauseCommand} from "./commands/PauseCommand";
import {PlayCommand} from "./commands/PlayCommand";
import {QueueCommand} from "./commands/QueueCommand";
import {ResumeCommand} from "./commands/ResumeCommand";
import {SkipCommand} from "./commands/SkipCommand";
import {GuildMusicManager} from "./music/GuildMusicManager";

export class Bot {

  private commandoClient: CommandoClient;
  private musicManagers = new Map<Snowflake, GuildMusicManager>();

  public start(token: string, owner: string) {
    this.commandoClient = new CommandoClient({owner, commandPrefix: "!"});
    this.commandoClient.registry
      .registerGroups([
        ["music", "Music"]
      ])
      .registerDefaultGroups()
      .registerDefaultTypes()
      .registerDefaultCommands({ping: false})
      .registerCommands([
        new PlayCommand(this), new JoinCommand(this), new LeaveCommand(this),
        new QueueCommand(this), new SkipCommand(this), new PauseCommand(this),
        new ResumeCommand(this)
      ]);
    this.commandoClient.login(token);
  }

  public get client(): CommandoClient {
    return this.commandoClient;
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
