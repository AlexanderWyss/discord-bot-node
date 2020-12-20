export interface TrackInfo {
  type: 'video';
  readonly id?: number;
  readonly url: string;
  readonly title: string;
  readonly artist: string;
  readonly thumbnailUrl: string;
  readonly duration: number;
}

export interface ShelfInfo {
  type: 'shelf';
  title: string;
  thumbnailUrl: string;
  items: TrackInfo[];
}

export interface PlaylistInfo {
  type: 'playlist';
  title: string;
  url: string;
  thumbnailUrl: string;
  artist: string;
  length: number;
}

export interface QueueInfo {
  currentTrack: CurrentTrackInfo;
  tracks: TrackInfo[];
  previousTracks: TrackInfo[];
  repeat: boolean;
  autoRadio: boolean;
}

export interface CurrentTrackInfo extends TrackInfo {
  readonly paused: boolean;
  position: number;
}

export interface JoinGuild {
  guildId: string;
  oldGuildId?: string;
  userId?: string;
}

export interface Channel {
  id: string;
  name: string;
}


export interface GuildInfo {
  id: string;
  name: string;
  icon: string;
}
