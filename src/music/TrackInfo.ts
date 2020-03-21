export interface TrackInfo {
    readonly id: number;
    readonly url: string;
    readonly title: string;
    readonly artist: string;
    readonly thumbnailUrl: string;
    readonly duration: number;
}

export interface CurrentTrackInfo extends TrackInfo {
  readonly paused: boolean;
}
