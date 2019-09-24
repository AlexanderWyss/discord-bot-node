import {Client} from "discord.js";

export class Bot {

  private client: Client;

  public start(token: string) {
    this.client = new Client();
    this.client.once("ready", () => {
      console.log("Ready!");
    });

    this.client.on("message", message => {
      console.log(message.content);
      if (message.content === "!ping") {
        message.channel.send("Pong.");
      }
    });

    this.client.login(token);
  }
}
