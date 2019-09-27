import {Guild, VoiceChannel} from "discord.js";
import ytdl from "ytdl-core";
import {MusicPlayer} from "./MusicPlayer";
import {TrackScheduler} from "./TrackScheduler";

export class GuildMusicManager {
  private trackScheduler: TrackScheduler;
  private musicPlayer: MusicPlayer;

  constructor(private guild: Guild) {
    this.musicPlayer = new MusicPlayer(this.guild.voiceConnection);
    this.trackScheduler = new TrackScheduler(this.musicPlayer);
  }

  public playNow(url: string, channel: VoiceChannel): Promise<void> {
    if (channel == null) {
      return Promise.reject("You must be in a channel.");
    }
    let promise = Promise.resolve();
    if (this.guild.me.voiceChannel == null || channel.id !== this.guild.me.voiceChannel.id) {
      promise = channel.join().then(connection => this.musicPlayer.setConnection(connection));
    }
    return promise.then(() => ytdl.getBasicInfo(url).then(trackInfo => this.trackScheduler.now(trackInfo)));
  }
}
