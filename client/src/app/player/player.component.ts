import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Socket} from 'ngx-socket-io';
import {HttpClient} from '@angular/common/http';

interface TrackInfo {
  readonly id: number;
  readonly url: string;
  readonly title: string;
  readonly artist: string;
  readonly thumbnailUrl: string;
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
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {

  queueInfo: QueueInfo;
  url: string;
  guildId: string;

  constructor(private socket: Socket, private route: ActivatedRoute, private http: HttpClient) {
  }

  ngOnInit() {
    console.log('init');
    this.route.paramMap.subscribe(params => {
      this.guildId = params.get('guildId');
      this.socket.on('connect', () => {
        this.socket.fromEvent('tracks').subscribe((queueInfo: QueueInfo) => {
          this.queueInfo = queueInfo;
        });
        this.socket.emit('joinGuild', {guildId: this.guildId} as JoinGuild);
      });
    });
  }

  queue() {
    this.http.get('/' + this.guildId + '/queue/' + encodeURIComponent(this.url)).subscribe();
  }
  next() {
    this.http.get('/' + this.guildId + '/next/' + encodeURIComponent(this.url)).subscribe();
  }
  now() {
    this.http.get('/' + this.guildId + '/now/' + encodeURIComponent(this.url)).subscribe();
  }
  skip() {
    this.http.get('/' + this.guildId + '/skip').subscribe();
  }
  skipBack() {
    this.http.get('/' + this.guildId + '/skipBack').subscribe();
  }
}
