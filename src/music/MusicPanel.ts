import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
  escapeMarkdown, GuildMember,
  MessageCreateOptions,
  MessageEditOptions
} from "discord.js";
import {TrackScheduler} from "./TrackScheduler";
import {MessageActionRowComponentBuilder} from "@discordjs/builders";
import {GuildMusicManager} from "./GuildMusicManager";
import {TrackSchedulerObserverPanel} from "./TrackSchedulerObserverPanel";

export class MusicPanel extends TrackSchedulerObserverPanel {
  private static readonly PREVIOUS = "previous";
  private static readonly RESTART = "restart";
  private static readonly PAUSE_RESUME = "pause";
  private static readonly SKIP = "skip";
  private static readonly REPEAT = "repeat";
  private static readonly RADIO = "radio";
  private static readonly VOLUME_UP = "vol_up";
  private static readonly VOLUME_DOWN = "vol_down";
  private static readonly JOIN = "join";
  private static readonly LEAVE = "leave";

  constructor(trackScheduler: TrackScheduler, private musicManager: GuildMusicManager) {
    super(trackScheduler);
  }

  protected buildTrackMessage(trackScheduler: TrackScheduler): MessageCreateOptions & MessageEditOptions {
    const currentlyPlaying = trackScheduler.getCurrentlyPlaying();
    const embed = new EmbedBuilder()
      .setTitle("Music Panel")
      .setColor("#0099ff");
    if (currentlyPlaying && currentlyPlaying.type) {
      embed.addFields(
        {name: "Title", value: escapeMarkdown(currentlyPlaying.title)},
        {name: "Artist", value: escapeMarkdown(currentlyPlaying.artist), inline: true},
        {name: "Volume", value: String(currentlyPlaying.volume), inline: true},
        {name: "Url", value: currentlyPlaying.url}
      ).setThumbnail(currentlyPlaying.thumbnailUrl);
    }
    const tracks = trackScheduler.getTracks().slice(0, 3);
    let trackList = tracks.map(track => escapeMarkdown(`${track.id}. ${track.title}`)).join("\n");
    if (trackList.length === 0) {
      trackList = " ";
    }
    embed.addFields({name: "Up next", value: trackList})
    const row1 = new ActionRowBuilder<MessageActionRowComponentBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(MusicPanel.RESTART)
          .setEmoji("↪")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(MusicPanel.PREVIOUS)
          .setEmoji("⏮")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(MusicPanel.PAUSE_RESUME)
          .setEmoji(currentlyPlaying.paused ? "▶" : "⏸")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(MusicPanel.SKIP)
          .setEmoji("⏭")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(MusicPanel.JOIN)
          .setLabel("Join")
          .setStyle(ButtonStyle.Success)
      );

    const row2 = new ActionRowBuilder<MessageActionRowComponentBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(MusicPanel.REPEAT)
          .setEmoji("🔁")
          .setStyle(trackScheduler.getRepeat() ? ButtonStyle.Primary : ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(MusicPanel.RADIO)
          .setEmoji("📻")
          .setStyle(trackScheduler.getAutoRadio() ? ButtonStyle.Primary : ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(MusicPanel.VOLUME_DOWN)
          .setEmoji("🔉")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(MusicPanel.VOLUME_UP)
          .setEmoji("🔊")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(MusicPanel.LEAVE)
          .setLabel("Leave")
          .setStyle(ButtonStyle.Danger)
      )
    return {embeds: [embed], components: [row1, row2]};
  }

  protected async handleButtonInteraction(id: string, interaction: ButtonInteraction): Promise<void> {
    switch (interaction.customId) {
      case MusicPanel.PREVIOUS:
        this.musicManager.skipBack();
        break;
      case MusicPanel.RESTART:
        this.musicManager.restart();
        break;
      case MusicPanel.PAUSE_RESUME:
        this.musicManager.togglePause();
        break;
      case MusicPanel.SKIP:
        await this.musicManager.skip();
        break;
      case MusicPanel.REPEAT:
        await this.musicManager.toggleRepeat();
        break;
      case MusicPanel.RADIO:
        await this.musicManager.toggleRadio();
        break;
      case MusicPanel.VOLUME_DOWN:
        await this.musicManager.setVolume(this.musicManager.getCurrentTrack().volume - 5);
        break;
      case MusicPanel.VOLUME_UP:
        await this.musicManager.setVolume(this.musicManager.getCurrentTrack().volume + 5);
        break;
      case MusicPanel.JOIN:
        await this.musicManager.join((interaction.member as GuildMember).voice.channel);
        break;
      case MusicPanel.LEAVE:
        await this.musicManager.leave();
        break;
      default:
        console.error(`Unexpected interaction: ` + interaction.customId);
    }
  }
}
