import {videoInfo} from "ytdl-core";
import {MusicPlayer} from "./MusicPlayer";
import {PlayerObserver} from "./PlayerObserver";

export class TrackScheduler implements PlayerObserver {

  private tracks: videoInfo[] = [];

  constructor(private musicPlayer: MusicPlayer) {
  }

  public playNext() {
    const videoInfo = this.tracks.shift();
    if (videoInfo) {
      this.musicPlayer.play(videoInfo.video_url);
    } else {
      throw new Error("No track in queue");
    }
  }

  public append(track: videoInfo) {
    this.tracks.push(track);
  }

  public next(track: videoInfo) {
    this.tracks.unshift(track);
  }

  public now(track: videoInfo) {
    this.next(track);
    this.playNext();
  }

  public onDebug(information: string): void {
  }

  public onEnd(reason: string): void {
    console.log(reason);
    if (this.tracks.length > 0) {
      this.playNext();
    }
  }

  public onError(err: Error): void {
    console.log(err);
    this.onEnd("error");
  }

  public onSpeaking(value: boolean): void {
  }

  public onStart(): void {
  }

  public onVolumeChange(oldVolume: number, newVolume: number): void {
  }

  public pause() {
    this.musicPlayer.pause();
  }

  public resume() {
    this.musicPlayer.resume();
  }
}
