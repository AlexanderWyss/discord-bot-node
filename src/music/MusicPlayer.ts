import {Guild, VoiceConnection} from "discord.js";
import ytdl from "ytdl-core";
import {IPlayerObserver} from "./IPlayerObserver";

export class MusicPlayer {
  private observers: IPlayerObserver[] = [];

  constructor(private guild: Guild) {
  }

  public register(observer: IPlayerObserver) {
    this.observers.push(observer);
  }

  public play(video_url: string) {
    const stream = ytdl(video_url, {filter: "audioonly", quality: "highestaudio"});
    const dispatcher = this.guild.voiceConnection.playStream(stream);
    dispatcher.on("debug", (information: string) => this.forObservers(observer => observer.onDebug(information)));
    dispatcher.on("end", (reason: string) => this.forObservers(observer => observer.onEnd(reason)));
    dispatcher.on("error", (err: Error) => this.forObservers(observer => observer.onError(err)));
    dispatcher.on("speaking", (value: boolean) => this.forObservers(observer => observer.onSpeaking(value)));
    dispatcher.on("start", () => this.forObservers(observer => observer.onStart()));
    dispatcher.on("volumeChange", (oldVolume: number, newVolume: number) => this.forObservers(observer => observer.onVolumeChange(oldVolume, newVolume)));

  }

  private forObservers(func: (observer: IPlayerObserver) => void) {
    for (const observer of this.observers) {
      func(observer);
    }
  }
}
