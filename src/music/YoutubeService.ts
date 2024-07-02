import {Readable} from "stream";
import ytdl, {Author, relatedVideo, videoInfo} from "ytdl-core";
import ytpl, {Item as ytplItem} from "ytpl";
import ytsr, {Playlist, Video} from "@distube/ytsr";
import {PlaylistInfo, ShelfInfo, TrackInfo} from "./TrackInfo";

export class YoutubeService {
    public static currentId = 0;
    private readonly radioMaxLength: number = 600;

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

    private constructor() {
        if (process.env.RADIO_MAX_VIDEO_LENGTH != null) {
            this.radioMaxLength = parseInt(process.env.RADIO_MAX_VIDEO_LENGTH, 10);
        }
    }

    public getInfo(param: string): Promise<TrackInfo | TrackInfo[]> {
        try {
            let promise: Promise<TrackInfo | TrackInfo[]>;
            if (ytpl.validateID(param)) {
                promise = this.getPlaylistTracks(param);
            } else if (ytdl.validateURL(param)) {
                promise = this.getVideoInfo(param);
            } else {
                promise = this.search(param).then(items => items.find(item => item.type === 'video') as TrackInfo);
            }
            return promise.then(value => {
                if (!value || (value instanceof Array && value.length === 0)) {
                    throw new Error("No Video found.");
                }
                return value;
            });
        } catch (e) {
            return Promise.reject("No Video found.");
        }
    }

    public radio(url: string, includeCurrent: boolean): Promise<TrackInfo[]> {
        if (ytdl.validateURL(url)) {
            return ytdl.getBasicInfo(url).then(info => {
                let tracks = info.related_videos.map(related => this.parseReleatedVideo(related)).filter(track => track.duration);
                if (this.radioMaxLength) {
                    const filteredTracks = tracks.filter(track => track.duration <= this.radioMaxLength);
                    if (filteredTracks.length !== 0) {
                        tracks = filteredTracks;
                    } else {
                        console.log("Radio filter ignored. No track matches length criteria.")
                    }
                }
                if (includeCurrent) {
                    tracks.unshift(this.parseVideoInfo(info));
                }
                return tracks;
            });
        } else {
            return Promise.reject("not a video");
        }
    }

    public getPlaylistTracks(param: string): Promise<TrackInfo[]> {
        return ytpl(param)
            .then(playlist => playlist.items.filter(item => item.author && item.duration))
            .then(items => items.map(item => this.parsePlaylistItem(item as ytplItem)));
    }

    public getStream(url: string): Readable {
        // tslint:disable-next-line:no-bitwise
        return ytdl(url, {filter: "audioonly", quality: "highestaudio", highWaterMark: 1 << 25});
    }

    public search(query: string): Promise<(TrackInfo | ShelfInfo | PlaylistInfo)[]> {
        let videoResultPromise = ytsr(query, {
            limit: 20,
            type: 'video'
        });
        let playlistResultPromise = ytsr(query, {
            limit: 5,
            type: 'playlist'
        });
        return Promise.all([videoResultPromise, playlistResultPromise])
            .then(async ([videoResult, playlistResult]) => {
                    let infos = []
                    for (let item of [...videoResult.items, ...playlistResult.items]) {
                        let info = await this.parse(item)
                        if (info) {
                            infos.push(info);
                        }
                    }
                    return infos;
                }
            );
    }

    private async parse(item: Video | Playlist): Promise<TrackInfo | ShelfInfo | PlaylistInfo> {
        if (item.type === "video") {
            const trackInfo = this.parseVideo(item as Video);
            if (trackInfo.duration) {
                return trackInfo;
            } else {
                return undefined;
            }
        } else if (item.type === "playlist") {
            return await this.parsePlaylist(item as Playlist);
        }
        return undefined;
    }


    private parseVideo(video: Video): TrackInfo {
        return {
            type: "video",
            id: YoutubeService.currentId++,
            url: video.url,
            title: video.name,
            artist: video.author.name,
            thumbnailUrl: video.thumbnail,
            duration: YoutubeService.getInSeconds(video.duration)
        };
    }

    private async parsePlaylist(playlist: Playlist): Promise<PlaylistInfo> {
        return {
            type: "playlist",
            title: playlist.name,
            thumbnailUrl: await (this.getPlaylistTracks(playlist.url).then(tracks => {
                if (tracks && tracks.length > 0) {
                    return tracks[0].thumbnailUrl
                }
                return playlist.name
            })),
            artist: playlist.owner.name,
            url: playlist.url,
            length: playlist.length
        };
    }

    private getVideoInfo(url: string): Promise<TrackInfo> {
        return ytdl.getBasicInfo(url).then(video => {
            if (video) {
                const trackInfo = this.parseVideoInfo(video);
                if (!trackInfo.duration) {
                    throw new Error("Video not supported.");
                }
                return trackInfo;
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
            artist: (related.author as Author).name,
            thumbnailUrl: related.thumbnails[0].url,
            duration: related.length_seconds
        };
    }

    private parseVideoInfo(video: videoInfo): TrackInfo {
        return {
            type: "video",
            id: YoutubeService.currentId++,
            url: video.videoDetails.video_url,
            title: video.videoDetails.title,
            artist: video.videoDetails.author.name,
            thumbnailUrl: video.videoDetails.thumbnails[0].url,
            duration: parseInt(video.player_response.videoDetails.lengthSeconds, 10)
        };
    }

    private parsePlaylistItem(item: ytplItem): TrackInfo {
        return {
            type: "video",
            id: YoutubeService.currentId++,
            url: item.shortUrl,
            title: item.title,
            artist: item.author.name,
            thumbnailUrl: item.bestThumbnail.url,
            duration: item.durationSec
        };
    }
}
