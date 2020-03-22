import {Component, DoCheck, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Socket} from 'ngx-socket-io';
import {MusicService} from '../music.service';
import {GuildInfo, JoinGuild, QueueInfo, TrackInfo} from '../models';
import {Title} from '@angular/platform-browser';
import {TrackInfoEvent} from '../track-info/track-info.component';
import {MatDialog} from '@angular/material/dialog';
import {BookmarkCreatorComponent} from '../bookmark-creator/bookmark-creator.component';
import {JoinChannelComponent} from '../join-channel/join-channel.component';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {

  guild: GuildInfo;
  userId: string;
  queueInfo: QueueInfo;
  url = '';
  searchResult: TrackInfo[] = [];
  loading: boolean;

  constructor(private musicService: MusicService,
              private dialog: MatDialog) {
  }

  ngOnInit() {
    this.musicService.onTracks().subscribe(queueInfo => this.queueInfo = queueInfo);
    this.musicService.onGuild().subscribe(guild => this.guild = guild);
  }

  skipBack() {
    this.musicService.skipBack();
  }

  skip() {
    this.musicService.skip();
  }

  now(url?: string) {
    this.musicService.now(url ? url : this.url);
  }

  next(url?: string) {
    this.musicService.next(url ? url : this.url);
  }

  queue(url?: string) {
    this.musicService.queue(url ? url : this.url);
  }

  togglePause() {
    this.musicService.togglePause();
  }

  remove(id: number) {
    this.musicService.remove(id);
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

  bookmarkTools() {
    this.dialog.open(BookmarkCreatorComponent, {
      data: {
        guildId: this.guild.id
      }
    });
  }

  channels() {
    this.dialog.open(JoinChannelComponent);
  }

  leave() {
    this.musicService.leave();
  }
}
