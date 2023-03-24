import { Component } from '@angular/core';
import {MatLegacyDialogRef as MatDialogRef} from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-clear-playlist',
  templateUrl: './clear-playlist.component.html',
  styleUrls: ['./clear-playlist.component.scss']
})
export class ClearPlaylistComponent {

  constructor(public dialogRef: MatDialogRef<ClearPlaylistComponent>) { }

}
