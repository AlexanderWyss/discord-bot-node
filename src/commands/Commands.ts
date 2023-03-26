import {Command} from "./Command";
import {GuildMember, SlashCommandBuilder} from "discord.js";

export const COMMANDS: Command[] = [
  {
    data: new SlashCommandBuilder()
      .setName("join")
      .setDescription("Join your channel."),
    execute(interaction, bot) {
      bot.getGuildMusicManager(interaction.guild).join((interaction.member as GuildMember).voice.channel);
      return "Joined.";
    }
  }, {
    data: new SlashCommandBuilder()
      .setName("leave")
      .setDescription("Leave current channel."),
    execute(interaction, bot) {
      bot.getGuildMusicManager(interaction.guild).leave();
      return "Bye bye.";
    }
  }, {
    data: new SlashCommandBuilder()
      .setName("player")
      .setDescription("Get the Url to the webinterface for this guild. " + process.env.URL + "/guilds"),
    execute(interaction, bot) {
      return bot.getGuildMusicManager(interaction.guild).getPlayerUrl(interaction.user.id);
    }
  },
];
