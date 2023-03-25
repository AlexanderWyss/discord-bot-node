import {Component, OnInit} from '@angular/core';
import {GuildInfo} from '../models';
import {MusicService} from '../music.service';
import {CookieService} from "ngx-cookie-service";

@Component({
  selector: 'app-guild-select',
  templateUrl: './guild-select.component.html',
  styleUrls: ['./guild-select.component.scss']
})
export class GuildSelectComponent implements OnInit {
  private readonly lightModeCookie = "light_mode";
  guilds: GuildInfo[] = [];

  constructor(private musicService: MusicService, private cookieService: CookieService) {
  }

  ngOnInit(): void {
    if (this.cookieService.check(this.lightModeCookie) && this.cookieService.get(this.lightModeCookie) !== "true") {
      document.getElementById("body").classList.remove("lightTheme");
    } else {
      document.getElementById("body").classList.add("lightTheme");
    }
    this.musicService.getGuilds().subscribe(guilds => this.guilds = guilds);
  }
}
