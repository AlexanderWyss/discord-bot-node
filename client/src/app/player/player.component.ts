import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Socket} from 'ngx-socket-io';
import {HttpClient} from '@angular/common/http';
import {MusicService} from "../music.service";

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
  url = '';
  guildId: string;

  constructor(private socket: Socket, private route: ActivatedRoute, private musicService: MusicService) {
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

  skipBack() {
    this.musicService.skipBack(this.guildId);
  }

  skip() {
    this.musicService.skip(this.guildId);
  }

  now() {
    this.musicService.now(this.guildId, this.url);
  }

  next() {
    this.musicService.next(this.guildId, this.url);
  }

  queue() {
    this.musicService.queue(this.guildId, this.url);
  }

  volumeUp() {
    this.musicService.volumeUp(this.guildId);
  }

  volumeDown() {
    this.musicService.volumeDown(this.guildId);
  }

  togglePause() {
    this.musicService.togglePause(this.guildId);
  }
}
