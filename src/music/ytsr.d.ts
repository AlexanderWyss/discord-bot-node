declare module 'ytsr' {
    import {Options, SearchResult} from "ytsr";
    namespace ytsr {
        interface SearchResult {
            query: string;
            items: SearchItem[];
            nextpageRef: string,
            results: string,
            filters: Filter[],
            currentRef: string
        }

        interface SearchItem {
            type: 'video' | 'movie' | 'channel' |'playlist';
            title: string;
            link: string;
            thumbnail: string;
            author: Author;
            description: string;
            views: number;
            duration: string;
            uploaded_at: string;
        }

        interface Filter {
            ref: string;
            name: string;
            active: string;
        }

        interface Author {
            name: string;
            ref: string;
            verified: string;
        }

        interface Options {
            nextpageRef: string;
            limit: number;
        }

        function getFilters(search: string): Promise<Map<'Upload Date' | 'Type' | 'Duration' | 'Features' | 'Sort by', Filter[]>>;
    }

    function ytsr(link: string, options?: Options): Promise<SearchResult>;

    export = ytsr;
}
