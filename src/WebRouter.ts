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
            return this.bot.getGuildMusicManagerById(req.params.guildId).queue(req.params.url)
                .then(() => res.end());
        });
        this.router.get("/:guildId/next/:url", (req: any, res: any, next: any) => {
            return this.bot.getGuildMusicManagerById(req.params.guildId).playNext(req.params.url)
                .then(() => res.end());
        });
        this.router.get("/:guildId/now/:url", (req: any, res: any, next: any) => {
            return this.bot.getGuildMusicManagerById(req.params.guildId).playNow(req.params.url)
                .then(() => res.end());
        });
        this.router.get("/:guildId/skip", (req: any, res: any, next: any) => {
            return this.bot.getGuildMusicManagerById(req.params.guildId).skip()
            res.end();
        });
        this.router.get("/:guildId/skipBack", (req: any, res: any, next: any) => {
            return this.bot.getGuildMusicManagerById(req.params.guildId).skipBack()
            res.end();
        });
        return this.router;
    }
}
