import {GuildMusicManager} from "./GuildMusicManager";
import {MusicPlayer} from "./MusicPlayer";
import {PlayerObserver} from "./PlayerObserver";
import {CurrentTrackInfo, QueueType, TrackInfo} from "./TrackInfo";
import {TrackSchedulerObserver} from "./TrackSchedulerObserver";

export class TrackScheduler implements PlayerObserver {

  private tracks: TrackInfo[] = [];
  private previousTracks: TrackInfo[] = [];
  private currentlyPlaying: TrackInfo;
  private observers: TrackSchedulerObserver[] = [];
  private repeat = true;
  private autoRadio = false;

  constructor(private musicPlayer: MusicPlayer, private musicManager: GuildMusicManager) {
    this.musicPlayer.register(this);
  }

  public onTogglePause(value: boolean): void {
    this.updateObservers();
  }

  public onSeek(): void {
    this.updateObservers();
  }

  public onVolumeChange(): void {
    this.updateObservers();
  }

  public async playNext(fromEvent = false) {
    if (this.musicPlayer.isConnected()) {
      let trackInfo = this.tracks.shift();
      if (!trackInfo && this.autoRadio) {
        await this.musicManager.radio(this.currentlyPlaying.url, false);
        trackInfo = this.tracks.shift();
      }
      if (!trackInfo && this.repeat) {
        if (this.previousTracks.length > 0) {
          if (this.currentlyPlaying) {
            this.previousTracks.unshift(this.currentlyPlaying);
            this.currentlyPlaying = null;
          }
          this.tracks = this.previousTracks.reverse();
          this.previousTracks = [];
          trackInfo = this.tracks.shift();
        } else if (this.currentlyPlaying && fromEvent) {
          return this.restart();
        }
      }
      if (trackInfo) {
        if (this.currentlyPlaying) {
          this.previousTracks.unshift(this.currentlyPlaying);
          this.currentlyPlaying = null;
        }
        this.currentlyPlaying = trackInfo;
        this.musicPlayer.play(trackInfo.url);
      } else {
        throw new Error("No track in queue");
      }
    } else {
      throw new Error("Voice not connected. Add the Bot to a voice channel.");
    }
  }

  public playPrevious(fromEvent = false) {
    if (this.musicPlayer.isConnected()) {
      let trackInfo = this.previousTracks.shift();
      if (!trackInfo && this.repeat) {
        if (this.tracks.length > 0) {
          if (this.currentlyPlaying) {
            this.tracks.unshift(this.currentlyPlaying);
            this.currentlyPlaying = null;
          }
          this.previousTracks = this.tracks.reverse();
          this.tracks = [];
          trackInfo = this.previousTracks.shift();
        } else if (this.currentlyPlaying && fromEvent) {
          return this.restart();
        }
      }
      if (trackInfo) {
        if (this.currentlyPlaying) {
          this.tracks.unshift(this.currentlyPlaying);
          this.currentlyPlaying = null;
        }
        this.currentlyPlaying = trackInfo;
        this.musicPlayer.play(trackInfo.url);
      } else {
        throw new Error("No track in queue");
      }
    } else {
      throw new Error("Voice not connected. Add the Bot to a voice channel.");
    }
  }

  public restart() {
    if (this.currentlyPlaying) {
      this.musicPlayer.play(this.currentlyPlaying.url);
    } else {
      throw new Error("Nothing currently playing");
    }
  }

  public queue(tracks: TrackInfo | TrackInfo[]) {
    if (Array.isArray(tracks)) {
      tracks = tracks.slice();
      for (const track of tracks) {
        this.tracks.push(track);
      }
    } else {
      this.tracks.push(tracks);
    }
    this.updateObservers();
  }

  public next(tracks: TrackInfo | TrackInfo[]) {
    if (Array.isArray(tracks)) {
      tracks = tracks.slice();
      for (const track of tracks.reverse()) {
        this.tracks.unshift(track);
      }
    } else {
      this.tracks.unshift(tracks);
    }
    this.updateObservers();
  }

  public async now(tracks: TrackInfo | TrackInfo[]) {
    if (Array.isArray(tracks)) {
      tracks = tracks.slice();
      if (tracks.length > 0) {
        await this.now(tracks.shift());
        this.next(tracks);
      }
    } else {
      this.next(tracks);
      await this.playNext();
    }
    this.updateObservers();
  }

  public pause() {
    this.musicPlayer.pause();
  }

  public resume() {
    if (this.currentlyPlaying && !this.musicPlayer.isCurrentlyPlaying()) {
      this.restart();
    } else {
      this.musicPlayer.resume();
    }
  }

  public async onEnd(): Promise<void> {
    try {
      await this.playNext(true);
    } catch (e) {
      console.log(e);
    }
    this.updateObservers();
  }

  public async onError(err: Error): Promise<void> {
    console.error(err);
    await this.onEnd();
  }

  public onStart(): void {
    this.updateObservers();
  }

  public register(observer: TrackSchedulerObserver) {
    this.observers.push(observer);
  }

  public getCurrentlyPlaying(): CurrentTrackInfo {
    return {
      paused: this.musicPlayer.isCurrentlyPlaying() ? this.isPaused() : true,
      position: this.musicPlayer.isCurrentlyPlaying() ? this.musicPlayer.getPosition() : NaN,
      volume: this.musicPlayer.getVolume(),
      ...this.currentlyPlaying
    };
  }

  public deregister(observer: TrackSchedulerObserver) {
    this.observers.splice(this.observers.indexOf(observer), 1);
  }

  public isPaused() {
    return this.musicPlayer.isPaused();
  }

  public getTracks(): TrackInfo[] {
    return this.tracks;
  }

  public getPreviousTracks(): TrackInfo[] {
    return this.previousTracks;
  }

  public getMusicManager(): GuildMusicManager {
    return this.musicManager;
  }

  public async removeById(id: number): Promise<boolean> {
    if (id === this.currentlyPlaying?.id) {
      await this.tryPlayNext();
    }
    let success = false;
    const trackIndex = this.tracks.findIndex(track => track.id === id);
    if (trackIndex !== -1) {
      success = success || this.tracks.splice(trackIndex, 1).length > 0;
    }
    const previousTrackIndex = this.previousTracks.findIndex(track => track.id === id);
    if (previousTrackIndex !== -1) {
      success = success || this.previousTracks.splice(previousTrackIndex, 1).length > 0;
    }
    this.updateObservers();
    return success;
  }

  private async tryPlayNext() {
    try {
      await this.playNext();
    } catch (e) {
      console.debug();
    }
  }

  public setRepeat(value: boolean) {
    this.repeat = value;
    this.updateObservers();
  }

  public getRepeat(): boolean {
    return this.repeat;
  }

  public setAutoRadio(value: boolean) {
    this.autoRadio = value;
    this.updateObservers();
  }

  public getAutoRadio(): boolean {
    return this.autoRadio;
  }

  public add(queueType: QueueType, trackInfo: TrackInfo | TrackInfo[], index: number) {
    try {
      const queue = this.getQueue(queueType);
      if (Array.isArray(trackInfo)) {
        for (let i = 0; i < trackInfo.length; i++) {
          queue.splice(index + i, 0, trackInfo[i]);
        }
      } else {
        queue.splice(index, 0, trackInfo as TrackInfo);
      }
    } finally {
      this.updateObservers();
    }
  }

  public move(queueType: QueueType, id: number, newIndex: number) {
    try {
      let currentIndex = this.tracks.findIndex(track => track.id === id);
      let fromQueue = this.tracks;
      if (currentIndex < 0) {
        currentIndex = this.previousTracks.findIndex(track => track.id === id);
        fromQueue = this.previousTracks;
      }
      const targetQueue = this.getQueue(queueType);
      if (currentIndex >= 0 && newIndex >= 0 && newIndex < targetQueue.length) {
        targetQueue.splice(newIndex, 0, fromQueue.splice(currentIndex, 1)[0]);
      } else {
        throw new Error("Move failed");
      }
    } finally {
      this.updateObservers();
    }
  }

  private getQueue(queueType: QueueType): TrackInfo[] {
    if (queueType === 'queue') {
      return this.tracks;
    }
    if (queueType === 'previous') {
      return this.previousTracks;
    }
    throw new Error("Queue not known: " + queueType);
  }

  public clear() {
    this.currentlyPlaying = null;
    this.tracks = [];
    this.previousTracks = [];
    this.musicPlayer.stop();
    this.updateObservers();
  }

  private updateObservers() {
    for (const observer of this.observers) {
      try {
        observer.onChange(this);
      } catch (e) {
        console.error(e);
      }
    }
  }
}
