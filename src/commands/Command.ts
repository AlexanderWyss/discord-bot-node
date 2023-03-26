import {ChatInputCommandInteraction, REST, Routes, TextInputStyle} from "discord.js";
import {SharedNameAndDescription} from "@discordjs/builders";
import {RESTPostAPIChatInputApplicationCommandsJSONBody} from "discord-api-types/v10";
import {COMMANDS} from "./Commands";
import {Bot} from "../Bot";
import {PLAY_COMMANDS} from "./PlayCommands";
import {MUSIC_CONTROL_COMMANDS} from "./MusicControlCommands";
import {PLAYLIST_CONTROL_COMMANDS} from "./PlayListControlCommands";

export type CommandExecutable = (interaction: ChatInputCommandInteraction, bot: Bot) => string | void | Promise<string | void>;
export type CommandBuilder = SharedNameAndDescription & { toJSON(): RESTPostAPIChatInputApplicationCommandsJSONBody };

export interface Command {
  data: CommandBuilder;
  execute: CommandExecutable;
}

export class CommandManager {
  private static readonly COMMANDS: Command[] = [...COMMANDS, ...PLAY_COMMANDS, ...MUSIC_CONTROL_COMMANDS, ...PLAYLIST_CONTROL_COMMANDS];
  private readonly commands = new Map<string, Command>();

  constructor(private token: string) {
    for (const command of CommandManager.COMMANDS) {
      this.commands.set(command.data.name, command);
    }
  }

  public execute(interaction: ChatInputCommandInteraction, bot: Bot) {
    return this.getCommand(interaction.commandName).execute(interaction, bot);
  }

  private getCommand(command: string): Command {
    if (this.commands.has(command)) {
      return this.commands.get(command);
    } else {
      throw new Error("Unknown command.");
    }
  }

  public async registerCommands(guildId: string, botUserId: string): Promise<void> {
    console.log(`Registering commands for guild ${guildId}.`);
    const rest = new REST({version: '10'}).setToken(this.token);
    try {
      const data = await rest.put(
        Routes.applicationGuildCommands(botUserId, guildId),
        {body: CommandManager.COMMANDS.map(command => command.data.toJSON())},
      ) as any;

      console.log(`Successfully registered ${data.length} commands.`);
    } catch (error) {
      console.error(error);
    }
  }
}
