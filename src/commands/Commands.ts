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
    // TODO
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
      .setDescription("Play a song now, next or append to queue")
      .addStringOption(option =>
        option.setName("url")
          .setDescription("What song do you want to play?")
          .setRequired(true)
          .setMinLength(1)
      )
      .addStringOption(option =>
        option.setName("nownextorqueue")
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
    execute(interaction, bot) {
      const options = interaction.options;
      const url = options.getString("url", true);
      const nowNextOrQueue = options.getString("nownextorqueue", false);
      if (nowNextOrQueue === "next") {
        return bot.getGuildMusicManager(interaction.guild).playNext(url);
      } else if (nowNextOrQueue === "queue") {
        return bot.getGuildMusicManager(interaction.guild).queue(url);
      }
      return bot.getGuildMusicManager(interaction.guild).playNow(url, (interaction.member as GuildMember)?.voice?.channel);
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
      .setDescription("Skip to the next song."),
    execute(interaction, bot) {
      return bot.getGuildMusicManager(interaction.guild).skip();
    }
  }, {
    data: new SlashCommandBuilder()
      .setName("previous")
      .setDescription("Skip to the previous song."),
    execute(interaction, bot) {
      return bot.getGuildMusicManager(interaction.guild).skipBack();
    }
  }, {
    data: new SlashCommandBuilder()
      .setName("restart")
      .setDescription("Restart the current song."),
    execute(interaction, bot) {
      return bot.getGuildMusicManager(interaction.guild).restart();
    }
  },
];
