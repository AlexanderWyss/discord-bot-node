import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {PlaylistInfo, QueueInfo, QueueType, ShelfInfo, TrackInfo} from '../models';
import {MusicService} from '../music.service';
import {MatDialog} from '@angular/material/dialog';
import {TrackInfoEvent} from '../track-info/track-info.component';
import {CdkDragDrop, copyArrayItem, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import {ClearPlaylistComponent} from '../clear-playlist/clear-playlist.component';
import {MatSliderChange} from '@angular/material/slider';
import {MatRipple, RippleRef} from '@angular/material/core';

@Component({
  selector: 'app-queue',
  templateUrl: './queue.component.html',
  styleUrls: ['./queue.component.scss']
})
export class QueueComponent implements OnInit, OnDestroy {

  @Input() searchResult: Array<TrackInfo | ShelfInfo | PlaylistInfo> = [];
  queueInfo: QueueInfo;
  counter;
  isSeeking = false;
  private seekTimeout: number;
  private volumeTimeout: number;
  volumeOpenHover = false;
  volumeOpenToggled = false;
  private volumeHoverTimeout: number;
  @ViewChild('volumeButtonRipple') volumeButtonRipple: MatRipple;
  private volumeButtonRippleRef: RippleRef;

  constructor(private musicService: MusicService,
              private dialog: MatDialog) {
  }


  ngOnInit() {
    this.musicService.onTracks().subscribe(queueInfo => this.queueInfo = queueInfo);
    this.counter = setInterval(() => {
      if (this.queueInfo && this.queueInfo.currentTrack && this.queueInfo.currentTrack.id != null && !this.queueInfo.currentTrack.paused
        && this.queueInfo.currentTrack.position !== null && !this.isSeeking) {
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

  seek(event: MatSliderChange) {
    this.clearSeekTimeout();
    this.seekTimeout = setTimeout(() =>
      this.musicService.seek(event.value), 250);
    this.isSeeking = false;
  }

  whileSeeking(value: number) {
    this.clearSeekTimeout();
    this.isSeeking = true;
    this.queueInfo.currentTrack.position = value;
  }

  private clearSeekTimeout() {
    if (this.seekTimeout != null) {
      clearTimeout(this.seekTimeout);
      this.seekTimeout = null;
    }
  }

  setVolume(volume: number) {
    this.clearVolumeTimeout();
    this.volumeTimeout = setTimeout(() =>
      this.musicService.setVolume(volume), 250);
  }

  whileVolumeChange(value: number) {
    this.clearVolumeTimeout();
  }

  private clearVolumeTimeout() {
    if (this.volumeTimeout != null) {
      clearTimeout(this.volumeTimeout);
      this.volumeTimeout = null;
    }
  }

  toggleVolumeDisplay() {
    this.volumeOpenToggled = !this.volumeOpenToggled;
    if (this.volumeOpenToggled) {
      this.volumeButtonRippleRef = this.volumeButtonRipple.launch({persistent: true, centered: true, radius: 20});
    } else if (this.volumeButtonRippleRef) {
      this.volumeButtonRippleRef.fadeOut();
    }
  }

  volumeHover() {
    this.clearVolumeHoverTimeout();
    this.volumeOpenHover = true;
  }

  volumeHoverEnd() {
    this.clearVolumeHoverTimeout();
    this.volumeHoverTimeout = setTimeout(() =>
      this.volumeOpenHover = false, 250);
  }


  private clearVolumeHoverTimeout() {
    if (this.volumeHoverTimeout != null) {
      clearTimeout(this.volumeHoverTimeout);
      this.volumeHoverTimeout = null;
    }
  }
}
