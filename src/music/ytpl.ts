import origYtpl from "ytpl";

declare namespace ytplExtention {
    function validateURL(url: string): string;

    function getPlaylistID(url: string): string;
}

export = origYtpl as (typeof origYtpl & typeof ytplExtention);
