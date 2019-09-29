import {Message, MessageReaction} from "discord.js";
import {GuildMusicManager} from "./GuildMusicManager";

export class ReactionManager {
  private static SKIP_BACK = "⏮";
  private static SKIP_START = "⏪";
  private static PAUSE_RESUME = "⏯";
  private static SKIP = "⏭";
  private static VOLUME_DOWN = "🔉";
  private static VOLUME_UP = "🔊";

  public constructor(private musicManager: GuildMusicManager) {
  }

  public addReactions(message: Message) {
    message.react(ReactionManager.SKIP_BACK)
      .then(() => message.react(ReactionManager.SKIP_START))
      .then(() => message.react(ReactionManager.PAUSE_RESUME))
      .then(() => message.react(ReactionManager.SKIP))
      .then(() => message.react(ReactionManager.VOLUME_DOWN))
      .then(() => message.react(ReactionManager.VOLUME_UP));
  }

  public apply(reaction: MessageReaction) {
    try {
      reaction.users.forEach(user => {
        if (user.id !== reaction.message.client.user.id) {
          reaction.remove(user).catch(e => console.log(e));
        }
      });
      switch (reaction.emoji.name) {
        case ReactionManager.SKIP_BACK:
          this.musicManager.skipBack();
          break;
        case ReactionManager.SKIP_START:
          this.musicManager.restart();
          break;
        case ReactionManager.PAUSE_RESUME:
          this.musicManager.togglePause();
          break;
        case ReactionManager.SKIP:
          this.musicManager.skip();
          break;
        case ReactionManager.VOLUME_DOWN:
          this.musicManager.decreseVolume();
          break;
        case ReactionManager.VOLUME_UP:
          this.musicManager.increseVolume();
          break;
      }
    } catch (e) {
      console.log(e);
    }
  }
}
