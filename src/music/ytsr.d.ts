declare module 'ytsr' {
    import {Options, SearchResult} from "ytsr";
    namespace ytsr {
        interface SearchResult {
            query: string;
            items: SearchItem[];
            nextpageRef: string;
            results: string;
            filters: Filter[];
            currentRef: string;
        }

        interface SearchItem {
            type: string;
        }

        interface Video extends SearchItem {
            type: "video";
            live: boolean;
            title: string;
            link: string;
            thumbnail: string;
            author: Author;
            description: string;
            views: number;
            duration: string;
            uploaded_at: string;
        }

        interface Playlist extends SearchItem {
            type: "playlist";
            title: string;
            link: string;
            thumbnail: string;
            author: Author;
            length: string;
        }

        interface Channel extends SearchItem {
            type: "channel";
            name: string;
            channel_id: string;
            link: string;
            avatar: string;
            verified: boolean;
            followers: number;
            description_short: string;
            videos: number;
        }

        interface Movie extends SearchItem {
            type: "movie";
            title: string;
            link: string;
            thumbnail: string;
            author: Author;
            description: string;
            meta: string;
            actors: string;
            director: string;
            duration: number;
        }

        interface RelatedSearches extends SearchItem {
            type: "search-refinements";
            entrys: RelatedSearchEntry[];
        }

        interface RelatedSearchEntry {
            link: string;
            q: string;
        }

        interface Shelf extends SearchItem {
            type: "shelf-compact";
            title: string;
            items: ShelfItem[];
        }

        interface ShelfItem {
            type: string;
            name: string;
            ref: string;
            thumbnail: string;
            duration: string;
            price: string;
        }

        interface ShelfVertical extends  SearchItem {
            type: "shelf-vertical";
            title: string;
            items: Video[];
        }

        interface Filter {
            ref: string;
            name: string;
            active: string;
        }

        interface Author {
            name: string;
            ref: string;
            verified: boolean;
        }

        interface Options {
            nextpageRef?: string;
            limit?: number;
        }

        function getFilters(search: string): Promise<Map<'Upload Date' | 'Type' | 'Duration' | 'Features' | 'Sort by', Filter[]>>;
    }

    function ytsr(link: string, options?: Options): Promise<SearchResult>;

    export = ytsr;
}
