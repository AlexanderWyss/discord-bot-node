declare module "simple-youtube-api" {
  namespace YouTube {
    class YouTube {
      public key: string;
      public request: Request;

      constructor(key: string);

      public getVideo(url: string, options?: object): Promise<Video | null>;

      public getPlaylist(url: string, options?: object): Promise<Playlist | null>;

      public getChannel(url: string, options?: object): Promise<Channel | null>;

      public getVideoByID(id: string, options?: object): Promise<Video | null>;

      public getPlaylistByID(id: string, options?: object): Promise<Playlist | null>;

      public getChannelByID(id: string, options?: object): Promise<Channel | null>;

      public search(query: string, limit: number, options?: object): Promise<Array<Video | Playlist | Channel | null>>;

      public searchVideos(query: string, limit: number, options?: object): Promise<Video[]>;

      public searchPlaylists(query: string, limit: number, options?: object): Promise<Playlist[]>;

      public searchChannels(query: string, limit: number, options?: object): Promise<Channel[]>;
    }

    class Channel {
      public youtube: YouTube;
      public type: string;
      public raw: object;
      public full: boolean;
      public kind: string;
      public id: string;
      public title?: string;
      public description?: string;
      public customURL?: string;
      public publishedAt?: Date;
      public thumbnails?: { [key: string]: string };
      public defaultLanguage?: string;
      public localized?: { title: string; description: string };
      public country?: string;
      public relatedPlaylists?: { likes: string; favorites: string; uploads: string; };
      public viewCount?: number;
      public commentCount?: number;
      public subscriberCount?: number;
      public hiddenSubscriberCount?: boolean;
      public videoCount?: number;
      public readonly url: string;

      constructor(youtube: YouTube, data: object);

      private _patch(data: object): this;

      public fetch(options: object): Promise<this>;

      static extractID(url: string): string | null;
    }

    class Playlist {
      public youtube: YouTube;
      public type: string;
      public videos: Array<Video>;
      public raw: object;
      public channel: Channel;
      public id: string;
      public title?: string;
      public description?: string;
      public publishedAt?: Date;
      public thumbnails?: { [key: string]: string };
      public channelTitle?: string;
      public defaultLanguage?: string;
      public localized?: { title: string; description: string };
      public privacy: string;
      public length: number;
      public embedHTML: string;
      public readonly url: string;

      constructor(youtube: YouTube, data: object);

      private _patch(data: object): this;

      public fetch(options: object): Promise<this>;

      public getVideos(limit: number, options: object): Promise<Video[]>;

      static extractID(url: string): string | null;
    }

    class Video {
      public youtube: YouTube;
      public type: string;
      public raw: object;
      public full: boolean;
      public kind: string;
      public id: string;
      public title: string;
      public description: string;
      public thumbnails: { [key: string]: string };
      public publishedAt: Date;
      public channel: Channel;
      public duration: Duration;
      public readonly url: string;
      public readonly maxRes: object;
      public readonly shortURL: string;
      public readonly durationSeconds: number;

      constructor(youtube: YouTube, data: object);

      private _patch(data: object): this;

      public fetch(options: object): Promise<this>;

      static extractID(url: string): string | null;
    }

    type Duration = {
      hours: number;
      minutes: number;
      seconds: number;
    }

    namespace util {
      function parseURL(url: string): { video?: string; channel?: string; playlist?: string };
    }

  }
  export = YouTube;
}

