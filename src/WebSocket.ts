import {Server} from "socket.io";
import {Bot} from "./Bot";
import {TrackInfo} from "./music/TrackInfo";
import {GuildMusicManager} from "./music/GuildMusicManager";
import {TrackSchedulerObserver} from "./music/TrackSchedulerObserver";
import {TrackScheduler} from "./music/TrackScheduler";

export interface QueueInfo {
    currentTrack: TrackInfo;
    tracks: TrackInfo[];
    previousTracks: TrackInfo[];
}

export interface JoinGuild {
    guildId: string;
    oldGuildId?: string;
}

export class WebSocket implements TrackSchedulerObserver{

    private bot: Bot;
    private musicManagers = new Map<string, GuildMusicManager>();

    public constructor(private io: Server) {
        this.bot = Bot.getInstance();
    }

    public start() {
        console.log("Start");
        this.io.on("connection", socket => {
            socket.on("joinGuild", (data: JoinGuild) => {
                if (data.oldGuildId) {
                    socket.leave(data.oldGuildId);
                }

                let musicManager: GuildMusicManager;
                if (this.musicManagers.has(data.guildId)) {
                  musicManager = this.musicManagers.get(data.guildId)
                } else {
                    musicManager = this.bot.getGuildMusicManagerById(data.guildId);
                    this.musicManagers.set(data.guildId, musicManager);
                    musicManager.getTrackScheduler().register(this);
                }
                socket.join(data.guildId);
                this.emitTracks(socket, musicManager);
            });
        });
    }

  onChange(trackScheduler: TrackScheduler): void {
    this.emitTracks(this.io.in(trackScheduler.getMusicManager().getGuild().id.toString()), trackScheduler.getMusicManager());
  }

  private emitTracks(emitter: NodeJS.EventEmitter, musicManager: GuildMusicManager) {
    emitter.emit("tracks", {
      currentTrack: musicManager.getCurrentTrack(),
      tracks: musicManager.getTracks(),
      previousTracks: musicManager.getPreviousTracks()
    } as QueueInfo);
  }
}
