import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {PlaylistInfo, QueueInfo, ShelfInfo, TrackInfo} from '../models';
import {MusicService} from '../music.service';
import {MatDialog} from '@angular/material/dialog';
import {TrackInfoEvent} from '../track-info/track-info.component';
import {CdkDragDrop, copyArrayItem, moveItemInArray} from '@angular/cdk/drag-drop';
import {ClearPlaylistComponent} from '../clear-playlist/clear-playlist.component';

@Component({
  selector: 'app-queue',
  templateUrl: './queue.component.html',
  styleUrls: ['./queue.component.scss']
})
export class QueueComponent implements OnInit, OnDestroy {

  @Input() searchResult: Array<TrackInfo | ShelfInfo | PlaylistInfo> = [];
  queueInfo: QueueInfo;
  counter;

  constructor(private musicService: MusicService,
              private dialog: MatDialog) {
  }


  ngOnInit() {
    this.musicService.onTracks().subscribe(queueInfo => this.queueInfo = queueInfo);
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

  togglePause() {
    this.musicService.togglePause();
  }

  remove(id: number) {
    this.musicService.remove(id);
  }

  trackInfoEvent(event: TrackInfoEvent) {
    switch (event.type) {
      case 'REMOVE':
        this.remove((event.params as TrackInfo).id);
        break;
    }
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
}
