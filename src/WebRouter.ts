import express, {NextFunction, Response, Router} from "express";
import * as path from "path";

export class WebRouter {

  private readonly router: Router;

  constructor() {
    this.router = express.Router();
  }

  public setup(): Router {
    // this.router.get("/player/453485032204402688", (req: any, res: any, next: any) => {   res.sendFile(path.join(__dirname + "/client/index.html")); });
    return this.router;
  }
}
