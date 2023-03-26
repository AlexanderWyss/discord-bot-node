import {TrackSchedulerObserver} from "./TrackSchedulerObserver";
import {Panel} from "./Panel";
import {TrackScheduler} from "./TrackScheduler";
import {MessageCreateOptions, MessageEditOptions} from "discord.js";

export abstract class TrackSchedulerObserverPanel extends Panel implements TrackSchedulerObserver {
  protected constructor(protected readonly trackScheduler: TrackScheduler) {
    super();
  }

  protected startInternal(): void {
    this.trackScheduler.register(this);
  }

  public onChange(trackScheduler: TrackScheduler): void {
    this.update();
  }

  protected buildMessage() {
    return this.buildTrackMessage(this.trackScheduler);
  }

  protected abstract buildTrackMessage(trackScheduler: TrackScheduler): MessageCreateOptions & MessageEditOptions;

  protected destroyInternal(): void {
    this.trackScheduler.deregister(this);
  }
}
