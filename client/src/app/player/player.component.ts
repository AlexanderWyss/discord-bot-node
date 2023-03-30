import {Component, OnInit} from '@angular/core';
import {MusicService} from '../music.service';
import {GuildInfo, PlaylistInfo, ShelfInfo, TrackInfo} from '../models';
import {MatDialog} from '@angular/material/dialog';
import {BookmarkCreatorComponent} from '../bookmark-creator/bookmark-creator.component';
import {JoinChannelComponent} from '../join-channel/join-channel.component';
import {LightDarkModeService} from "../light-dark-mode.service";

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {
  searchResult: (TrackInfo | ShelfInfo | PlaylistInfo)[] = [];
  guild: GuildInfo;
  isLightMode: boolean;

  constructor(private musicService: MusicService,
              private dialog: MatDialog,
              private lightDarkModeService: LightDarkModeService) {
  }


  ngOnInit() {
    this.isLightMode = this.lightDarkModeService.get();
    this.musicService.onGuild().subscribe(guild => this.guild = guild);
  }

  bookmarkTools() {
    this.dialog.open(BookmarkCreatorComponent, {
      data: {
        guildId: this.guild.id
      }
    });
  }

  channels() {
    this.dialog.open(JoinChannelComponent);
  }

  leave() {
    this.musicService.leave();
  }

  isMobile(): boolean {
    return window.screen.width <= 700;
  }

  toggleLightMode() {
    this.lightDarkModeService.set(this.isLightMode);
  }
}
