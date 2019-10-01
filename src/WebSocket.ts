import {Server} from "socket.io";
import {Bot} from "./Bot";
import {TrackInfo} from "./music/TrackInfo";

export interface QueueInfo {
  currentTrack: TrackInfo;
  tracks: TrackInfo[];
  previousTracks: TrackInfo[];
}

export interface JoinGuild {
  guildId: string;
  oldGuildId?: string;
}

export class WebSocket {

  private bot: Bot;

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

        const musicManager = this.bot.getGuildMusicManagerById(data.guildId);
        socket.join(data.guildId);
        socket.emit("tracks", {
          currentTrack: musicManager.getCurrentTrack(),
          tracks: musicManager.getTracks(),
          previousTracks: musicManager.getPreviousTracks()
        } as QueueInfo);
      });
    });
  }
}
