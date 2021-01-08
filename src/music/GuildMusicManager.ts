import {DMChannel, Guild, Snowflake, TextChannel, VoiceChannel, VoiceConnection} from "discord.js";
import {ChannelInfo} from "./ChannelInfo";
import {MusicPanel} from "./MusicPanel";
import {MusicPlayer} from "./MusicPlayer";
import {ReactionManager} from "./ReactionManager";
import {CurrentTrackInfo, TrackInfo} from "./TrackInfo";
import {TrackScheduler} from "./TrackScheduler";
import {YoutubeService} from "./YoutubeService";

export class GuildMusicManager {
  private readonly trackScheduler: TrackScheduler;
  private readonly musicPlayer: MusicPlayer;
  private musicpanel: MusicPanel;
  private autoLeaveTimeout: NodeJS.Timeout = null;

  constructor(private guild: Guild) {
    this.musicPlayer = new MusicPlayer(this.guild);
    this.trackScheduler = new TrackScheduler(this.musicPlayer, this);
  }

  public join(channel: VoiceChannel): Promise<VoiceConnection> {
    if (channel == null) {
      throw new Error("You must be in a channel.");
    }
    return channel.join().then(val => {
      if (this.trackScheduler.getCurrentlyPlaying() && this.trackScheduler.getCurrentlyPlaying().url) {
        this.restart();
      }
      return val;
    });
  }

  public leave(): void {
    if (this.isVoiceConnected()) {
      this.pause();
      this.guild.me.voice.channel.leave();
    }
  }

  public async playNow(url: string, channel?: VoiceChannel): Promise<void> {
    if (channel && this.guild.me.voice.channel == null) {
      await this.join(channel);
    }
    return YoutubeService.getInstance().getInfo(url).then(trackInfo => this.trackScheduler.now(trackInfo));
  }

  public radio(url: string, includeCurrent = true): Promise<void> {
    return YoutubeService.getInstance().radio(url, includeCurrent).then(tracks => this.queueList(tracks));
  }

  public playNext(url: string): Promise<void> {
    if (this.musicPlayer.isCurrentlyPlaying()) {
      return YoutubeService.getInstance().getInfo(url).then(trackInfo => this.trackScheduler.next(trackInfo));
    } else {
      return this.playNow(url);
    }
  }

  public queue(url: string): Promise<void> {
    if (this.musicPlayer.isCurrentlyPlaying()) {
      return YoutubeService.getInstance().getInfo(url).then(trackInfo => this.trackScheduler.queue(trackInfo));
    } else {
      return this.playNow(url);
    }
  }

  public skip(): Promise<void> {
    return this.trackScheduler.playNext();
  }

  public skipBack(): void {
    this.trackScheduler.playPrevious();
  }

  public pause(): void {
    this.trackScheduler.pause();
  }

  public resume(): void {
    this.trackScheduler.resume();
  }

  public togglePause(): void {
    this.musicPlayer.validateCurrentlyPlaying();
    if (this.trackScheduler.isPaused()) {
      this.resume();
    } else {
      this.pause();
    }
  }

  public restart(): void {
    this.trackScheduler.restart();
  }

  public displayMusicPanel(channel: TextChannel | DMChannel): void {
    if (this.musicpanel) {
      this.musicpanel.destroy();
    }
    this.musicpanel = new MusicPanel(this.trackScheduler, new ReactionManager(this));
    this.musicpanel.start(channel);
  }

  public close(): void {
    this.leave();
    if (this.musicpanel) {
      this.musicpanel.destroy();
    }
    this.clearAutoLeaveTimeout();
  }

  public getTracks(): TrackInfo[] {
    return this.trackScheduler.getTracks();
  }

  public getPreviousTracks(): TrackInfo[] {
    return this.trackScheduler.getPreviousTracks();
  }

  public getCurrentTrack(): CurrentTrackInfo {
    return this.trackScheduler.getCurrentlyPlaying();
  }

  public getPlayerUrl(userId?: Snowflake): string {
    return process.env.URL + "/player/" + this.guild.id;
  }

  public getTrackScheduler(): TrackScheduler {
    return this.trackScheduler;
  }

  public getGuild(): Guild {
    return this.guild;
  }

  public joinByUserId(userId: string) {
    return this.guild.members.fetch(userId).then(user => this.join(user.voice.channel));
  }

  public isVoiceConnected(): boolean {
    return !!this.guild.me.voice.channel;
  }

  public removeTrackById(id: number) {
    this.trackScheduler.removeById(id);
  }

  public getVoiceChannels(): ChannelInfo[] {
    return this.guild.channels.cache.filter(channel => channel.type === "voice").map(channel => {
      return {
        id: channel.id,
        name: channel.name
      };
    });
  }

  public joinByChannelId(id: string) {
    const channel = this.guild.channels.resolve(id);
    if (channel.type === "voice") {
      return this.join(channel as VoiceChannel);
    }
    return Promise.reject('not a voice channel');
  }

  public toggleRepeat() {
    this.trackScheduler.setRepeat(!this.trackScheduler.getRepeat());
  }

  public getRepeat(): boolean {
    return this.trackScheduler.getRepeat();
  }

  public toggleRadio() {
    this.trackScheduler.setAutoRadio(!this.trackScheduler.getAutoRadio());
  }

  public getAutoRadio(): boolean {
    return this.trackScheduler.getAutoRadio();
  }

  public add(track: TrackInfo | TrackInfo[], index: number) {
    this.resolveIds(track);
    this.trackScheduler.add(track, index);
  }

  public addByUrl(url: string, index: number) {
    return YoutubeService.getInstance().getInfo(url).then(res => this.trackScheduler.add(res, index));
  }

  public move(id: number, index: number) {
    this.trackScheduler.move(id, index);
  }

  public playListNow(tracks: TrackInfo[]): Promise<void> {
    this.resolveIds(tracks);
    return this.trackScheduler.now(tracks);
  }

  public playListNext(tracks: TrackInfo[]) {
    this.resolveIds(tracks);
    this.trackScheduler.next(tracks);
  }

  public queueList(tracks: TrackInfo[]) {
    this.resolveIds(tracks);
    this.trackScheduler.queue(tracks);
  }

  public clearPlaylist() {
    this.trackScheduler.clear();
  }

  private resolveIds(value: TrackInfo | TrackInfo[]) {
    if (Array.isArray(value)) {
      for (const track of value) {
        track.id = YoutubeService.resolveId();
      }
    } else {
      value.id = YoutubeService.resolveId();
    }
  }

  onUserChangeVoiceState() {
    if (this.isBotOnlyMemberInVoiceChannel()) {
      this.autoLeaveTimeout = setTimeout(() => {
        this.autoLeaveTimeout = null;
        if (this.isBotOnlyMemberInVoiceChannel()) {
          this.leave();
          console.log('auto leave guild: ' + this.guild.name);
        }
      }, 60000);
    } else {
      this.clearAutoLeaveTimeout();
    }
  }

  clearAutoLeaveTimeout() {
    if (this.autoLeaveTimeout) {
      clearTimeout(this.autoLeaveTimeout);
      this.autoLeaveTimeout = null;
    }
  }

  isBotOnlyMemberInVoiceChannel(): boolean {
    return this.musicPlayer.isConnected() && this.guild.voice.channel.members.size === 1;
  }
}
