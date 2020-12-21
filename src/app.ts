import express from "express";
import path from "path";
import {Bot} from "./Bot";
import {WebRouter} from "./WebRouter";

const app = express();
if (process.env.NODE_ENV !== "production") {
  // tslint:disable-next-line:no-var-requires
  require("dotenv").config();
  // tslint:disable-next-line:no-var-requires
  app.use(require("cors")());
}
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use("/", new WebRouter().setup());
app.use(express.static(path.join(__dirname, "/public/")));
app.use(express.static(path.join(__dirname, "/client/")));
app.use((req: any, res: any) => {
  res.sendFile(path.join(__dirname + "/client/index.html"));
});

Bot.start();

module.exports = app;
