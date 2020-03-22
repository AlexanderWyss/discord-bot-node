import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Channel} from '../models';
import {MusicService} from '../music.service';

export interface DialogData {
  guildId: string;
}

@Component({
  selector: 'app-join-channel',
  templateUrl: './join-channel.component.html',
  styleUrls: ['./join-channel.component.scss']
})
export class JoinChannelComponent implements OnInit {
  channels: Channel[];

  constructor(
    public dialogRef: MatDialogRef<JoinChannelComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData, private musicService: MusicService) {
  }

  ngOnInit(): void {
    this.musicService.getChannels(this.data.guildId).subscribe(channels => this.channels = channels);
  }

  join(id: string) {
    this.musicService.join(this.data.guildId, id);
    this.dialogRef.close();
  }
}
