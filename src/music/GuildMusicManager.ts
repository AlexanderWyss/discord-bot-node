import {DMChannel, GroupDMChannel, Guild, TextChannel, VoiceChannel, VoiceConnection} from "discord.js";
import {YoutubeService} from "./YoutubeService";
import {MusicPanel} from "./MusicPanel";
import {MusicPlayer} from "./MusicPlayer";
import {ReactionManager} from "./ReactionManager";
import {TrackScheduler} from "./TrackScheduler";

export class GuildMusicManager {
  private readonly trackScheduler: TrackScheduler;
  private readonly musicPlayer: MusicPlayer;
  private musicpanel: MusicPanel;

  constructor(private guild: Guild) {
    this.musicPlayer = new MusicPlayer(this.guild);
    this.trackScheduler = new TrackScheduler(this.musicPlayer);
  }

  public join(channel: VoiceChannel): Promise<VoiceConnection> {
    if (channel == null) {
      throw new Error("You must be in a channel.");
    }
    return channel.join();
  }

  public leave() {
    if (this.guild.me.voiceChannel) {
      this.guild.me.voiceChannel.leave();
    }
  }

  public async playNow(url: string, channel: VoiceChannel): Promise<void> {
    if (this.guild.me.voiceChannel == null) {
      await this.join(channel);
    }
    return YoutubeService.getInstance().getInfo(url).then(trackInfo => this.trackScheduler.now(trackInfo));
  }

  public playNext(url: string): Promise<void> {
    return YoutubeService.getInstance().getInfo(url).then(trackInfo => this.trackScheduler.next(trackInfo));
  }

  public queue(url: string) {
    return YoutubeService.getInstance().getInfo(url).then(trackInfo => this.trackScheduler.append(trackInfo));
  }

  public skip() {
    return this.trackScheduler.playNext();
  }

  public skipBack() {
    return this.trackScheduler.playPrevious();
  }

  public pause() {
    this.trackScheduler.pause();
  }

  public resume() {
    this.trackScheduler.resume();
  }

  public togglePause() {
    if (this.trackScheduler.isPaused()) {
      this.resume();
    } else {
      this.pause();
    }
  }

  public restart() {
    this.trackScheduler.restart();
  }

  public displayMusicPanel(channel: TextChannel | DMChannel | GroupDMChannel) {
    if (this.musicpanel) {
      this.musicpanel.destroy();
    }
    this.musicpanel = new MusicPanel(this.trackScheduler, new ReactionManager(this));
    this.musicpanel.start(channel);
  }

  public close() {
    this.leave();
    this.musicpanel.destroy();
  }
}
