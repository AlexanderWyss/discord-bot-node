import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ComponentType,
  EmbedBuilder, italic,
  MessageCreateOptions,
  MessageEditOptions,
  escapeMarkdown
} from "discord.js";
import {TrackInfo} from "./TrackInfo";
import {TrackScheduler} from "./TrackScheduler";
import {GuildMusicManager} from "./GuildMusicManager";
import {TrackSchedulerObserverPanel} from "./TrackSchedulerObserverPanel";
import {MessageActionRowComponentBuilder} from "@discordjs/builders";

export class PlaylistPanel extends TrackSchedulerObserverPanel {
  private readonly tracksPerPage = 15;
  private readonly stepSize = 10;
  private currentIndex = 0;


  constructor(trackScheduler: TrackScheduler, private musicManager: GuildMusicManager) {
    super(trackScheduler);
  }

  protected buildTrackMessage(trackScheduler: TrackScheduler): MessageCreateOptions & MessageEditOptions {
    const embed = new EmbedBuilder()
      .setTitle("Playlist Panel")
      .setColor("#0099ff");
    const previousTracks = trackScheduler.getPreviousTracks().slice().reverse();
    const nextTracks = trackScheduler.getTracks();
    this.currentIndex = Math.max(this.currentIndex, previousTracks.length * -1);
    this.currentIndex = Math.min(this.currentIndex, Math.max(nextTracks.length - this.tracksPerPage, 0));
    let remainingTracks = this.tracksPerPage;
    if (this.currentIndex < 0) {
      const fromIndex = previousTracks.length + this.currentIndex;
      const toIndex = Math.min(fromIndex + remainingTracks, previousTracks.length);
      const previousToDisplay = previousTracks.slice(fromIndex, toIndex);
      remainingTracks -= previousToDisplay.length;
      embed.addFields({
        name: "Previous",
        value: this.buildText(fromIndex, toIndex, previousTracks.length, previousToDisplay)
      });
    } else {
      embed.addFields({
        name: "Previous",
        value: italic(`${previousTracks.length} songs`)
      });
    }
    embed.addFields({name: "Currently", value: this.trackToString(trackScheduler.getCurrentlyPlaying())});
    if (this.currentIndex + this.tracksPerPage >= 0 && remainingTracks > 0 && nextTracks.length > 0) {
      const fromIndex = Math.max(this.currentIndex, 0);
      const toIndex = Math.min(fromIndex + remainingTracks, nextTracks.length);
      const nextTracksToDisplay = nextTracks.slice(fromIndex, toIndex);
      embed.addFields({
        name: "Up next",
        value: this.buildText(fromIndex, toIndex, nextTracks.length, nextTracksToDisplay)
      });
    } else {
      embed.addFields({
        name: "Up next",
        value: italic(`${nextTracks.length} songs`)
      });
    }

    const buttons = new ActionRowBuilder<MessageActionRowComponentBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId("back")
          .setEmoji("⬅")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId("start")
          .setEmoji("⏺")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId("next")
          .setEmoji("➡")
          .setStyle(ButtonStyle.Secondary)
      );
    return {embeds: [embed], components: [buttons]};
  }

  private buildText(fromIndex: number, toIndex: number, totalLength: number, previousToDisplay: TrackInfo[]) {
    let previousMoreText = "";
    if (fromIndex > 0) {
      previousMoreText = italic(`...+${fromIndex} songs`) + "\n";
    }
    let afterMoreText = "";
    if (toIndex < totalLength) {
      afterMoreText = "\n" + italic(`...+${totalLength - toIndex} songs`);
    }
    return `${previousMoreText}${this.tracksToString(previousToDisplay)}${afterMoreText}`;
  }

  private tracksToString(tracks: TrackInfo[]) {
    let trackList = tracks.map(track => this.trackToString(track)).join("\n");
    if (trackList.length === 0) {
      trackList = " ";
    }
    return trackList;
  }

  private trackToString(track: TrackInfo) {
    if (track && track.id != null) {
      return escapeMarkdown(`${track.id}. ${track.title}`);
    } else {
      return " ";
    }
  }

  protected async handleButtonInteraction(id: string, interaction: ButtonInteraction): Promise<void> {
    switch (id) {
      case "next":
        this.currentIndex += this.stepSize;
        break;
      case "back":
        this.currentIndex -= this.stepSize;
        break;
      case "start":
        this.currentIndex = 0;
        break;
      default:
        console.error(`Unexpected interaction: ` + id);
    }
    this.update();
  }
}
