import {Component, OnDestroy, OnInit} from '@angular/core';
import {MusicService} from '../music.service';
import {GuildInfo, PlaylistInfo, QueueInfo, ShelfInfo, TrackInfo} from '../models';
import {TrackInfoEvent} from '../track-info/track-info.component';
import {MatDialog} from '@angular/material/dialog';
import {BookmarkCreatorComponent} from '../bookmark-creator/bookmark-creator.component';
import {JoinChannelComponent} from '../join-channel/join-channel.component';
import {CdkDragDrop, moveItemInArray, copyArrayItem} from '@angular/cdk/drag-drop';
import {ClearPlaylistComponent} from '../clear-playlist/clear-playlist.component';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit, OnDestroy {

  guild: GuildInfo;
  userId: string;
  queueInfo: QueueInfo;
  url = '';
  searchResult: Array<TrackInfo | ShelfInfo | PlaylistInfo> = [];
  loading: boolean;
  counter;
  isBrowsing: boolean;
  cache: Array<TrackInfo | ShelfInfo | PlaylistInfo> = [];

  constructor(private musicService: MusicService,
              private dialog: MatDialog) {
  }


  ngOnInit() {
    this.musicService.onTracks().subscribe(queueInfo => this.queueInfo = queueInfo);
    this.musicService.onGuild().subscribe(guild => this.guild = guild);
    this.counter = setInterval(() => {
      if (this.queueInfo && this.queueInfo.currentTrack && !this.queueInfo.currentTrack.paused
        && this.queueInfo.currentTrack.position !== null) {
        this.queueInfo.currentTrack.position++;
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.counter);
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
    if (!this.url || this.url.trim() === '') {
      this.searchResult = [];
      return;
    }
    this.loading = true;
    this.isBrowsing = false;
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
        this.remove((event.params as TrackInfo).id);
        break;
      case 'NOW':
        this.musicService.now(event.params);
        break;
      case 'NEXT':
        this.musicService.next(event.params);
        break;
      case 'QUEUE':
        this.musicService.queue(event.params);
        break;
      case 'RADIO':
        this.musicService.radio(event.params);
        break;
      case 'BROWSE':
        if (event.params.type === 'shelf') {
          this.browse(event.params.items);
        } else if (event.params.type === 'playlist') {
          this.loading = true;
          this.musicService.getPlaylistTracks(event.params.url).subscribe(res => {
            this.browse(res);
            this.loading = false;
          }, err => {
            console.error(err);
            this.loading = false;
          });
        }
        break;
    }
  }

  private browse(tracks: TrackInfo[]) {
    this.isBrowsing = true;
    this.cache = this.searchResult;
    this.searchResult = tracks;
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

  toggleRepeat() {
    this.musicService.toggleRepeat();
  }

  toggleAutoRadio() {
    this.musicService.toggleAutoRadio();
  }

  drop(event: CdkDragDrop<TrackInfo[], any>) {
    if (event.previousContainer.id === 'searchList') {
      this.musicService.add(this.searchResult[event.previousIndex], event.currentIndex);
      copyArrayItem(this.searchResult, this.queueInfo.tracks, event.previousIndex, event.currentIndex);
    } else {
      this.musicService.move(this.queueInfo.tracks[event.previousIndex].id, event.currentIndex);
      moveItemInArray(this.queueInfo.tracks, event.previousIndex, event.currentIndex);
    }
  }

  clear() {
    this.dialog.open(ClearPlaylistComponent).afterClosed().subscribe(res => {
      if (res) {
        this.musicService.clearPlaylist();
      }
    });
  }

  back() {
    this.isBrowsing = false;
    this.searchResult = this.cache;
    this.cache = [];
  }

  selectInput(event: MouseEvent) {
    (event.target as any).select();
  }
}
