import {Author, Video} from "ytsr";

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

export interface PlaylistInfo {
    type: "playlist";
    title: string;
    url: string;
    thumbnailUrl: string;
    artist: string;
    length: string;
}

export interface CurrentTrackInfo extends TrackInfo {
  readonly paused: boolean;
  readonly position: number;
}

export interface PlaylistItem {
    id: string;
    url: string;
    url_simple: string;
    title: string;
    thumbnail: string;
    duration: string;
    author: {
        id: string;
        name: string;
        user: string;
        channel_url: string;
        user_url: string;
    };
}
