import { Component, OnInit } from '@angular/core';
import {GuildInfo} from '../models';
import {MusicService} from '../music.service';

@Component({
  selector: 'app-guild-select',
  templateUrl: './guild-select.component.html',
  styleUrls: ['./guild-select.component.scss']
})
export class GuildSelectComponent implements OnInit {
  guilds: GuildInfo[] = [];

  constructor(private musicService: MusicService) {
  }

  ngOnInit(): void {
    this.musicService.getGuilds().subscribe(guilds => this.guilds = guilds);
  }
}
