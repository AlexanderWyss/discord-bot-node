import {Guild, VoiceChannel} from "discord.js";
import {PlayerObserver} from "./PlayerObserver";
import {YoutubeService} from "./YoutubeService";
import {
  AudioPlayerState,
  AudioPlayerStatus,
  AudioResource,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
  joinVoiceChannel,
  VoiceConnection
} from "@discordjs/voice";
import fluentFfmpeg from "fluent-ffmpeg";
import {Stream} from "stream";
import ffmpegPath from "ffmpeg-static";

export class MusicPlayer {
  private player = createAudioPlayer();
  private _audioResource: AudioResource;

  private get voiceConnection() {
    const voiceConnection = getVoiceConnection(this.guild.id);

    if (voiceConnection) {
      return voiceConnection;
    }
    throw new Error("Voice not connected. Add the Bot to a voice channel.");
  }

  private get audioResource() {
    if (this._audioResource) {
      return this._audioResource;
    }
    throw new Error("There isn't any song playing");
  }

  private set audioResource(audioResource: AudioResource) {
    this._audioResource = audioResource;
  }

  private observers: PlayerObserver[] = [];

  private url: string = null;
  private startingSeconds: number = 0;
  private volume: number = 20;

  constructor(private guild: Guild) {
    if (process.env.DEFAULT_VOLUME != null) {
      this.setVolume(parseInt(process.env.DEFAULT_VOLUME, 10));
    }
    this.registerListeners();
  }

  public register(observer: PlayerObserver) {
    this.observers.push(observer);
  }

  public play(url: string) {
    this.stop();
    this.url = url;
    this.startingSeconds = 0;
    this.player.play(this.createAudioResource(url));
    this.forObservers(observer => observer.onStart());
  }

  private registerListeners(): void {
    this.player.on(AudioPlayerStatus.Playing, (oldState, newState) => this.handleStartEvent(oldState, newState));
    this.player.on(AudioPlayerStatus.Buffering, (oldState, newState) => this.handleStartEvent(oldState, newState));
    this.player.on(AudioPlayerStatus.Idle, () => this.forObservers(observer => {
      this.audioResource = null;
      observer.onEnd();
    }));
    this.player.on(AudioPlayerStatus.Paused, () => this.forObservers(observer => observer.onTogglePause(true)));
    this.player.on(AudioPlayerStatus.AutoPaused, () => this.forObservers(observer => observer.onTogglePause(true)));
    this.player.on("error", (err: Error) => this.forObservers(observer => {
      this.audioResource = null;
      observer.onError(err);
    }));
  }

  private handleStartEvent(oldState: AudioPlayerState, newState: AudioPlayerState) {
    if (oldState.status === AudioPlayerStatus.Paused || oldState.status === AudioPlayerStatus.AutoPaused) {
      this.forObservers(observer => observer.onTogglePause(false));
    } else if (oldState.status !== AudioPlayerStatus.Playing && oldState.status !== AudioPlayerStatus.Buffering) {
      this.forObservers(observer => observer.onStart());
    }
  }

  public seek(seconds: number): void {
    if (this.url != null) {
      this.startingSeconds = seconds;
      if (this.isCurrentlyPlaying()) {
        this.player.stop();
      }
      this.player.play(this.createAudioResource(this.url, this.startingSeconds));
      this.forObservers(observer => observer.onSeek())
    }
  }


  private createAudioResource(url: string, seek: number = 0) {
    const stream = YoutubeService.getInstance().getStream(url);
    if (seek > 0) {
      const bufferStream = new Stream.PassThrough();
      fluentFfmpeg({source: stream})
        .setFfmpegPath(ffmpegPath)
        .format("opus")
        .seekInput(seek)
        .on("error", err => {
          if (err && err instanceof Error && err.message.includes("Premature close")) {
            return;
          }
          console.error(err)
        })
        .stream(bufferStream);
      this.audioResource = createAudioResource(bufferStream, {inlineVolume: true});
    } else {
      this.audioResource = createAudioResource(stream, {inlineVolume: true});
    }
    this.audioResource.volume.setVolumeLogarithmic(this.getVolumeInternal())
    return this.audioResource;
  }

  public pause() {
    if (this.isCurrentlyPlaying()) {
      this.player.pause(true);
    }
  }

  public resume() {
    if (this.isCurrentlyPlaying()) {
      this.player.unpause();
    }
  }

  public isPaused(): boolean {
    if (this.isCurrentlyPlaying()) {
      return this.player.state.status === AudioPlayerStatus.Paused || this.player.state.status === AudioPlayerStatus.AutoPaused;
    }
    return true;
  }

  public isCurrentlyPlaying() {
    return this.isConnected() && !!this._audioResource;
  }

  public isConnected() {
    return !!getVoiceConnection(this.guild.id);
  }

  public getPosition(): number {
    return Math.floor(this.audioResource.playbackDuration / 1000) + this.startingSeconds;
  }

  public getVolume(): number {
    return this.volume;
  }

  public setVolume(volume: number): void {
    volume = Math.min(150, Math.abs(volume));
    if (!isNaN(volume)) {
      this.volume = volume;
      if (this.isCurrentlyPlaying()) {
        this.audioResource.volume.setVolumeLogarithmic(this.getVolumeInternal());
      }
      this.forObservers(observer => observer.onVolumeChange())
    } else {
      console.error(`Volume ${volume} couldn't be applied.`);
    }
  }

  private getVolumeInternal() {
    return this.volume / 100;
  }

  public stop() {
    this.url = null;
    if (this.isCurrentlyPlaying()) {
      this.player.stop();
    }
  }

  private forObservers(func: (observer: PlayerObserver) => void) {
    for (const observer of this.observers) {
      func(observer);
    }
  }

  public join(channelId: string): VoiceConnection {
    const voiceConnection = joinVoiceChannel({
      channelId,
      guildId: this.guild.id,
      adapterCreator: this.guild.voiceAdapterCreator
    });
    voiceConnection.subscribe(this.player);
    return voiceConnection;
  }

  public leave() {
    this.voiceConnection.destroy();
  }

  public getChannel() {
    return this.guild.channels.cache.get(getVoiceConnection(this.guild.id).joinConfig.channelId) as VoiceChannel;
  }
}
