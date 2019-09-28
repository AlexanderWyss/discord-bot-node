import {Guild, Snowflake} from "discord.js";
import {CommandoClient} from "discord.js-commando";
import {JoinCommand} from "./commands/music/JoinCommand";
import {LeaveCommand} from "./commands/music/LeaveCommand";
import {PauseCommand} from "./commands/music/PauseCommand";
import {PlayCommand} from "./commands/music/PlayCommand";
import {ResumeCommand} from "./commands/music/ResumeCommand";
import {SkipCommand} from "./commands/music/SkipCommand";
import {GuildMusicManager} from "./music/GuildMusicManager";

export class Bot {

  public get client(): CommandoClient {
    return this.commandoClient;
  }

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
        new SkipCommand(this), new PauseCommand(this), new ResumeCommand(this)
      ]);
    this.commandoClient.login(token);
    process.on("exit", () => {
      this.leaveAllVoiceChannels();
    });
    process.on("SIGINT", () => {
      this.leaveAllVoiceChannels();
      process.exit();
    });
  }

  public getGuildMusicManager(guild: Guild): GuildMusicManager {
    if (this.musicManagers.has(guild.id)) {
      return this.musicManagers.get(guild.id);
    }
    const musicManager = new GuildMusicManager(guild);
    this.musicManagers.set(guild.id, musicManager);
    return musicManager;
  }

  private leaveAllVoiceChannels() {
    for (const musicManager of this.musicManagers.values()) {
      musicManager.leave();
    }
  }
}
