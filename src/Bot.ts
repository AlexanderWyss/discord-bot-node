import {Guild, Snowflake} from "discord.js";
import {CommandoClient} from "discord.js-commando";
import {JoinCommand} from "./commands/music/JoinCommand";
import {LeaveCommand} from "./commands/music/LeaveCommand";
import {MusicPanelCommand} from "./commands/music/MusicPanelCommand";
import {PauseCommand} from "./commands/music/PauseCommand";
import {PlayCommand} from "./commands/music/PlayCommand";
import {ResumeCommand} from "./commands/music/ResumeCommand";
import {SkipCommand} from "./commands/music/SkipCommand";
import {GuildMusicManager} from "./music/GuildMusicManager";
import {MusicPanel} from "./music/MusicPanel";

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
        new SkipCommand(this), new PauseCommand(this), new ResumeCommand(this),
        new MusicPanelCommand(this)
      ]);
    this.commandoClient.login(token).then(success => console.log("Logged in"), error => console.log("Login failed: " + error));
    process.on("exit", () => {
      this.close();
    });
    process.on("SIGINT", () => {
      this.close();
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

  private close() {
    this.closeMusicManagers();
    this.client.destroy().then((success => console.log("client destoryed")));
  }

  private closeMusicManagers() {
    for (const musicManager of this.musicManagers.values()) {
      musicManager.close();
    }
  }
}
