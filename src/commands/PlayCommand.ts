import {Message} from "discord.js";
import {Command, CommandMessage, CommandoClient} from "discord.js-commando";
import ytdl from "ytdl-core";

export class PlayCommand extends Command {

  public constructor(client: CommandoClient) {
    super(client, {
      name: "play",
      group: "music",
      memberName: "play",
      description: "Play a song",
      examples: ["play https://www.youtube.com/watch?v=dQw4w9WgXcQ"],
      args: [
        {
          key: "url",
          prompt: "What song do you want to play?",
          type: "string"
        }
      ]
    });
  }

  public run(message: CommandMessage, args: any, fromPattern: boolean): Promise<Message | Message[]> {
    console.log(args);
    message.member.voiceChannel.join().then(connection => {
      const stream = ytdl(args.url, {filter: "audioonly", quality: "highestaudio"});
      const streamDispatcher = connection.playStream(stream);
      streamDispatcher.on("end", reason => {message.member.voiceChannel.leave(); });
      ytdl.getInfo(args.url).then(info => console.log(info));
    });

    return undefined;
  }
}
