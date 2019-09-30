import express, {NextFunction, Response, Router} from "express";

export class WebRouter {

  private readonly router: Router;

  constructor() {
    this.router = express.Router();
  }

  public setup(): Router {
    // this.router.get("", (req: any, res: any, next: any) => {    });
    return this.router;
  }
}
