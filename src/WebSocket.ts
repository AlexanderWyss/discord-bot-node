import {Server} from "socket.io";
import {Bot} from "./Bot";

export class WebSocket {

  private bot: Bot;

  public constructor(private io: Server) {
    this.bot = Bot.getInstance();
  }

  public start() {
    this.io.on("connection", socket => {
      socket.on("joinGuild", data => {
        if (data.oldGuildId) {
          socket.leave(data.oldGuildId);
        }

        let musicManager = this.bot.getGuildMusicManagerById(data.guildId);
        socket.join(data.guildId);
        socket.emit("tracks", {
          currentTrack: musicManager.getCurrentTrack(),
          tracks: musicManager.getTracks(),
          previousTracks: musicManager.getPreviousTracks()
        });
      });
    });
  }
}
