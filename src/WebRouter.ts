import express, {NextFunction, Response, Router} from "express";
import {Bot} from "./Bot";
import {YoutubeService} from "./music/YoutubeService";

export class WebRouter {

  private readonly router: Router;
  private readonly bot: Bot;

  constructor() {
    this.router = express.Router();
    this.bot = Bot.getInstance();
  }

  public setup(): Router {
    this.router.get("/:guildId/queue/:url", (req: any, res: any, next: any) => {
      this.handleResponse(this.bot.getGuildMusicManagerByIdIfExists(req.params.guildId)
        .queue(req.params.url), res);
    });
    this.router.post("/post/:guildId/queue", (req: any, res: any, next: any) => {
      this.handleResponse(this.bot.getGuildMusicManagerByIdIfExists(req.params.guildId)
        .queue(req.body.url), res);
    });
    this.router.get("/:guildId/next/:url", (req: any, res: any, next: any) => {
      this.handleResponse(this.bot.getGuildMusicManagerByIdIfExists(req.params.guildId)
        .playNext(req.params.url), res);
    });
    this.router.post("/post/:guildId/next", (req: any, res: any, next: any) => {
      this.handleResponse(this.bot.getGuildMusicManagerByIdIfExists(req.params.guildId)
        .playNext(req.body.url), res);
    });
    this.router.get("/:guildId/now/:url", (req: any, res: any, next: any) => {
      this.handleResponse(this.bot.getGuildMusicManagerByIdIfExists(req.params.guildId)
        .playNow(req.params.url), res);
    });
    this.router.post("/post/:guildId/now", (req: any, res: any, next: any) => {
      this.handleResponse(this.bot.getGuildMusicManagerByIdIfExists(req.params.guildId)
        .playNow(req.body.url), res);
    });
    this.router.get("/:guildId/radio/:url", (req: any, res: any, next: any) => {
      this.handleResponse(this.bot.getGuildMusicManagerByIdIfExists(req.params.guildId)
        .radio(req.params.url), res);
    });
    this.router.post("/post/:guildId/radio", (req: any, res: any, next: any) => {
      this.handleResponse(this.bot.getGuildMusicManagerByIdIfExists(req.params.guildId)
        .radio(req.body.url), res);
    });
    this.router.post("/:guildId/queue", (req: any, res: any, next: any) => {
      this.handleResponse(() => this.bot.getGuildMusicManagerByIdIfExists(req.params.guildId)
        .queueList(req.body.tracks), res);
    });
    this.router.post("/:guildId/next", (req: any, res: any, next: any) => {
      this.handleResponse(() => this.bot.getGuildMusicManagerByIdIfExists(req.params.guildId)
        .playListNext(req.body.tracks), res);
    });
    this.router.post("/:guildId/now", (req: any, res: any, next: any) => {
      this.handleResponse(this.bot.getGuildMusicManagerByIdIfExists(req.params.guildId)
        .playListNow(req.body.tracks), res);
    });
    this.router.post("/:guildId/radio", (req: any, res: any, next: any) => {
      this.handleResponse(this.bot.getGuildMusicManagerByIdIfExists(req.params.guildId)
        .radio(req.body.tracks), res);
    });
    this.router.get("/:guildId/skip", (req: any, res: any, next: any) => {
      this.handleResponse(this.bot.getGuildMusicManagerByIdIfExists(req.params.guildId).skip(), res);
    });
    this.router.get("/:guildId/skipBack", (req: any, res: any, next: any) => {
      this.handleResponse(() => this.bot.getGuildMusicManagerByIdIfExists(req.params.guildId).skipBack(), res);
    });
    this.router.get("/:guildId/seek/:seconds", (req: any, res: any, next: any) => {
      this.handleResponse(() => this.bot.getGuildMusicManagerByIdIfExists(req.params.guildId).seek(parseInt(req.params.seconds, 10)), res);
    });
    this.router.get("/:guildId/volume/:volume", (req: any, res: any, next: any) => {
      this.handleResponse(() => this.bot.getGuildMusicManagerByIdIfExists(req.params.guildId).setVolume(parseInt(req.params.volume, 10)), res);
    });
    this.router.get("/:guildId/restart", (req: any, res: any, next: any) => {
      this.handleResponse(() => this.bot.getGuildMusicManagerByIdIfExists(req.params.guildId).restart(), res);
    });
    this.router.get("/:guildId/togglePause", (req: any, res: any, next: any) => {
      this.handleResponse(() => this.bot.getGuildMusicManagerByIdIfExists(req.params.guildId).togglePause(), res);
    });
    this.router.get("/:guildId/remove/:id", (req: any, res: any, next: any) => {
      this.handleResponse(this.bot.getGuildMusicManagerByIdIfExists(req.params.guildId)
        .removeTrackById(parseInt(req.params.id, 10)), res);
    });
    this.router.get("/search/:query", (req: any, res: any, next: any) => {
      YoutubeService.getInstance().search(req.params.query).then(result => res.send(result))
        .catch(err => this.error(err, res));
    });
    this.router.post("/post/search", (req: any, res: any, next: any) => {
      YoutubeService.getInstance().search(req.body.query).then(result => res.send(result))
        .catch(err => this.error(err, res));
    });
    this.router.get("/playlist/:url/items", (req: any, res: any, next: any) => {
      YoutubeService.getInstance().getPlaylistTracks(req.params.url).then(result => res.send(result))
        .catch(err => this.error(err, res));
    });
    this.router.post("/post/playlist/items", (req: any, res: any, next: any) => {
      YoutubeService.getInstance().getPlaylistTracks(req.body.url).then(result => res.send(result))
        .catch(err => this.error(err, res));
    });
    this.router.get("/guilds/get", (req: any, res: any, next: any) => {
      res.send(this.bot.getGuilds());
    });
    this.router.get("/:guildId/channels", (req: any, res: any, next: any) => {
      res.send(this.bot.getGuildMusicManagerByIdIfExists(req.params.guildId).getVoiceChannels());
    });
    this.router.get("/:guildId/join/:id", (req: any, res: any, next: any) => {
      this.handleResponse(() => this.bot.getGuildMusicManagerByIdIfExists(req.params.guildId)
        .joinByChannelId(req.params.id), res);
    });
    this.router.get("/:guildId/leave", (req: any, res: any, next: any) => {
      this.handleResponse(() => this.bot.getGuildMusicManagerByIdIfExists(req.params.guildId).leave(), res);
    });
    this.router.get("/:guildId/toggleRepeat", (req: any, res: any, next: any) => {
      this.handleResponse(() => this.bot.getGuildMusicManagerByIdIfExists(req.params.guildId)
        .toggleRepeat(), res);
    });
    this.router.get("/:guildId/toggleRadio", (req: any, res: any, next: any) => {
      this.handleResponse(() => this.bot.getGuildMusicManagerByIdIfExists(req.params.guildId)
        .toggleRadio(), res);
    });
    this.router.post("/:guildId/add/:queue/:index", (req: any, res: any, next: any) => {
      this.handleResponse(() => this.bot.getGuildMusicManagerByIdIfExists(req.params.guildId)
        .add(req.params.queue, req.body.value, parseInt(req.params.index, 10)), res);
    });
    this.router.get("/:guildId/add/:queue/:index/:url", (req: any, res: any, next: any) => {
      this.handleResponse(this.bot.getGuildMusicManagerByIdIfExists(req.params.guildId)
        .addByUrl(req.params.queue, req.params.url, parseInt(req.params.index, 10)), res);
    });
    this.router.post("/post/:guildId/add/:queue/:index", (req: any, res: any, next: any) => {
      this.handleResponse(this.bot.getGuildMusicManagerByIdIfExists(req.params.guildId)
        .addByUrl(req.params.queue, req.body.url, parseInt(req.params.index, 10)), res);
    });
    this.router.get("/:guildId/move/:queue/:id/:index", (req: any, res: any, next: any) => {
      this.handleResponse(() => this.bot.getGuildMusicManagerByIdIfExists(req.params.guildId)
        .move(req.params.queue, parseInt(req.params.id, 10), parseInt(req.params.index, 10)), res);
    });
    this.router.get("/:guildId/clear", (req: any, res: any, next: any) => {
      this.handleResponse(() => this.bot.getGuildMusicManagerByIdIfExists(req.params.guildId)
        .clearPlaylist(), res);
    });
    return this.router;
  }

  private handleResponse(promise: (() => void) | Promise<any>, res: Response) {
    if (promise instanceof Promise) {
      promise.then(() => this.ok(res)).catch(err => this.error(err, res));
    } else {
      try {
        promise();
        this.ok(res);
      } catch
        (e) {
        this.error(e, res);
      }
    }
  }

  private ok(res: Response) {
    res.status(200).send({status: 200, message: "OK"});
  }

  private error(err: any, res: Response) {
    console.error(err);
    res.status(500).send({status: 500, message: err.message});
  }
}
