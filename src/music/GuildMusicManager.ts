import {DMChannel, Guild, Snowflake, TextChannel, VoiceChannel, VoiceConnection} from "discord.js";
import {ChannelInfo} from "./ChannelInfo";
import {MusicPanel} from "./MusicPanel";
import {MusicPlayer} from "./MusicPlayer";
import {ReactionManager} from "./ReactionManager";
import {CurrentTrackInfo, TrackInfo} from "./TrackInfo";
import {TrackScheduler} from "./TrackScheduler";
import {YoutubeService} from "./YoutubeService";

export class GuildMusicManager {
    private readonly trackScheduler: TrackScheduler;
    private readonly musicPlayer: MusicPlayer;
    private musicpanel: MusicPanel;

    constructor(private guild: Guild) {
        this.musicPlayer = new MusicPlayer(this.guild);
        this.trackScheduler = new TrackScheduler(this.musicPlayer, this);
    }

    public join(channel: VoiceChannel): Promise<VoiceConnection> {
        if (channel == null) {
            throw new Error("You must be in a channel.");
        }
        return channel.join();
    }

    public leave() {
        if (this.isVoiceConnected()) {
            this.guild.me.voice.channel.leave();
        }
    }

    public async playNow(url: string, channel?: VoiceChannel): Promise<void> {
        if (channel && this.guild.me.voice.channel == null) {
            await this.join(channel);
        }
        return YoutubeService.getInstance().getInfo(url).then(trackInfo => this.trackScheduler.now(trackInfo));
    }

    public playNext(url: string): Promise<void> {
        return YoutubeService.getInstance().getInfo(url).then(trackInfo => this.trackScheduler.next(trackInfo));
    }

    public queue(url: string) {
        return YoutubeService.getInstance().getInfo(url).then(trackInfo => this.trackScheduler.append(trackInfo));
    }

    public skip() {
        return this.trackScheduler.playNext();
    }

    public skipBack() {
        return this.trackScheduler.playPrevious();
    }

    public pause() {
        this.trackScheduler.pause();
    }

    public resume() {
        this.trackScheduler.resume();
    }

    public togglePause() {
        if (this.trackScheduler.isPaused()) {
            this.resume();
        } else {
            this.pause();
        }
    }

    public restart() {
        this.trackScheduler.restart();
    }

    public displayMusicPanel(channel: TextChannel | DMChannel) {
        if (this.musicpanel) {
            this.musicpanel.destroy();
        }
        this.musicpanel = new MusicPanel(this.trackScheduler, new ReactionManager(this));
        this.musicpanel.start(channel);
    }

    public close() {
        this.leave();
        if (this.musicpanel) {
            this.musicpanel.destroy();
        }
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
        return !!this.guild.me.voice.channel;
    }

    public removeTrackById(id: number) {
        this.trackScheduler.removeById(id);
    }

    public getVoiceChannels(): ChannelInfo[] {
        return this.guild.channels.cache.filter(channel => channel.type === "voice").map(channel => {
            return {
                id: channel.id,
                name: channel.name
            };
        });
    }

    public joinByChannelId(id: string) {
        const channel = this.guild.channels.resolve(id);
        if (channel.type === "voice") {
            return this.join(channel as VoiceChannel);
        }
    }
}
