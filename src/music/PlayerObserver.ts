export interface PlayerObserver {
  onStart(): void;

  onEnd(): void;

  onTogglePause(value: boolean): void;

  onSeek(): void;

  onVolumeChange(): void;

  onError(err: Error): void;
}
