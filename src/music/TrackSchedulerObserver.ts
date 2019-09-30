import {TrackInfo} from "./TrackInfo";
import {TrackScheduler} from "./TrackScheduler";

export interface TrackSchedulerObserver {
  onChange(nowPlaying: TrackInfo, trackScheduler: TrackScheduler): void;
}
