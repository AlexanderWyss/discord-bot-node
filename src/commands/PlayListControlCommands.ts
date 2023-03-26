import {Command} from "./Command";
import {SlashCommandBuilder} from "discord.js";

export const PLAYLIST_CONTROL_COMMANDS: Command[] = [
  {
    data: new SlashCommandBuilder()
      .setName("clear")
      .setDescription("Clear the current playlist"),
    execute(interaction, bot) {
      bot.getGuildMusicManager(interaction.guild).clearPlaylist();
      return "Playlist cleared.";
    }
  }, {
    data: new SlashCommandBuilder()
      .setName("remove")
      .setDescription("Remove current track from the playlist")
      .addIntegerOption(option =>
        option.setName("id")
          .setDescription("The song id, see with the musicpanel or list") // TODO convert to relative index -x (previous) 0 (current) +x(next)
          .setRequired(true)
      ),
    async execute(interaction, bot) {
      if (await bot.getGuildMusicManager(interaction.guild).removeTrackById(interaction.options.getInteger("id", true))) {
        return "Song removed.";
      }
      return "Song could not be removed.";
    }
  }, {
    data: new SlashCommandBuilder()
      .setName("list")
      .setDescription("Display the playlist."),
    async execute(interaction, bot) {
      bot.getGuildMusicManager(interaction.guild).displayPlaylistPanel(interaction.channel);
      return "Displaying playlist.";
    }
  },
];
