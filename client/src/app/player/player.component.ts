import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Socket} from 'ngx-socket-io';
import {MusicService} from '../music.service';
import {JoinGuild, QueueInfo, TrackInfo} from '../models';
import {Title} from '@angular/platform-browser';
import {TrackInfoEvent} from '../track-info/track-info.component';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {

  guildId: string;
  guild = '';
  userId: string;
  queueInfo: QueueInfo;
  url = '';
  searchResult: TrackInfo[] = [];
  loading: boolean;

  constructor(private socket: Socket, private route: ActivatedRoute, private musicService: MusicService, private titleService: Title) {
  }

  ngOnInit() {
    console.log('init');
    this.route.paramMap.subscribe(params => {
      this.guildId = params.get('guildId');
      this.userId = params.get('userId');
      this.socket.on('connect', () => {
        this.socket.fromEvent('tracks').subscribe((queueInfo: QueueInfo) => {
          this.queueInfo = queueInfo;
        });
        this.socket.fromEvent('guild').subscribe((guild: string) => {
          this.guild = guild;
          this.titleService.setTitle(this.guild);
        });
        this.socket.emit('joinGuild', {guildId: this.guildId, userId: this.userId} as JoinGuild);
      });
    });
  }

  skipBack() {
    this.musicService.skipBack(this.guildId);
  }

  skip() {
    this.musicService.skip(this.guildId);
  }

  now(url?: string) {
    this.musicService.now(this.guildId, url ? url : this.url);
  }

  next(url?: string) {
    this.musicService.next(this.guildId, url ? url : this.url);
  }

  queue(url?: string) {
    this.musicService.queue(this.guildId, url ? url : this.url);
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

  remove(id: number) {
    this.musicService.remove(this.guildId, id);
  }

  search() {
    this.loading = true;
    this.musicService.search(this.url).subscribe(result => {
      this.searchResult = result;
      this.loading = false;
    }, error => {
      console.error(error);
      this.loading = false;
    });
  }

  enter() {
    if (this.url.toLowerCase().startsWith('http://') || this.url.toLowerCase().startsWith('https://')) {
      this.queue();
    } else {
      this.search();
    }
  }

  trackInfoEvent(event: TrackInfoEvent) {
    switch (event.type) {
      case 'REMOVE':
        this.remove(event.params);
        break;
      case 'NOW':
        this.now(event.params);
        break;
      case 'NEXT':
        this.next(event.params);
        break;
      case 'QUEUE':
        this.queue(event.params);
        break;
    }
  }
}
