import {Guild, Snowflake} from "discord.js";
import {CommandoClient} from "discord.js-commando";
import {JoinCommand} from "./commands/music/JoinCommand";
import {LeaveCommand} from "./commands/music/LeaveCommand";
import {PauseCommand} from "./commands/music/PauseCommand";
import {PlayCommand} from "./commands/music/PlayCommand";
import {QueueCommand} from "./commands/music/QueueCommand";
import {ResumeCommand} from "./commands/music/ResumeCommand";
import {SkipCommand} from "./commands/music/SkipCommand";
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
