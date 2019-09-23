import express = require("express");
import path = require("path");

const indexRouter = require("./index");

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: false})); app.use("/", indexRouter);
app.use(express.static(path.join(__dirname, "/public/")));
app.use(express.static(path.join(__dirname, "/client/")));
app.use((req: any, res: any) => {
  res.sendFile(path.join(__dirname + "/client/index.html"));
});

module.exports = app;
