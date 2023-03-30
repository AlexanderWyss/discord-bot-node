import {
  ChatInputCommandInteraction,
  Client,
  Events,
  GatewayIntentBits,
  Guild,
  Interaction,
  Message,
  Snowflake
} from "discord.js";
import {GuildInfo} from "./music/GuildInfo";
import {GuildMusicManager} from "./music/GuildMusicManager";
import {CommandManager} from "./commands/Command";

export class Bot {
  private commandManger: CommandManager;

  public static getInstance(): Bot {
    if (!this.bot) {
      this.bot = new Bot(process.env.OWNER);
      const token = process.env.TOKEN;
      this.bot.start(token);
    }
    return this.bot;
  }

  public static start() {
    this.getInstance();
  }

  private static bot: Bot;
  public client: Client;
  private musicManagers = new Map<Snowflake, GuildMusicManager>();

  private constructor(private ownerId: string) {

  }

  public start(token: string) {
    this.client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.MessageContent]});
    this.commandManger = new CommandManager(token);
    this.client.login(token).then(() => {
      console.log("Logged in");
      this.listenToInteractions();
      this.listenToMessages();
      this.client.on(Events.VoiceStateUpdate, (oldState, newState) => {
        try {
          this.getGuildMusicManager(newState.guild).onUserChangeVoiceState(newState.member.id === this.client.user.id);
        } catch (err) {
          console.error(err);
        }
      });
    }, (error: any) => console.error("Login failed: " + error));
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

  private listenToMessages() {
    this.client.on(Events.MessageCreate, async message => {
      try {
        await this.handleMessage(message);
      } catch (err) {
        console.error(err);
        await message.channel.send(err.message);
      }
    });
  }

  private async handleMessage(message: Message) {
    if (message.author.id === this.ownerId && message.content === "!RegisterCommands") {
      await this.commandManger.registerCommands(message.guildId, this.client.user.id);
    }
  }

  private listenToInteractions() {
    this.client.on(Events.InteractionCreate, async interaction => {
      console.log(`Discord interaction: \"${interaction.type}\" from user: ${interaction.user.id}`);
      try {
        if (interaction.isChatInputCommand()) {
          await interaction.deferReply({ephemeral: true});
          await this.handleChatInputCommand(interaction);
        }
      } catch (err) {
        console.error(err);
        await this.sendInteractionResponse(interaction, err.message);
      }
    });
  }

  private async sendInteractionResponse(interaction: Interaction, response: string) {
    if (interaction.isRepliable()) {
      await interaction.editReply(response);
    } else {
      interaction.channel.send(response);
    }
  }

  private async handleChatInputCommand(interaction: ChatInputCommandInteraction) {
    let response = this.commandManger.execute(interaction, this);
    if (response instanceof Promise) {
      response = await response;
    }
    if (typeof response === "string") {
      await interaction.editReply(response);
    } else {
      await interaction.editReply("Done.");
    }
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
      throw new Error(`Guild with id: '${guildId}' not available.`);
    }
  }

  public getGuildMusicManagerByIdIfExists(guildId: Snowflake): GuildMusicManager {
    if (this.musicManagers.has(guildId)) {
      return this.musicManagers.get(guildId);
    } else {
      throw new Error(`Guild with id: '${guildId}' not available.`);
    }
  }

  public getGuilds(): GuildInfo[] {
    return this.client.guilds.cache.map((guild: any) => {
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
