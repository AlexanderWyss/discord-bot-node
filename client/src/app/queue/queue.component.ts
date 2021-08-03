import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {PlaylistInfo, QueueInfo, QueueType, ShelfInfo, TrackInfo} from '../models';
import {MusicService} from '../music.service';
import {MatDialog} from '@angular/material/dialog';
import {TrackInfoEvent} from '../track-info/track-info.component';
import {CdkDragDrop, copyArrayItem, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
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
    this.musicService.refresh();
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

  restart() {
    this.musicService.restart();
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
    const queue = this.getQueueType(event.container.id);
    const queueArray = this.getTargetArray(queue);
    if (event.previousContainer.id === 'searchList') {
      this.musicService.add(queue, this.searchResult[event.previousIndex], event.currentIndex);
      copyArrayItem(this.searchResult, queueArray, event.previousIndex, event.currentIndex);
    } else {
      const previousQueue = this.getQueueType(event.previousContainer.id);
      const previousArray = this.getTargetArray(previousQueue);
      this.musicService.move(queue, previousArray[event.previousIndex].id, event.currentIndex);
      if (queue === previousQueue) {
        moveItemInArray(queueArray, event.previousIndex, event.currentIndex);
      } else {
        transferArrayItem(previousArray, queueArray, event.previousIndex, event.currentIndex);
      }
    }
  }

  private getTargetArray(queue: QueueType) {
    if (queue === 'queue') {
      return this.queueInfo.tracks;
    }
    if (queue === 'previous') {
      return this.queueInfo.previousTracks;
    }
    throw new Error('Unknown queue array: ' + queue);
  }

  private getQueueType(id: string): QueueType {
    if (id === 'queueList') {
      return 'queue';
    }
    if (id === 'previousList') {
      return 'previous';
    }
    throw new Error('Unknown queue: ' + id);
  }

  clear() {
    this.dialog.open(ClearPlaylistComponent).afterClosed().subscribe(res => {
      if (res) {
        this.musicService.clearPlaylist();
      }
    });
  }
}
