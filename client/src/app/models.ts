export interface TrackInfo {
  readonly id?: number;
  readonly url: string;
  readonly title: string;
  readonly artist: string;
  readonly thumbnailUrl: string;
  readonly duration: number;
}

export interface QueueInfo {
  currentTrack: CurrentTrackInfo;
  tracks: TrackInfo[];
  previousTracks: TrackInfo[];
}

export interface CurrentTrackInfo extends TrackInfo {
  readonly paused: boolean;
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
