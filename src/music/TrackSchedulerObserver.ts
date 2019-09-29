import {Video} from "simple-youtube-api";
import {TrackScheduler} from "./TrackScheduler";

export interface TrackSchedulerObserver {
  onChange(nowPlaying: Video, trackScheduler: TrackScheduler): void;
}
