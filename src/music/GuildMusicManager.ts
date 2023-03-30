import {Guild, Snowflake, TextBasedChannel, VoiceBasedChannel} from "discord.js";
import {ChannelInfo} from "./ChannelInfo";
import {MusicPanel} from "./MusicPanel";
import {MusicPlayer} from "./MusicPlayer";
import {CurrentTrackInfo, QueueType, TrackInfo} from "./TrackInfo";
import {TrackScheduler} from "./TrackScheduler";
import {YoutubeService} from "./YoutubeService";
import {VoiceConnection} from "@discordjs/voice";
import {PlaylistPanel} from "./PlaylistPanel";

export class GuildMusicManager {
  private readonly trackScheduler: TrackScheduler;
  private readonly musicPlayer: MusicPlayer;
  private musicpanel: MusicPanel;
  private playlistPanel: PlaylistPanel;
  private autoLeaveTimeout: NodeJS.Timeout = null;
  private readonly autoLeaveTimeoutSeconds: number = 60;
  private readonly resumeOnBotJoin: boolean = false;
  private readonly pauseOnUserLeave: boolean = true;
  private readonly resumeOnUserJoin: boolean = true;

  constructor(private guild: Guild) {
    this.musicPlayer = new MusicPlayer(this.guild);
    this.trackScheduler = new TrackScheduler(this.musicPlayer, this);
    if (process.env.AUTO_LEAVE_TIMEOUT != null) {
      this.autoLeaveTimeoutSeconds = parseInt(process.env.AUTO_LEAVE_TIMEOUT, 10);
    }
    if (process.env.RESUME_ON_BOT_JOIN != null) {
      this.resumeOnBotJoin = process.env.RESUME_ON_BOT_JOIN === String(true);
    }
    if (process.env.PAUSE_ON_USER_LEAVE != null) {
      this.pauseOnUserLeave = process.env.PAUSE_ON_USER_LEAVE === String(true);
    }
    if (process.env.RESUME_ON_USER_JOIN != null) {
      this.resumeOnUserJoin = process.env.RESUME_ON_USER_JOIN === String(true);
    }
  }

  public join(channel: VoiceBasedChannel, resume: boolean = this.resumeOnBotJoin): VoiceConnection {
    if (channel == null) {
      throw new Error("You must be in a channel.");
    }
    const voiceConnection = this.musicPlayer.join(channel.id);
    if (resume) {
      this.resume();
    }
    return voiceConnection;
  }

  public leave(): void {
    if (this.isVoiceConnected()) {
      this.pause();
      this.musicPlayer.leave();
    }
  }

  public async playNow(url: string, channel?: VoiceBasedChannel): Promise<TrackInfo | TrackInfo[]> {
    if (channel && !this.isVoiceConnected()) {
      await this.join(channel, false);
    }
    const trackInfo = await YoutubeService.getInstance().getInfo(url);
    await this.trackScheduler.now(trackInfo);
    return trackInfo;
  }

  public radio(url: string, includeCurrent = true): Promise<void> {
    return YoutubeService.getInstance().radio(url, includeCurrent).then(tracks => this.queueList(tracks));
  }

  public async playNext(url: string): Promise<TrackInfo | TrackInfo[]> {
    const trackInfo = await YoutubeService.getInstance().getInfo(url);
    await this.trackScheduler.next(trackInfo);
    return trackInfo;
  }

  public async queue(url: string): Promise<TrackInfo | TrackInfo[]> {
    const trackInfo = await YoutubeService.getInstance().getInfo(url);
    await this.trackScheduler.queue(trackInfo);
    return trackInfo;
  }

  public skip(): Promise<void> {
    return this.trackScheduler.playNext();
  }

  public skipBack(): void {
    this.trackScheduler.playPrevious();
  }

  public seek(seconds: number): void {
    this.musicPlayer.seek(seconds);
  }

  public setVolume(volume: number): void {
    this.musicPlayer.setVolume(volume);
  }

  public pause(): void {
    this.trackScheduler.pause();
  }

  public resume(): void {
    this.trackScheduler.resume();
  }

  public togglePause(): void {
    if (this.trackScheduler.isPaused()) {
      this.resume();
    } else {
      this.pause();
    }
  }

  public restart(): void {
    this.trackScheduler.restart();
  }

  public displayMusicPanel(channel: TextBasedChannel): void {
    if (this.musicpanel) {
      this.musicpanel.destroy();
    }
    this.musicpanel = new MusicPanel(this.trackScheduler, this);
    this.musicpanel.start(channel);
  }

  public displayPlaylistPanel(channel: TextBasedChannel) {
    if (this.playlistPanel) {
      this.playlistPanel.destroy();
    }
    this.playlistPanel = new PlaylistPanel(this.trackScheduler, this);
    this.playlistPanel.start(channel);
  }

  public close(): void {
    this.leave();
    if (this.musicpanel) {
      this.musicpanel.destroy();
    }
    if (this.playlistPanel) {
      this.playlistPanel.destroy();
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
    return this.musicPlayer.isConnected();
  }

  public removeTrackById(id: number): Promise<boolean> {
    return this.trackScheduler.removeById(id);
  }

  public getVoiceChannels(): ChannelInfo[] {
    return this.guild.channels.cache.filter(channel => channel.isVoiceBased()).map(channel => {
      return {
        id: channel.id,
        name: channel.name
      };
    });
  }

  public joinByChannelId(id: string) {
    const channel = this.guild.channels.resolve(id);
    if (channel.isVoiceBased()) {
      return this.join(channel);
    }
    throw new Error('not a voice channel');
  }

  public toggleRepeat() {
    this.trackScheduler.setRepeat(!this.trackScheduler.getRepeat());
  }

  public getRepeat(): boolean {
    return this.trackScheduler.getRepeat();
  }

  public setRepeat(value: boolean) {
    this.trackScheduler.setRepeat(value);
  }

  public toggleRadio() {
    this.trackScheduler.setAutoRadio(!this.trackScheduler.getAutoRadio());
  }

  public getAutoRadio(): boolean {
    return this.trackScheduler.getAutoRadio();
  }

  public setRadio(value: boolean) {
    this.trackScheduler.setAutoRadio(value);
  }

  public add(queue: QueueType, track: TrackInfo | TrackInfo[], index: number) {
    this.resolveIds(track);
    this.trackScheduler.add(queue, track, index);
  }

  public addByUrl(queue: QueueType, url: string, index: number) {
    return YoutubeService.getInstance().getInfo(url).then(res => this.trackScheduler.add(queue, res, index));
  }

  public move(queue: QueueType, id: number, index: number) {
    this.trackScheduler.move(queue, id, index);
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

  onUserChangeVoiceState(isSelf: boolean) {
    if (this.isBotOnlyMemberInVoiceChannel()) {
      if (this.pauseOnUserLeave && !isSelf) {
        this.pause();
      }
      if (this.autoLeaveTimeoutSeconds >= 0) {
        this.autoLeaveTimeout = setTimeout(() => {
          this.autoLeaveTimeout = null;
          if (this.isBotOnlyMemberInVoiceChannel()) {
            this.leave();
            console.log('auto leave guild: ' + this.guild.name);
          }
        }, this.autoLeaveTimeoutSeconds * 1000);
      }
    } else {
      this.clearAutoLeaveTimeout();
      if (this.resumeOnUserJoin && !isSelf) {
        this.resume();
      }
    }
  }

  clearAutoLeaveTimeout() {
    if (this.autoLeaveTimeout) {
      clearTimeout(this.autoLeaveTimeout);
      this.autoLeaveTimeout = null;
    }
  }

  isBotOnlyMemberInVoiceChannel(): boolean {
    return this.isVoiceConnected() && this.musicPlayer.getChannel().members.size === 1;
  }

  tryJoin(channel: VoiceBasedChannel): boolean {
    try {
      if (this.isVoiceConnected()) {
        return false;
      }
      return !!this.join(channel);
    } catch (e) {
      console.debug(e);
      return false;
    }
  }
}
