import {videoInfo as VideoInfo} from "ytdl-core";
import {MusicPlayer} from "./MusicPlayer";
import {PlayerObserver} from "./PlayerObserver";

export class TrackScheduler implements PlayerObserver {

  private tracks: VideoInfo[] = [];
  private previousTracks: VideoInfo[] = [];
  private currentlyPlaying: VideoInfo;

  constructor(private musicPlayer: MusicPlayer) {
    this.musicPlayer.register(this);
  }

  public playNext() {
    const videoInfo = this.tracks.shift();
    if (videoInfo) {
      if (this.currentlyPlaying) {
        this.previousTracks.unshift(this.currentlyPlaying);
      }
      this.currentlyPlaying = videoInfo;
      this.musicPlayer.play(videoInfo.video_url);
    } else {
      throw new Error("No track in queue");
    }
  }

  public playPrevious() {
    const videoInfo = this.previousTracks.shift();
    if (videoInfo) {
      if (this.currentlyPlaying) {
        this.tracks.unshift(this.currentlyPlaying);
      }
      this.currentlyPlaying = videoInfo;
      this.musicPlayer.play(videoInfo.video_url);
    } else {
      throw new Error("No tracks played previously");
    }
  }

  public restart() {
    if (this.currentlyPlaying) {
      this.musicPlayer.play(this.currentlyPlaying.video_url);
    } else {
      throw new Error("Nothing currently playing");
    }
  }

  public append(track: VideoInfo) {
    this.tracks.push(track);
  }

  public next(track: VideoInfo) {
    this.tracks.unshift(track);
  }

  public now(track: VideoInfo) {
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
  }

  public onVolumeChange(oldVolume: number, newVolume: number): void {
  }
}
