import {DMChannel, Message, MessageEmbed, ReactionCollector, TextChannel} from "discord.js";
import he from "he";
import {ReactionManager} from "./ReactionManager";
import {TrackInfo} from "./TrackInfo";
import {TrackScheduler} from "./TrackScheduler";
import {TrackSchedulerObserver} from "./TrackSchedulerObserver";

export class MusicPanel implements TrackSchedulerObserver {
  private message: Promise<Message>;
  private collector: ReactionCollector;

  constructor(private trackScheduler: TrackScheduler, private reactionManager: ReactionManager) {
  }

  public start(channel: TextChannel | DMChannel) {
    this.trackScheduler.register(this);
    this.message = channel.send({embed: this.buildMessage(this.trackScheduler.getCurrentlyPlaying())});
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

  public onChange(trackScheduler: TrackScheduler): void {
    this.message = this.message.then(message => message.edit(this.buildMessage(trackScheduler.getCurrentlyPlaying())));
  }

  public destroy() {
    this.trackScheduler.deregister(this);
    this.collector.stop();
    this.message.then(message => message.delete()).catch(e => console.log(e));
  }

  private buildMessage(currentlyPlaying: TrackInfo): MessageEmbed {
    const embed = new MessageEmbed()
      .setTitle("Music Panel")
      .setColor("#0099ff");
    if (currentlyPlaying) {
      embed.addField("Title", he.decode(currentlyPlaying.title))
        .addField("Artist", he.decode(currentlyPlaying.artist))
        .addField("Url", currentlyPlaying.url)
        .addField("Volume", this.trackScheduler.getVolume() * 100)
        .setThumbnail(currentlyPlaying.thumbnailUrl);
    }
    return embed;
  }
}
