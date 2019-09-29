import {DMChannel, GroupDMChannel, Message, ReactionCollector, RichEmbed, TextChannel} from "discord.js";
import {Video} from "simple-youtube-api";
import {ReactionManager} from "./ReactionManager";
import {TrackScheduler} from "./TrackScheduler";
import {TrackSchedulerObserver} from "./TrackSchedulerObserver";

export class MusicPanel implements TrackSchedulerObserver {
  private message: Promise<Message>;
  private collector: ReactionCollector;

  constructor(private trackScheduler: TrackScheduler, private reactionManager: ReactionManager) {
  }

  public start(channel: TextChannel | DMChannel | GroupDMChannel) {
    this.trackScheduler.register(this);
    this.message = channel.sendEmbed(this.buildMessage(this.trackScheduler.getCurrentlyPlaying()));
    this.message.then(message => message.createReactionCollector((reaction, user) =>
      user.id !== channel.client.user.id)
    ).then(collector => {
      this.collector = collector;
      this.collector.on("collect", reaction => this.reactionManager.apply(reaction));
    });
    this.message.then(message => {
        this.reactionManager.addReactions(message);
      }
    );
  }

  public onChange(nowPlaying: Video, trackScheduler: TrackScheduler): void {
    this.message = this.message.then(message => message.edit(this.buildMessage(nowPlaying)));
  }

  public destroy() {
    this.trackScheduler.deregister(this);
    this.collector.stop();
    this.message.then(message => message.delete()).catch(e => console.log(e));
  }

  private buildMessage(currentlyPlaying: Video): RichEmbed {
    const embed = new RichEmbed()
      .setTitle("Music Panel")
      .setColor("#0099ff");
    if (currentlyPlaying) {
      embed.addField("Title", currentlyPlaying.title)
        .addField("Artist", currentlyPlaying.channel.title)
        .addField("Url", currentlyPlaying.url)
        .setThumbnail((currentlyPlaying.thumbnails as any).high.url);
    }
    return embed;
  }
}
