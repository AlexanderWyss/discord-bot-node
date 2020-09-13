import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {PlaylistInfo, ShelfInfo, TrackInfo} from '../models';

export type Events = 'NOW' | 'NEXT' | 'QUEUE' | 'REMOVE' | 'BROWSE' | 'RADIO';

export interface TrackInfoEvent {
  type: Events;
  params: TrackInfo|ShelfInfo|PlaylistInfo;
}

@Component({
  selector: 'app-track-info',
  templateUrl: './track-info.component.html',
  styleUrls: ['./track-info.component.scss']
})
export class TrackInfoComponent implements OnInit {

  @Input() track: any;
  @Input() events: Events[];
  @Output() event = new EventEmitter<TrackInfoEvent>();


  constructor() {
  }

  ngOnInit() {
  }

  emit(type: Events, params: any) {
    this.event.emit({
      type,
      params
    });
  }
}
