import {GuildMusicManager} from "./GuildMusicManager";
import {MusicPlayer} from "./MusicPlayer";
import {PlayerObserver} from "./PlayerObserver";
import {CurrentTrackInfo, TrackInfo} from "./TrackInfo";
import {TrackSchedulerObserver} from "./TrackSchedulerObserver";

export class TrackScheduler implements PlayerObserver {
  private index = -1;
  private tracks: TrackInfo[] = [];
  private observers: TrackSchedulerObserver[] = [];
  private repeat = true;
  private autoRadio = false;

  constructor(private musicPlayer: MusicPlayer, private musicManager: GuildMusicManager) {
    this.musicPlayer.register(this);
  }

  private get currentlyPlaying(): TrackInfo {
    return this.tracks[this.index];
  }

  public onTogglePause(value: boolean): void {
    this.updateObservers();
  }

  public async playNext() {
    if (this.musicPlayer.isConnected()) {
      let index = this.index + 1;
      if (!this.tracks[index] && this.autoRadio) {
        await this.musicManager.radio(this.currentlyPlaying.url, false);
      }
      if (!this.tracks[index] && this.repeat && this.tracks.length > 0) {
        index = 0;
      }
      if (this.tracks[index]) {
        this.index = index;
        this.musicPlayer.play(this.tracks[this.index].url);
      } else {
        this.index = this.tracks.length - 1;
        throw new Error("No track in queue");
      }
    } else {
      throw new Error("Voice not connected. Add the Bot to a voice channel.");
    }
  }

  public playPrevious() {
    if (this.musicPlayer.isConnected()) {
      let index = this.index - 1;
      if (!this.tracks[index] && this.repeat && this.tracks.length > 0) {
        index = this.tracks.length - 1;
      }
      if (this.tracks[index]) {
        this.index = index;
        this.musicPlayer.play(this.tracks[this.index].url);
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
      for (const track of tracks.reverse()) {
        this.addRelativeToCurrentIndex(track, 0);
      }
    } else {
      this.addRelativeToCurrentIndex(tracks, 0);
    }
    this.updateObservers();
  }

  public async now(tracks: TrackInfo | TrackInfo[]) {
    if (Array.isArray(tracks)) {
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
    this.musicPlayer.resume();
  }

  public async onEnd(): Promise<void> {
    try {
      await this.playNext();
    } catch (e) {
      console.log(e);
    }
    this.updateObservers();
  }

  public async onError(err: Error): Promise<void> {
    console.error(err);
    await this.onEnd();
  }

  public onDebug(information: string): void {
    // NOOP
  }

  public onSpeaking(value: boolean): void {
    // NOOP
  }

  public onStart(): void {
    this.updateObservers();
  }

  public register(observer: TrackSchedulerObserver) {
    this.observers.push(observer);
  }

  public getCurrentlyPlaying(): CurrentTrackInfo {
    return {
      paused: this.musicPlayer.isCurrentlyPlaying() ? this.isPaused() : false,
      position: this.musicPlayer.isCurrentlyPlaying() ? this.musicPlayer.getPosition() : NaN,
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
    return this.tracks.slice(this.index + 1, this.tracks.length);
  }

  public getPreviousTracks(): TrackInfo[] {
    return this.tracks.slice(0, this.index);
  }

  public getMusicManager(): GuildMusicManager {
    return this.musicManager;
  }

  public removeById(id: number) {
    this.tracks = this.tracks.filter(track => track.id !== id);
    this.updateObservers();
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

  public addRelativeToCurrentIndex(trackInfo: TrackInfo | TrackInfo[], offset: number) {
    try {
      const index = this.index + offset + 1;
      if (Array.isArray(trackInfo)) {
        for (let i = 0; i < trackInfo.length; i++) {
          this.tracks.splice(index + i, 0, trackInfo[i]);
        }
      } else {
        this.tracks.splice(index, 0, trackInfo as TrackInfo);
      }
    } finally {
      this.updateObservers();
    }
  }

  public moveRelativeToCurrentIndex(id: number, offset: number) {
    try {
      const newIndex = this.index + offset + 1;
      const currentIndex = this.tracks.findIndex(track => track.id === id);
      if (currentIndex >= 0 && newIndex >= 0 && newIndex < this.tracks.length) {
        this.tracks.splice(newIndex, 0, this.tracks.splice(currentIndex, 1)[0]);
      } else {
        throw new Error("Move failed");
      }
    } finally {
      this.updateObservers();
    }
  }

  public clear() {
    this.index = -1;
    this.tracks = [];
    this.musicPlayer.stop();
    this.updateObservers();
  }

  private updateObservers() {
    for (const observer of this.observers) {
      observer.onChange(this);
    }
  }
}
