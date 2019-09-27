import express from "express";
import fs from "fs";
import path from "path";
import {Bot} from "./Bot";

const indexRouter = require("./index");

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: false})); app.use("/", indexRouter);
app.use(express.static(path.join(__dirname, "/public/")));
app.use(express.static(path.join(__dirname, "/client/")));
app.use((req: any, res: any) => {
  res.sendFile(path.join(__dirname + "/client/index.html"));
});

const bot = new Bot();
const token = fs.readFileSync(path.join(__dirname, "../token.txt"), "utf8").toString().trim();
const owner = fs.readFileSync(path.join(__dirname, "../owner.txt"), "utf8").toString().trim();
bot.start(token, owner);

module.exports = app;
