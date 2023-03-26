import {Command} from "./Command";
import {ChatInputCommandInteraction, escapeMarkdown, GuildMember, SlashCommandBuilder} from "discord.js";
import {TrackInfo} from "../music/TrackInfo";
import {Bot} from "../Bot";
import {SlashCommandStringOption} from "@discordjs/builders";

function toArray(trackInfo: TrackInfo | TrackInfo[]): TrackInfo[] {
  if (Array.isArray(trackInfo)) {
    return trackInfo;
  }
  return [trackInfo];
}

async function now(interaction: ChatInputCommandInteraction, bot: Bot) {
  const url = interaction.options.getString("url", true);
  const trackInfos = toArray(await bot.getGuildMusicManager(interaction.guild).playNow(url, (interaction.member as GuildMember).voice.channel));
  if (trackInfos.length === 0) {
    return "No song found.";
  }
  return escapeMarkdown(`Playing "${trackInfos[0].title}"${trackInfos.length > 1 ? ` and added ${trackInfos.length - 1} more to play next` : ""}.`);
}

async function next(interaction: ChatInputCommandInteraction, bot: Bot) {
  const url = interaction.options.getString("url", true);
  const trackInfos = toArray(await bot.getGuildMusicManager(interaction.guild).playNext(url));
  if (trackInfos.length === 0) {
    return "No song found.";
  }
  return escapeMarkdown(`Added "${trackInfos[0].title}"${trackInfos.length > 1 ? ` and ${trackInfos.length - 1} more` : ""} to play next.`);
}

async function queue(interaction: ChatInputCommandInteraction, bot: Bot) {
  const url = interaction.options.getString("url", true);
  const trackInfos = toArray(await bot.getGuildMusicManager(interaction.guild).queue(url));
  if (trackInfos.length === 0) {
    return "No song found.";
  }
  return escapeMarkdown(`Appended "${trackInfos[0].title}"${trackInfos.length > 1 ? ` and ${trackInfos.length - 1} more` : ""} to queue.`);
}

function urlOption() {
  return (option: SlashCommandStringOption) =>
    option.setName("url")
      .setDescription("A url or search term.")
      .setRequired(true)
      .setMinLength(1);
}

export const PLAY_COMMANDS: Command[] = [
  {
    data: new SlashCommandBuilder()
      .setName("play")
      .setDescription("Play a song now.")
      .addStringOption(urlOption())
      .addStringOption(option =>
        option.setName("when")
          .setDescription("When to play it. (Default: now)")
          .setRequired(false)
          .setChoices(
            {
              name: "now",
              value: "now"
            }, {
              name: "next",
              value: "next"
            }, {
              name: "queue",
              value: "queue"
            }
          )
      ),
    async execute(interaction, bot) {
      const when = interaction.options.getString("when", false);
      if (when === "next") {
        return await next(interaction, bot);
      } else if (when === "queue") {
        return await queue(interaction, bot);
      } else {
        return await now(interaction, bot);
      }
    }
  }, {
    data: new SlashCommandBuilder()
      .setName("now")
      .setDescription("Play a song.")
      .addStringOption(urlOption()),
    async execute(interaction, bot) {
      return await now(interaction, bot);
    }
  }, {
    data: new SlashCommandBuilder()
      .setName("next")
      .setDescription("Play a song next.")
      .addStringOption(urlOption()),
    async execute(interaction, bot) {
      return await next(interaction, bot);
    }
  }, {
    data: new SlashCommandBuilder()
      .setName("queue")
      .setDescription("Append a song to the queue.")
      .addStringOption(urlOption()),
    async execute(interaction, bot) {
      return await queue(interaction, bot);
    }
  }
];
