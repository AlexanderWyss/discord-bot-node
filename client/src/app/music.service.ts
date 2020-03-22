import {EventEmitter, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Channel, GuildInfo, JoinGuild, QueueInfo, TrackInfo} from './models';
import {Observable, of} from 'rxjs';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {Socket} from 'ngx-socket-io';
import {Title} from '@angular/platform-browser';
import {MatSnackBar} from '@angular/material/snack-bar';
import {catchError} from 'rxjs/operators';

export function getUrl() {
  if (window.location.hostname === 'localhost') {
    return 'localhost:3000';
  }
  return window.location.hostname + ':' + window.location.port;
}

export function getProtocol() {
  return window.location.protocol + '//';
}

@Injectable({
  providedIn: 'root'
})
export class MusicService {
  private readonly baseUrl = getProtocol() + getUrl();
  private guildId: string;
  private tracksEmitter = new EventEmitter<QueueInfo>();
  private guildEmitter = new EventEmitter<GuildInfo>();

  constructor(private http: HttpClient, private router: Router, private activatedRoute: ActivatedRoute,
              private socket: Socket, private titleService: Title, private snackBar: MatSnackBar) {
    this.socket.on('connect', () => {
      this.socket.fromEvent('tracks').subscribe((queueInfo: QueueInfo) => {
        this.tracksEmitter.emit(queueInfo);
      });
      this.socket.fromEvent('guild').subscribe((guild: GuildInfo) => {
        this.guildEmitter.emit(guild);
        this.guildId = guild.id;
        this.titleService.setTitle(guild.name);
      });
      this.router.events.subscribe(route => {
        if (route instanceof NavigationEnd) {
          this.handleRoute();
        }
      });
      this.handleRoute();
    });
  }

  private handleRoute() {
    let currentRoute = this.activatedRoute;
    while (currentRoute.firstChild) {
      currentRoute = currentRoute.firstChild;
    }
    currentRoute.paramMap.subscribe(params => {
      if (params.has('guildId')) {
        const guildId = params.get('guildId');
        const userId = params.get('userId');
        this.socket.emit('joinGuild', {guildId, oldGuildId: this.guildId, userId} as JoinGuild);
        this.guildId = guildId;
      } else {
        this.titleService.setTitle('FuckingAwesomeBot');
      }
    });
  }

  onTracks() {
    return this.tracksEmitter;
  }

  onGuild() {
    return this.guildEmitter;
  }

  queue(url: string) {
    this.http.get(this.baseUrl + '/' + this.guildId + '/queue/' + encodeURIComponent(url)).pipe(this.handleError()).subscribe();
  }

  next(url: string) {
    this.http.get(this.baseUrl + '/' + this.guildId + '/next/' + encodeURIComponent(url)).pipe(this.handleError()).subscribe();
  }

  now(url: string) {
    this.http.get(this.baseUrl + '/' + this.guildId + '/now/' + encodeURIComponent(url)).pipe(this.handleError()).subscribe();
  }


  skip() {
    this.http.get(this.baseUrl + '/' + this.guildId + '/skip').pipe(this.handleError()).subscribe();
  }

  skipBack() {
    this.http.get(this.baseUrl + '/' + this.guildId + '/skipBack').pipe(this.handleError()).subscribe();
  }

  togglePause() {
    this.http.get(this.baseUrl + '/' + this.guildId + '/togglePause').pipe(this.handleError()).subscribe();
  }

  remove(id: number) {
    this.http.get(this.baseUrl + '/' + this.guildId + '/remove/' + id).pipe(this.handleError()).subscribe();
  }

  search(query: string): Observable<TrackInfo[]> {
    return this.http.get(this.baseUrl + '/search/' + encodeURIComponent(query)).pipe(this.handleError()) as Observable<TrackInfo[]>;
  }

  getChannels(): Observable<Channel[]> {
    return this.http.get(this.baseUrl + '/' + this.guildId + '/channels').pipe(this.handleError()) as Observable<Channel[]>;
  }

  join(id: string) {
    this.http.get(this.baseUrl + '/' + this.guildId + '/join/' + id).pipe(this.handleError()).subscribe();
  }

  leave() {
    this.http.get(this.baseUrl + '/' + this.guildId + '/leave/').pipe(this.handleError()).subscribe();
  }

  getGuilds(): Observable<GuildInfo[]> {
    return this.http.get(this.baseUrl + '/guilds').pipe(this.handleError()) as Observable<GuildInfo[]>;
  }

  private handleError() {
    return catchError(err => {
        let message: string;
        if (err.error && err.error.message) {
          message = err.error.message;
        } else {
          message = err.message;
        }
        console.log(message);
        this.snackBar.open(message, null, {
          duration: 3000,
          panelClass: 'error'
        });
        throw err;
      }
    );
  }
}
