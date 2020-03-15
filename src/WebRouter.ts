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
        this.router.get(":guildId/queue/:url", (req: any, res: any, next: any) => {
          return this.bot.getGuildMusicManagerById(req.params.guildId).queue(req.params.url)
              .then(() => res.sendStatus(200));
        });
        return this.router;
    }
}
