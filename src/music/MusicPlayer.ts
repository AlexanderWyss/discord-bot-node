import {Guild} from "discord.js";
import {PlayerObserver} from "./PlayerObserver";
import {YoutubeService} from "./YoutubeService";

export class MusicPlayer {

    private get voiceConnection() {
        if (this.guild.voice.connection) {
            return this.guild.voice.connection;
        }
        throw new Error("There is no active voice connection.");
    }

    private get dispatcher() {
        if (this.voiceConnection.dispatcher) {
            return this.voiceConnection.dispatcher;
        }
        throw new Error("There isn't any song playing");
    }

    private observers: PlayerObserver[] = [];

    constructor(private guild: Guild) {
    }

    public register(observer: PlayerObserver) {
        this.observers.push(observer);
    }

    public play(url: string) {
        if (this.voiceConnection.dispatcher) {
            this.dispatcher.end("NewSong");
        }
        const stream = YoutubeService.getInstance().getStream(url);
        const dispatcher = this.voiceConnection.play(stream, {highWaterMark: 1});
        dispatcher.on("volumeChange", (oldVolume: number, newVolume: number) => console.log("volumeChange"));

        dispatcher.on("debug", (information: string) => this.forObservers(observer => observer.onDebug(information)));
        dispatcher.on("start", () => this.forObservers(observer => observer.onStart()));
        dispatcher.on("finish", () => this.forObservers(observer => observer.onEnd()));
        dispatcher.on("error", (err: Error) => this.forObservers(observer => observer.onError(err)));
        dispatcher.on("speaking", (value: boolean) => this.forObservers(observer => observer.onSpeaking(value)));
        dispatcher.on("volumeChange", (oldVolume: number, newVolume: number) =>
            this.forObservers(observer => observer.onVolumeChange(oldVolume, newVolume)));

    }

    public pause() {
        this.dispatcher.pause();
        this.forObservers(observer => observer.onTogglePause(this.isPaused()));
    }

    public resume() {
        this.dispatcher.resume();
        this.forObservers(observer => observer.onTogglePause(this.isPaused()));
    }

    public isPaused(): boolean {
        return this.dispatcher.paused;
    }

    public setVolume(volume: number) {
        this.dispatcher.setVolume(Math.floor(volume));
    }

    public getVolume(): number {
        return this.dispatcher.volume;
    }

    public isCurrentlyPlaying() {
        return this.guild && this.guild.voice && this.guild.voice.connection && this.guild.voice.connection.dispatcher;
    }

    private forObservers(func: (observer: PlayerObserver) => void) {
        for (const observer of this.observers) {
            func(observer);
        }
    }
}
