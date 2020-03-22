import {GuildMusicManager} from "./GuildMusicManager";
import {MusicPlayer} from "./MusicPlayer";
import {PlayerObserver} from "./PlayerObserver";
import {CurrentTrackInfo, TrackInfo} from "./TrackInfo";
import {TrackSchedulerObserver} from "./TrackSchedulerObserver";

export class TrackScheduler implements PlayerObserver {

    private tracks: TrackInfo[] = [];
    private previousTracks: TrackInfo[] = [];
    private currentlyPlaying: TrackInfo;
    private observers: TrackSchedulerObserver[] = [];
    private repeat = true;

    constructor(private musicPlayer: MusicPlayer, private musicManager: GuildMusicManager) {
        this.musicPlayer.register(this);
    }

    public onTogglePause(value: boolean): void {
        this.updateObservers();
    }

    public playNext() {
        if (this.musicPlayer.isConnected()) {
            let trackInfo = this.tracks.shift();
            if (!trackInfo && this.repeat && this.previousTracks.length > 0) {
                if (this.currentlyPlaying) {
                    this.previousTracks.unshift(this.currentlyPlaying);
                    this.currentlyPlaying = null;
                }
                this.tracks = this.previousTracks.reverse();
                this.previousTracks = [];
                trackInfo = this.tracks.shift();
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
            throw new Error("Voice not connected");
        }
    }

    public playPrevious() {
        if (this.musicPlayer.isConnected()) {
            let trackInfo = this.previousTracks.shift();
            if (!trackInfo && this.repeat && this.tracks.length > 0) {
                if (this.currentlyPlaying) {
                    this.tracks.unshift(this.currentlyPlaying);
                    this.currentlyPlaying = null;
                }
                this.previousTracks = this.tracks.reverse();
                this.tracks = [];
                trackInfo = this.previousTracks.shift();
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
            throw new Error("Voice not connected");
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
        this.updateObservers();
    }

    public next(track: TrackInfo) {
        this.tracks.unshift(track);
        this.updateObservers();
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

    public onEnd(): void {
        try {
            this.playNext();
        } catch (e) {
            console.log(e);
        }
        this.updateObservers();
    }

    public onError(err: Error): void {
        console.error(err);
        this.onEnd();
    }

    public onDebug(information: string): void {
    }

    public onSpeaking(value: boolean): void {
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

    public removeById(id: number) {
        this.tracks = this.tracks.filter(track => {
            return "" + track.id !== id + "";
        });
        this.previousTracks = this.previousTracks.filter(track => track.id.valueOf() !== id.valueOf());
        this.updateObservers();
    }

    public setRepeat(value: boolean) {
        this.repeat = value;
        this.updateObservers();
    }

    public getRepeat(): boolean {
        return this.repeat;
    }

    public add(trackInfo: TrackInfo, index: number) {
        try {
            this.tracks.splice(index, 0, trackInfo);
        } finally {
            this.updateObservers();
        }
    }

    public move(id: string, newIndex: number) {
        try {
            const currentIndex = this.tracks.findIndex(track => track.id === parseInt(id));
            if (currentIndex >= 0 && newIndex >= 0 && newIndex < this.tracks.length) {
                this.tracks.splice(newIndex, 0, this.tracks.splice(currentIndex, 1)[0]);
            } else {
                throw new Error("Move failed");
            }
        } finally {
            this.updateObservers();
        }
    }

    private updateObservers() {
        for (const observer of this.observers) {
            observer.onChange(this);
        }
    }
}
