import fs from "fs";
import path from "path";
import Youtube, {util, Video, YouTube} from "simple-youtube-api";
import {Readable} from "stream";
import ytdl from "ytdl-core";

export class YoutubeService {

  public static getInstance() {
    if (!this.instance) {
      this.instance = new YoutubeService(fs.readFileSync(path.join(__dirname, "../youtube-api.txt"), "utf8").toString().trim());
    }
    return this.instance;
  }

  private static instance: YoutubeService;

  private youtube: YouTube;

  private constructor(key: string) {
    // @ts-ignore
    this.youtube = new Youtube(key);
  }

  public getInfo(param: string): Promise<Video> {
    try {
      let video: Video;
      const urlInfo = util.parseURL(param);
      if (urlInfo.video) {
        return this.getVideoInfo(urlInfo.video);
      } else {
        return this.searchVideoInfo(param);
      }
    } catch (e) {
      throw new Error("No Video found.");
    }
  }

  public getStream(url: string): Readable {
    return ytdl(url, {filter: "audioonly", quality: "highestaudio"});
  }

  private searchVideoInfo(query: string): Promise<Video> {
    return this.youtube.searchVideos(query, 1).then(videos => videos[0]);
  }

  private getVideoInfo(id: string): Promise<Video> {
    return this.youtube.getVideoByID(id);
  }
}
