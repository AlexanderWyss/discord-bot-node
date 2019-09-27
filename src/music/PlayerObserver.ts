export interface PlayerObserver {
   onDebug(information: string): void;
   onEnd(reason: string): void;
   onError(err: Error): void;
   onSpeaking(value: boolean): void;
   onStart(): void;
   onVolumeChange(oldVolume: number, newVolume: number): void;
}
