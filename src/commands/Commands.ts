import {Command} from "./Command";
import {GuildMember, SlashCommandBuilder} from "discord.js";


export const COMMANDS: Command[] = [
  {
    data: new SlashCommandBuilder()
      .setName("join")
      .setDescription("Join your channel."),
    execute(interaction, bot) {
      return bot.getGuildMusicManager(interaction.guild).join((interaction.member as GuildMember).voice.channel);
    }
  }, {
    data: new SlashCommandBuilder()
      .setName("leave")
      .setDescription("Leave current channel."),
    execute(interaction, bot) {
      return bot.getGuildMusicManager(interaction.guild).leave();
    }
  }, {
    data: new SlashCommandBuilder()
      .setName("musicpanel")
      .setDescription("TODO"),
    execute(interaction, bot) {
      return bot.getGuildMusicManager(interaction.guild).displayMusicPanel(interaction.channel);
    }
  }, {
    data: new SlashCommandBuilder()
      .setName("pause")
      .setDescription("Pauses the song"),
    execute(interaction, bot) {
      return bot.getGuildMusicManager(interaction.guild).pause();
    }
  }, {
    data: new SlashCommandBuilder()
      .setName("play")
      .setDescription("TODO"),
    // TODO
    execute(interaction, bot) {
    }
  }, {
    data: new SlashCommandBuilder()
      .setName("player")
      .setDescription("Get the Player Url for this Guild. " + process.env.URL + "/guilds"),
    execute(interaction, bot) {
      return bot.getGuildMusicManager(interaction.guild).getPlayerUrl(interaction.user.id);
    }
  }, {
    data: new SlashCommandBuilder()
      .setName("resume")
      .setDescription("Resumes the song"),
    execute(interaction, bot) {
      return bot.getGuildMusicManager(interaction.guild).resume();
    }
  }, {
    data: new SlashCommandBuilder()
      .setName("skip")
      .setDescription("WIP: Skip to the next/previous song or beginning of the song"),
    // TODO args
    execute(interaction, bot) {
      return bot.getGuildMusicManager(interaction.guild).skip();
    }
  },
];
