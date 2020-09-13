import {Readable} from "stream";
import ytdl, {relatedVideo, videoInfo} from "ytdl-core";
import ytpl from "ytpl";
import ytsr, {Filter, Playlist, ShelfVertical, Video} from "ytsr";
import {PlaylistInfo, PlaylistItem, ShelfInfo, TrackInfo} from "./TrackInfo";

export class YoutubeService {

  public static currentId = 0;

  public static getInstance() {
    if (!this.instance) {
      this.instance = new YoutubeService();
    }
    return this.instance;
  }

  public static resolveId(): number {
    return YoutubeService.currentId++;
  }

  private static instance: YoutubeService;

  private static getInSeconds(duration: string): number {
    if (duration) {
      const split = duration.split(":");
      const hours = split.length === 3 ? split[0] : "0";
      const minutes = split.length === 3 ? split[1] : split[0];
      const seconds = split.length === 3 ? split[2] : split[1];
      return parseInt(hours, 10) * 60 * 60 + parseInt(minutes, 10) * 60 + parseInt(seconds, 10);
    } else {
      return 0;
    }
  }

  private static flatten(array: any[]): any[] {
    return array.reduce((acc, val) =>
      Array.isArray(val) ?
        acc.concat(YoutubeService.flatten(val)) :
        acc.concat(val), []);
  }

  private constructor() {
  }

  public getInfo(param: string): Promise<TrackInfo | TrackInfo[]> {
    try {
      if (ytpl.validateID(param)) {
        return this.getPlaylistTracks(param);
      } else if (ytdl.validateURL(param)) {
        return this.getVideoInfo(param);
      } else {
        return this.searchVideoInfo(param);
      }
    } catch (e) {
      throw new Error("No Video found.");
    }
  }

  public radio(url: string, includeCurrent: boolean): Promise<TrackInfo[]> {
    if (ytdl.validateURL(url)) {
      return ytdl.getBasicInfo(url).then(info => {
        const tracks = info.related_videos.map(related => this.parseReleatedVideo(related));
        if (includeCurrent) {
          tracks.unshift(this.parseVideoInfo(info));
        }
        return tracks;
      });
    } else {
      throw new Error("not a video");
    }
  }

  public getPlaylistTracks(param: string): Promise<TrackInfo[]> {
    return ytpl(param)
      .then(playlist => playlist.items.filter(item => item.author !== null && item.duration !== null))
      .then(items => items.map(item => this.parsePlaylistItem(item)));
  }

  public getStream(url: string): Readable {
    // tslint:disable-next-line:no-bitwise
    return ytdl(url, {filter: "audioonly", quality: "highestaudio", highWaterMark: 1 << 25});
  }

  public search(query: string): Promise<Array<TrackInfo | ShelfInfo | PlaylistInfo>> {
    return ytsr(query, {
      limit: 20
    }).then(res => res.items.map(item => this.parse(item)).filter(video => video));
  }

  private parse(item: SearchItem): TrackInfo | ShelfInfo | PlaylistInfo {
    if (item.type === "shelf-vertical") {
      return this.parseShelfVertical(item as ShelfVertical);
    } else if (item.type === "video") {
      return this.parseVideo(item as Video);
    } else if (item.type === "playlist") {
      return this.parsePlaylist(item as Playlist);
    }
    return undefined;
  }

  private parseShelfVertical(shelf: ShelfVertical): ShelfInfo {
    return {
      type: "shelf",
      title: shelf.title,
      items: shelf.items.map(item => this.parseVideo(item)),
      thumbnailUrl: shelf.items.length > 0 ? shelf.items[0].thumbnail : ""
    };
  }

  private parseVideo(video: Video): TrackInfo {
    return {
      type: "video",
      id: YoutubeService.currentId++,
      url: video.link,
      title: video.title,
      artist: video.author.name,
      thumbnailUrl: video.thumbnail,
      duration: YoutubeService.getInSeconds(video.duration)
    };
  }

  private parsePlaylist(playlist: Playlist): PlaylistInfo {
    return {
      type: "playlist",
      title: playlist.title,
      thumbnailUrl: playlist.thumbnail,
      artist: playlist.author.name,
      url: playlist.link,
      length: playlist.length
    };
  }

  private searchVideoInfo(query: string): Promise<TrackInfo> {
    return ytsr.getFilters(query).then(filters => {
      const videoFilter = (filters.get("Type") as any as Filter[]).find(value => value.name === "Video");
      return ytsr(null, {
        limit: 4,
        nextpageRef: videoFilter.ref
      }).then(res => res.items.find(item => item.type === "video"))
        .then(item => this.parseVideo(item as Video));
    });
  }

  private getVideoInfo(url: string): Promise<TrackInfo> {
    return ytdl.getBasicInfo(url).then(video => {
      if (video) {
        return this.parseVideoInfo(video);
      } else {
        throw new Error("Video not found");
      }
    });
  }

  private parseReleatedVideo(related: relatedVideo): TrackInfo {
    return {
      type: "video",
      id: YoutubeService.currentId++,
      url: "https://www.youtube.com/watch?v=" + related.id,
      title: related.title,
      artist: related.author,
      thumbnailUrl: (related as any).video_thumbnail,
      duration: parseInt(related.length_seconds, 10)
    } as TrackInfo;
  }

  private parseVideoInfo(video: videoInfo): TrackInfo {
    const thumbnails = video.player_response.videoDetails.thumbnail.thumbnails;
    return {
      type: "video",
      id: YoutubeService.currentId++,
      url: video.videoDetails.video_url,
      title: video.videoDetails.title,
      artist: video.videoDetails.author.name,
      thumbnailUrl: thumbnails[thumbnails.length - 2].url,
      duration: parseInt(video.player_response.videoDetails.lengthSeconds, 10)
    };
  }

  private parsePlaylistItem(item: PlaylistItem): TrackInfo {
    return {
      type: "video",
      id: YoutubeService.currentId++,
      url: item.url_simple,
      title: item.title,
      artist: item.author.name,
      thumbnailUrl: item.thumbnail,
      duration: YoutubeService.getInSeconds(item.duration)
    };
  }
}

interface SearchItem {
  type: string;
}
