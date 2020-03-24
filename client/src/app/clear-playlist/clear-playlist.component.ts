import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-clear-playlist',
  templateUrl: './clear-playlist.component.html',
  styleUrls: ['./clear-playlist.component.scss']
})
export class ClearPlaylistComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<ClearPlaylistComponent>) { }

  ngOnInit(): void {
  }

}
