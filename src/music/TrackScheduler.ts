import {MusicPlayer} from "./MusicPlayer";
import {PlayerObserver} from "./PlayerObserver";
import {CurrentTrackInfo, TrackInfo} from "./TrackInfo";
import {TrackSchedulerObserver} from "./TrackSchedulerObserver";

export class TrackScheduler implements PlayerObserver {

  private tracks: TrackInfo[] = [];
  private previousTracks: TrackInfo[] = [];
  private currentlyPlaying: TrackInfo;
  private observers: TrackSchedulerObserver[] = [];

  constructor(private musicPlayer: MusicPlayer) {
    this.musicPlayer.register(this);
  }

  public playNext() {
    const trackInfo = this.tracks.shift();
    if (trackInfo) {
      if (this.currentlyPlaying) {
        this.previousTracks.unshift(this.currentlyPlaying);
      }
      this.currentlyPlaying = trackInfo;
      this.musicPlayer.play(trackInfo.url);
    } else {
      throw new Error("No track in queue");
    }
  }

  public playPrevious() {
    const trackInfo = this.previousTracks.shift();
    if (trackInfo) {
      if (this.currentlyPlaying) {
        this.tracks.unshift(this.currentlyPlaying);
      }
      this.currentlyPlaying = trackInfo;
      this.musicPlayer.play(trackInfo.url);
    } else {
      throw new Error("No tracks played previously");
    }
  }

  public restart() {
    if (this.currentlyPlaying) {
      this.musicPlayer.play(this.currentlyPlaying.url);
    } else {
      throw new Error("Nothing currently playing");
    }
  }

  public append(track: TrackInfo) {
    this.tracks.push(track);
  }

  public next(track: TrackInfo) {
    this.tracks.unshift(track);
  }

  public now(track: TrackInfo) {
    this.next(track);
    this.playNext();
  }

  public pause() {
    this.musicPlayer.pause();
  }

  public resume() {
    this.musicPlayer.resume();
  }

  public onEnd(reason: string): void {
    console.log(reason);
    if (reason !== "NewSong") {
      if (this.tracks.length > 0) {
        this.playNext();
      } else {
        this.previousTracks.unshift(this.currentlyPlaying);
        this.currentlyPlaying = null;
      }
    }
    this.updateObservers();
  }

  public onError(err: Error): void {
    console.log(err);
    this.onEnd("error");
  }

  public onDebug(information: string): void {
  }

  public onSpeaking(value: boolean): void {
  }

  public onStart(): void {
    this.updateObservers();
  }

  public onVolumeChange(oldVolume: number, newVolume: number): void {
    this.updateObservers();
  }

  public register(observer: TrackSchedulerObserver) {
    this.observers.push(observer);
  }

  public getCurrentlyPlaying(): CurrentTrackInfo {
    return this.currentlyPlaying;
  }

  public deregister(observer: TrackSchedulerObserver) {
    this.observers.splice(this.observers.indexOf(observer), 1);
  }

  public isPaused() {
    return this.musicPlayer.isPaused();
  }

  public setVolume(volume: number) {
    this.musicPlayer.setVolume(volume);
  }

  public getVolume() {
    return this.musicPlayer.getVolume();
  }

  public getTracks(): TrackInfo[] {
    return this.tracks;
  }

  public getPreviousTracks(): TrackInfo[] {
    return this.previousTracks;
  }

  private updateObservers() {
    for (const observer of this.observers) {
      observer.onChange(this.currentlyPlaying, this);
    }
  }
}
