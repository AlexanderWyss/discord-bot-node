import {TrackScheduler} from "./TrackScheduler";

export interface TrackSchedulerObserver {
  onChange(trackScheduler: TrackScheduler): void;
}
