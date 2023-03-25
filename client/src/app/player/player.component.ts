import {Component, OnInit} from '@angular/core';
import {MusicService} from '../music.service';
import {GuildInfo, PlaylistInfo, ShelfInfo, TrackInfo} from '../models';
import {MatDialog} from '@angular/material/dialog';
import {BookmarkCreatorComponent} from '../bookmark-creator/bookmark-creator.component';
import {JoinChannelComponent} from '../join-channel/join-channel.component';
import {CookieService} from "ngx-cookie-service";

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {
  private readonly lightModeCookie = "light_mode";
  searchResult: (TrackInfo | ShelfInfo | PlaylistInfo)[] = [];
  guild: GuildInfo;
  isLightMode: boolean = true;

  constructor(private musicService: MusicService,
              private dialog: MatDialog,
              private cookieService: CookieService) {
  }


  ngOnInit() {
    if (this.cookieService.check(this.lightModeCookie)) {
      this.isLightMode = this.cookieService.get(this.lightModeCookie) === "true";
    }
    this.toggleLightMode();
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
    if (this.isLightMode) {
      document.getElementById("body").classList.add("lightTheme");
    } else {
      document.getElementById("body").classList.remove("lightTheme");
    }
    this.cookieService.set(this.lightModeCookie, String(this.isLightMode));
  }
}
