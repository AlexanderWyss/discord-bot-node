import {Server} from "socket.io";
import {Bot} from "./Bot";
import {GuildMusicManager} from "./music/GuildMusicManager";
import {TrackInfo} from "./music/TrackInfo";
import {TrackScheduler} from "./music/TrackScheduler";
import {TrackSchedulerObserver} from "./music/TrackSchedulerObserver";

export interface QueueInfo {
    currentTrack: TrackInfo;
    tracks: TrackInfo[];
    previousTracks: TrackInfo[];
}

export interface JoinGuild {
    guildId: string;
    oldGuildId?: string;
}

export class WebSocket implements TrackSchedulerObserver {

    private bot: Bot;
    private musicManagers = new Map<string, GuildMusicManager>();

    public constructor(private io: Server) {
        this.bot = Bot.getInstance();
    }

    public start() {
        console.log("Start");
        this.io.on("connection", socket => {
            socket.on("joinGuild", (data: JoinGuild) => {
                try {
                    if (data.oldGuildId) {
                        socket.leave(data.oldGuildId);
                    }
                    let musicManager: GuildMusicManager;
                    if (this.musicManagers.has(data.guildId)) {
                        musicManager = this.musicManagers.get(data.guildId);
                    } else {
                        musicManager = this.bot.getGuildMusicManagerByIdIfExists(data.guildId);
                        this.musicManagers.set(data.guildId, musicManager);
                        musicManager.getTrackScheduler().register(this);
                    }
                    socket.join(data.guildId);
                    socket.emit("tracks", this.getQueueInfo(musicManager));
                } catch (e) {
                    console.error(e);
                }
            });
        });
    }

    public onChange(trackScheduler: TrackScheduler): void {
        this.io.in(trackScheduler.getMusicManager().getGuild().id.toString())
            .emit("tracks", this.getQueueInfo(trackScheduler.getMusicManager()));
    }

    private getQueueInfo(musicManager: GuildMusicManager): QueueInfo {
        console.log("getQueueInfo");
        return {
            currentTrack: musicManager.getCurrentTrack(),
            tracks: musicManager.getTracks(),
            previousTracks: musicManager.getPreviousTracks()
        };
    }
}
