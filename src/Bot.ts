import {Guild, Snowflake, VoiceState} from "discord.js";
import {CommandoClient} from "discord.js-commando";
import {JoinCommand} from "./commands/music/JoinCommand";
import {LeaveCommand} from "./commands/music/LeaveCommand";
import {MusicPanelCommand} from "./commands/music/MusicPanelCommand";
import {PauseCommand} from "./commands/music/PauseCommand";
import {PlayCommand} from "./commands/music/PlayCommand";
import {PlayerCommand} from "./commands/music/PlayerCommand";
import {ResumeCommand} from "./commands/music/ResumeCommand";
import {SkipCommand} from "./commands/music/SkipCommand";
import {GuildInfo} from "./music/GuildInfo";
import {GuildMusicManager} from "./music/GuildMusicManager";

export class Bot {

  public get client(): CommandoClient {
    return this.commandoClient;
  }

  public static getInstance(): Bot {
    if (!this.bot) {
      this.bot = new Bot();
      const token = process.env.TOKEN;
      const owner = process.env.OWNER;
      this.bot.start(token, owner);
    }
    return this.bot;
  }

  public static start() {
    this.getInstance();
  }

  private static bot: Bot;

  private commandoClient: CommandoClient;
  private musicManagers = new Map<Snowflake, GuildMusicManager>();

  private constructor() {

  }

  public start(token: string, owner: string) {
    this.commandoClient = new CommandoClient({owner, commandPrefix: process.env.PREFIX});
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
        new MusicPanelCommand(this), new PlayerCommand(this)
      ]);
    this.commandoClient.login(token).then(success => {
      this.commandoClient.user.setActivity(this.commandoClient.commandPrefix + "Help").catch(err => console.error("Set Activity failed: " + err));
      console.log("Logged in");
      this.commandoClient.on('voiceStateUpdate', (oldState: VoiceState | undefined, newState: VoiceState) => {
        try {
          this.getGuildMusicManager(newState.guild).onUserChangeVoiceState();
        } catch (err) {
          console.error(err);
        }
      });
    }, error => console.error("Login failed: " + error));
    process.on("exit", () => {
      this.close();
    });
    process.on("SIGINT", () => {
      this.close();
      process.exit();
    });
    process.on("SIGHUP", () => {
      this.close();
      process.exit();
    });
    process.on("SIGTERM", () => {
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

  public getGuildMusicManagerById(guildId: Snowflake): GuildMusicManager {
    const guild = this.client.guilds.resolve(guildId);
    if (guild) {
      return this.getGuildMusicManager(guild);
    } else {
      throw new Error("Guild not available.");
    }
  }

  public getGuildMusicManagerByIdIfExists(guildId: Snowflake): GuildMusicManager {
    if (this.musicManagers.has(guildId)) {
      return this.musicManagers.get(guildId);
    } else {
      throw new Error("Guild not available.");
    }
  }

  public getGuilds(): GuildInfo[] {
    return this.client.guilds.cache.map(guild => {
      return {
        id: guild.id,
        name: guild.name,
        icon: guild.iconURL()
      };
    });
  }

  private close() {
    this.closeMusicManagers();
    this.client.destroy();
  }

  private closeMusicManagers() {
    for (const musicManager of this.musicManagers.values()) {
      musicManager.close();
    }
  }
}
