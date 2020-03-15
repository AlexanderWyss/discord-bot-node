import fs from "fs";
import path from "path";
import Youtube, {util, Video, YouTube} from "simple-youtube-api";
import {Readable} from "stream";
import ytdl from "ytdl-core";
import {TrackInfo} from "./TrackInfo";

export class YoutubeService {

  public static currentId = 0;

  public static getInstance() {
    if (!this.instance) {
      this.instance = new YoutubeService(process.env.YOUTUBE_API);
    }
    return this.instance;
  }

  private static instance: YoutubeService;

  private youtube: YouTube;

  private constructor(key: string) {
    // @ts-ignore
    this.youtube = new Youtube(key);
  }

  public getInfo(param: string): Promise<TrackInfo> {
    try {
      const urlInfo = util.parseURL(param);
      if (urlInfo.video) {
        return this.getVideoInfo(urlInfo.video).then(video => this.map(video));
      } else {
        return this.searchVideoInfo(param).then(video => this.map(video));
      }
    } catch (e) {
      throw new Error("No Video found.");
    }
  }

  public getStream(url: string): Readable {
    return ytdl(url, {filter: "audioonly", quality: "highestaudio"});
  }

  private map(video: Video): TrackInfo {
    return {
      id: YoutubeService.currentId++,
      url: video.url,
      title: video.title,
      artist: video.channel.title,
      thumbnailUrl: (video.thumbnails as any).high.url
    };
  }

  private searchVideoInfo(query: string): Promise<Video> {
    return this.youtube.searchVideos(query, 1).then(videos => videos[0]);
  }

  private getVideoInfo(id: string): Promise<Video> {
    return this.youtube.getVideoByID(id);
  }
}
