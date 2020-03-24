import {Readable} from "stream";
import ytdl, {videoInfo} from "ytdl-core";
import ytsr, {SearchItem, ShelfVertical, Video} from "ytsr";
import {ShelfInfo, TrackInfo} from "./TrackInfo";

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
            return parseInt(hours) * 60 * 60 + parseInt(minutes) * 60 + parseInt(seconds);
        } else {
            return 0;
        }
    }

    private static flatten(array: any[]): any[] {
        return array.reduce((acc, val) => Array.isArray(val) ? acc.concat(YoutubeService.flatten(val)) : acc.concat(val), []);
    }

    private constructor() {
    }

    public getInfo(param: string): Promise<TrackInfo> {
        try {
            if (ytdl.validateURL(param)) {
                return this.getVideoInfo(param);
            } else {
                return this.searchVideoInfo(param);
            }
        } catch (e) {
            throw new Error("No Video found.");
        }
    }

    public getStream(url: string): Readable {
        return ytdl(url, {filter: "audioonly", quality: "highestaudio", highWaterMark: 1 << 25});
    }

    public search(query: string): Promise<Array<TrackInfo|ShelfInfo>> {
        return ytsr(query, {
            limit: 20
        }).then(res => res.items.map(video => this.map(video)).filter(video => video));
    }

    private map(item: SearchItem): TrackInfo | ShelfInfo {
        if (item.type === "shelf-vertical") {
            return this.parseShelfVertical(item as ShelfVertical);
        } else if (item.type === "video") {
            return this.parseVideo(item as Video);
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

    private searchVideoInfo(query: string): Promise<TrackInfo> {
        return ytsr.getFilters(query).then(filters => {
            const videoFilter = filters.get("Type").find(filter => filter.name === "Video");
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
                const thumbnails = video.player_response.videoDetails.thumbnail.thumbnails;
                return {
                    type: "video",
                    id: YoutubeService.currentId++,
                    url: video.video_url,
                    title: video.title,
                    artist: video.author.name,
                    thumbnailUrl: thumbnails[thumbnails.length - 2].url,
                    duration: video.player_response.videoDetails.lengthSeconds
                };
            } else {
                throw new Error("Video not found");
            }
        });
    }
}
