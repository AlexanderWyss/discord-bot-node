import {Command} from "./Command";
import {GuildMember, SlashCommandBuilder} from "discord.js";
import {TrackInfo} from "../music/TrackInfo";


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
      .setName("musicpanel")
      .setDescription("Display music control panel."),
    execute(interaction, bot) {
      bot.getGuildMusicManager(interaction.guild).displayMusicPanel(interaction.channel);
      return "Displaying music panel.";
    }
  }, {
    data: new SlashCommandBuilder()
      .setName("pause")
      .setDescription("Pauses the song."),
    execute(interaction, bot) {
      bot.getGuildMusicManager(interaction.guild).pause();
      return "Paused.";
    }
  }, {
    data: new SlashCommandBuilder()
      .setName("play")
      .setDescription("Play a song now, next or append to queue.")
      .addStringOption(option =>
        option.setName("url")
          .setDescription("A url or search term.")
          .setRequired(true)
          .setMinLength(1)
      )
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
      const options = interaction.options;
      const url = options.getString("url", true);
      const when = options.getString("when", false);
      let trackInfos: TrackInfo | TrackInfo[];
      if (when === "next") {
        trackInfos = await bot.getGuildMusicManager(interaction.guild).playNext(url);
      } else if (when === "queue") {
        trackInfos = await bot.getGuildMusicManager(interaction.guild).queue(url);
      } else {
        trackInfos = await bot.getGuildMusicManager(interaction.guild).playNow(url, (interaction.member as GuildMember)?.voice?.channel);
      }
      let additionalTracks: number;
      let trackInfo: TrackInfo;
      if (Array.isArray(trackInfos)) {
        if (trackInfos.length > 0) {
          trackInfo = trackInfos[0];
        } else {
          return "No songs in list.";
        }
        additionalTracks = trackInfos.length - 1;
      } else {
        trackInfo = trackInfos;
        additionalTracks = 0;
      }
      if (when === "next") {
        return `Added "${trackInfo.title}"${additionalTracks > 0 ? ` and ${additionalTracks} more` : ""} to play next.`;
      }
      if (when === "queue") {
        return `Appended "${trackInfo.title}"${additionalTracks > 0 ? ` and ${additionalTracks} more` : ""} to queue.`;
      }
      return `Playing "${trackInfo.title}"${additionalTracks > 0 ? ` and added ${additionalTracks} more to play next` : ""}.`;
    }
  }, {
    data: new SlashCommandBuilder()
      .setName("player")
      .setDescription("Get the Url to the webinterface for this guild. " + process.env.URL + "/guilds"),
    execute(interaction, bot) {
      return bot.getGuildMusicManager(interaction.guild).getPlayerUrl(interaction.user.id);
    }
  }, {
    data: new SlashCommandBuilder()
      .setName("resume")
      .setDescription("Resumes the song."),
    execute(interaction, bot) {
      bot.getGuildMusicManager(interaction.guild).resume();
      return "Resumed.";
    }
  }, {
    data: new SlashCommandBuilder()
      .setName("skip")
      .setDescription("Skip to the next song."),
    async execute(interaction, bot) {
      await bot.getGuildMusicManager(interaction.guild).skip();
      return "Skipped.";
    }
  }, {
    data: new SlashCommandBuilder()
      .setName("previous")
      .setDescription("Skip to the previous song."),
    execute(interaction, bot) {
      bot.getGuildMusicManager(interaction.guild).skipBack();
      return "Going back.";
    }
  }, {
    data: new SlashCommandBuilder()
      .setName("restart")
      .setDescription("Restart the current song."),
    execute(interaction, bot) {
      bot.getGuildMusicManager(interaction.guild).restart();
      return "Restarting song.";
    }
  },
];
