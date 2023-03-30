import {Command} from "./Command";
import {ChatInputCommandInteraction, GuildMember, SlashCommandBuilder} from "discord.js";
import {Bot} from "../Bot";
import {GuildMusicManager} from "../music/GuildMusicManager";

function tryJoin(interaction: ChatInputCommandInteraction, bot: Bot) {
  bot.getGuildMusicManager(interaction.guild).tryJoin((interaction.member as GuildMember).voice.channel);
}

function seek(musicManager: GuildMusicManager, seconds: number) {
  if (!musicManager.isVoiceConnected() || !musicManager.getCurrentTrack().url) {
    return "Nothing currently playing.";
  }
  seconds = Math.min(Math.max(seconds, 0), musicManager.getCurrentTrack().duration);
  musicManager.seek(seconds);
  return `Jumped to ${seconds}s.`;
}

export const MUSIC_CONTROL_COMMANDS: Command[] = [
  {
    data: new SlashCommandBuilder()
      .setName("pause")
      .setDescription("Pauses the song."),
    execute(interaction, bot) {
      bot.getGuildMusicManager(interaction.guild).pause();
      return "Paused.";
    }
  }, {
    data: new SlashCommandBuilder()
      .setName("resume")
      .setDescription("Resumes the song."),
    execute(interaction, bot) {
      tryJoin(interaction, bot);
      bot.getGuildMusicManager(interaction.guild).resume();
      return "Resumed.";
    }
  }, {
    data: new SlashCommandBuilder()
      .setName("skip")
      .setDescription("Skip to the next song."),
    async execute(interaction, bot) {
      tryJoin(interaction, bot);
      await bot.getGuildMusicManager(interaction.guild).skip();
      return "Skipped.";
    }
  }, {
    data: new SlashCommandBuilder()
      .setName("previous")
      .setDescription("Skip to the previous song."),
    execute(interaction, bot) {
      tryJoin(interaction, bot);
      bot.getGuildMusicManager(interaction.guild).skipBack();
      return "Going back.";
    }
  }, {
    data: new SlashCommandBuilder()
      .setName("restart")
      .setDescription("Restart the current song."),
    execute(interaction, bot) {
      tryJoin(interaction, bot);
      bot.getGuildMusicManager(interaction.guild).restart();
      return "Restarting song.";
    }
  }, {
    data: new SlashCommandBuilder()
      .setName("volume")
      .setDescription("Set the volume")
      .addIntegerOption(option => option.setName("volume")
        .setDescription("0 - 150")
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(150)
      ),
    execute(interaction, bot) {
      tryJoin(interaction, bot);
      const volume = interaction.options.getInteger("volume", true);
      bot.getGuildMusicManager(interaction.guild).setVolume(volume);
      return "Volume set to " + volume;
    }
  }, {
    data: new SlashCommandBuilder()
      .setName("seekfromstart")
      .setDescription("Seek in the song.")
      .addIntegerOption(option => option.setName("seconds")
        .setDescription("Seconds from start.")
        .setRequired(true)
        .setMinValue(0)
      ),
    execute(interaction, bot) {
      tryJoin(interaction, bot);
      const seconds = interaction.options.getInteger("seconds", true);
      const musicManager = bot.getGuildMusicManager(interaction.guild);
      return seek(musicManager, seconds);
    }
  }, {
    data: new SlashCommandBuilder()
      .setName("seek")
      .setDescription("Seek in the song relative to current position.")
      .addIntegerOption(option => option.setName("seconds")
        .setDescription("+/- seconds from current position.")
        .setRequired(true)
      ),
    execute(interaction, bot) {
      tryJoin(interaction, bot);
      const seconds = interaction.options.getInteger("seconds", true);
      const musicManager = bot.getGuildMusicManager(interaction.guild);
      const positionAfter = musicManager.getCurrentTrack().position + seconds;
      return seek(musicManager, positionAfter);
    }
  }, {
    data: new SlashCommandBuilder()
      .setName("musicpanel")
      .setDescription("Display music control panel."),
    execute(interaction, bot) {
      bot.getGuildMusicManager(interaction.guild).displayMusicPanel(interaction.channel);
      return "Displaying music panel.";
    }
  },
];
