import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {TrackInfo} from '../models';

export type Events = 'NOW' | 'NEXT' | 'QUEUE' | 'REMOVE';

export interface TrackInfoEvent {
  type: Events;
  params: any;
}

@Component({
  selector: 'app-track-info',
  templateUrl: './track-info.component.html',
  styleUrls: ['./track-info.component.scss']
})
export class TrackInfoComponent implements OnInit {

  @Input() track: TrackInfo;
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
