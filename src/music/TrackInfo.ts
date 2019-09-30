export interface TrackInfo {
  readonly id: number;
  readonly url: string;
  readonly title: string;
  readonly artist: string;
  readonly thumbnailUrl: string;
}

export interface CurrentTrackInfo extends TrackInfo{

}
