import {Component, OnInit} from '@angular/core';
import {MusicService} from '../music.service';
import {GuildInfo, PlaylistInfo, ShelfInfo, TrackInfo} from '../models';
import {MatDialog} from '@angular/material/dialog';
import {BookmarkCreatorComponent} from '../bookmark-creator/bookmark-creator.component';
import {JoinChannelComponent} from '../join-channel/join-channel.component';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {
  searchResult: Array<TrackInfo | ShelfInfo | PlaylistInfo> = [];
  guild: GuildInfo;

  constructor(private musicService: MusicService,
              private dialog: MatDialog) {
  }


  ngOnInit() {
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
}
