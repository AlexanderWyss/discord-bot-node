import {Video} from "ytsr";

export interface TrackInfo {
    readonly type: "video";
    id: number;
    readonly url: string;
    readonly title: string;
    readonly artist: string;
    readonly thumbnailUrl: string;
    readonly duration: number;
}

export interface ShelfInfo {
    type: "shelf";
    title: string;
    thumbnailUrl: string;
    items: TrackInfo[];
}

export interface CurrentTrackInfo extends TrackInfo {
  readonly paused: boolean;
  readonly position: number;
}
