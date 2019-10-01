import {Component, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {Socket} from "ngx-socket-io";

interface TrackInfo {
  readonly id: number;
  readonly url: string;
  readonly title: string;
  readonly artist: string;
  readonly thumbnailUrl: string;
}

interface CurrentTrackInfo extends TrackInfo {

}

interface QueueInfo {
  currentTrack: TrackInfo;
  tracks: TrackInfo[];
  previousTracks: TrackInfo[];
}

interface JoinGuild {
  guildId: string;
  oldGuildId?: string;
}

@Component({
  selector: "app-player",
  templateUrl: "./player.component.html",
  styleUrls: ["./player.component.scss"]
})
export class PlayerComponent implements OnInit {

  tracks: TrackInfo[];

  constructor(private socket: Socket, private route: ActivatedRoute) {
  }

  ngOnInit() {
    console.log("init");
    this.socket.on("connect", () => {
      this.socket.fromEvent("tracks").subscribe((queueInfo: QueueInfo) => {
        this.tracks = queueInfo.tracks;
      });
      this.route.paramMap.subscribe(params => {
        this.socket.emit("joinGuild", {guildId: params.get("guildId")} as JoinGuild);
      });
    });
  }
}
