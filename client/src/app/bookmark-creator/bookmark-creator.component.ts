import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

export interface DialogData {
  guildId: string;
}

@Component({
  selector: 'app-bookmark-creator',
  templateUrl: './bookmark-creator.component.html',
  styleUrls: ['./bookmark-creator.component.scss']
})
export class BookmarkCreatorComponent implements OnInit {
  action = 'queue';
  code: string;

  constructor(
    public dialogRef: MatDialogRef<BookmarkCreatorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
  }

  ngOnInit(): void {
    this.createCode();
  }

  createCode() {
    this.code = 'javascript:(function() {const http = new XMLHttpRequest();http.open("GET", "https://discord.wyss.tech/'
      + this.data.guildId + '/' + this.action + '/" + encodeURIComponent(window.location.toString()));http.send();})();';
  }
}
