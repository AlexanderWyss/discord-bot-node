import express, {NextFunction, Response, Router} from "express";
import {Bot} from "./Bot";

export class WebRouter {

    private readonly router: Router;
    private readonly bot: Bot;

    constructor() {
        this.router = express.Router();
        this.bot = Bot.getInstance();
    }

    public setup(): Router {
        this.router.get("/:guildId/queue/:url", (req: any, res: any, next: any) => {
            return this.bot.getGuildMusicManagerByIdIfExists(req.params.guildId).queue(req.params.url);
        });
        this.router.get("/:guildId/next/:url", (req: any, res: any, next: any) => {
            console.log("next");
            return this.bot.getGuildMusicManagerByIdIfExists(req.params.guildId).playNext(req.params.url);
        });
        this.router.get("/:guildId/now/:url", (req: any, res: any, next: any) => {
            return this.bot.getGuildMusicManagerByIdIfExists(req.params.guildId).playNow(req.params.url);
        });
        this.router.get("/:guildId/skip", (req: any, res: any, next: any) => {
            return this.bot.getGuildMusicManagerByIdIfExists(req.params.guildId).skip();
        });
        this.router.get("/:guildId/skipBack", (req: any, res: any, next: any) => {
            return this.bot.getGuildMusicManagerByIdIfExists(req.params.guildId).skipBack();
        });
        this.router.get("/:guildId/togglePause", (req: any, res: any, next: any) => {
            return this.bot.getGuildMusicManagerByIdIfExists(req.params.guildId).togglePause();
        });
        this.router.get("/:guildId/volumeUp", (req: any, res: any, next: any) => {
            return this.bot.getGuildMusicManagerByIdIfExists(req.params.guildId).increseVolume();
        });
        this.router.get("/:guildId/volumeDown", (req: any, res: any, next: any) => {
            return this.bot.getGuildMusicManagerByIdIfExists(req.params.guildId).decreseVolume();
        });
        return this.router;
    }
}
