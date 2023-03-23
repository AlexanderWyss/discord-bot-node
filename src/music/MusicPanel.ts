import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
  InteractionCollector,
  Message,
  MessageCreateOptions,
  MessageEditOptions,
  TextBasedChannel
} from "discord.js";
import he from "he";
import {TrackInfo} from "./TrackInfo";
import {TrackScheduler} from "./TrackScheduler";
import {TrackSchedulerObserver} from "./TrackSchedulerObserver";
import {MessageActionRowComponentBuilder} from "@discordjs/builders";
import {GuildMusicManager} from "./GuildMusicManager";

export class MusicPanel implements TrackSchedulerObserver {
  private message: Promise<Message>;
  private static readonly PREVIOUS = "⏮";
  private static readonly PREVIOUSID = "previous";
  private static readonly RESTART = "⏪";
  private static readonly RESTARTID = "restart";
  private static readonly PAUSE_RESUME = "⏯";
  private static readonly PAUSE_RESUMEID = "pause";
  private static readonly SKIP = "⏭";
  private static readonly SKIPID = "skip";
  private collector: InteractionCollector<ButtonInteraction>;

  constructor(private trackScheduler: TrackScheduler, private musicManager: GuildMusicManager) {
  }

  public start(channel: TextBasedChannel) {
    this.trackScheduler.register(this);
    this.message = channel.send(this.buildMessage(this.trackScheduler.getCurrentlyPlaying()));
    this.message.then(async message => {
      this.collector = message.createMessageComponentCollector({componentType: ComponentType.Button})
      this.collector.on("collect", async (interaction: ButtonInteraction) => {
        try {
          await interaction.deferUpdate();
          switch (interaction.customId) {
            case MusicPanel.PREVIOUSID:
              this.musicManager.skipBack();
              break;
            case MusicPanel.RESTARTID:
              this.musicManager.restart();
              break;
            case MusicPanel.PAUSE_RESUMEID:
              this.musicManager.togglePause();
              break;
            case MusicPanel.SKIPID:
              await this.musicManager.skip();
              break;
            default:
              console.error(`Unexpected interaction: ` + interaction.customId);
          }
        } catch (err) {
          console.error(err);
        }
      });

      this.collector.on("end", collected => {
        console.log("MusicPanel collector closed.");
      });
    });
  }

  public onChange(trackScheduler: TrackScheduler): void {
    this.message = this.message.then(message => message.edit(this.buildMessage(trackScheduler.getCurrentlyPlaying())));
  }

  public destroy() {
    this.trackScheduler.deregister(this);
    this.collector.stop();
    this.message.then(message => message.delete()).catch(e => console.error(e));
  }

  private buildMessage(currentlyPlaying: TrackInfo): MessageCreateOptions & MessageEditOptions {
    const embed = new EmbedBuilder()
      .setTitle("Music Panel")
      .setColor("#0099ff");
    if (currentlyPlaying && currentlyPlaying.type) {
      embed.addFields(
        {name: "Title", value: he.decode(currentlyPlaying.title)},
        {name: "Artist", value: he.decode(currentlyPlaying.artist)},
        {name: "Url", value: currentlyPlaying.url}
      ).setThumbnail(currentlyPlaying.thumbnailUrl);
    }
    const buttons = new ActionRowBuilder<MessageActionRowComponentBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(MusicPanel.PREVIOUSID)
          .setLabel(MusicPanel.PREVIOUS)
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(MusicPanel.RESTARTID)
          .setLabel(MusicPanel.RESTART)
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(MusicPanel.PAUSE_RESUMEID)
          .setLabel(MusicPanel.PAUSE_RESUME)
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(MusicPanel.SKIPID)
          .setLabel(MusicPanel.SKIP)
          .setStyle(ButtonStyle.Secondary),
      )
    return {embeds: [embed], components: [buttons]};
  }
}
