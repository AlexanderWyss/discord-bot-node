import {Readable} from "stream";
import ytdl, {videoInfo} from "ytdl-core";
import ytsr, {Playlist, SearchItem, ShelfVertical, Video} from "ytsr";
import {PlaylistInfo, PlaylistItem, ShelfInfo, TrackInfo} from "./TrackInfo";
import ytpl from "./ytpl";

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

    public getInfo(param: string): Promise<TrackInfo | TrackInfo[]> {
        try {
            if (ytpl.validateURL(param)) {
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

    public getPlaylistTracks(param: string): Promise<TrackInfo[]> {
        return ytpl(param).then(playlist => playlist.items.map(item => this.parsePlaylistItem(item)));
    }

    public getStream(url: string): Readable {
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
