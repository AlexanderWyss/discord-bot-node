import {EventEmitter, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Channel, GuildInfo, JoinGuild, QueueInfo, TrackInfo} from './models';
import {Observable} from 'rxjs';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {Socket} from 'ngx-socket-io';
import {Title} from '@angular/platform-browser';

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
              private socket: Socket, private titleService: Title) {
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
    this.http.get(this.baseUrl + '/' + this.guildId + '/queue/' + encodeURIComponent(url)).subscribe();
  }

  next(url: string) {
    this.http.get(this.baseUrl + '/' + this.guildId + '/next/' + encodeURIComponent(url)).subscribe();
  }

  now(url: string) {
    this.http.get(this.baseUrl + '/' + this.guildId + '/now/' + encodeURIComponent(url)).subscribe();
  }

  skip() {
    this.http.get(this.baseUrl + '/' + this.guildId + '/skip').subscribe();
  }

  skipBack() {
    this.http.get(this.baseUrl + '/' + this.guildId + '/skipBack').subscribe();
  }

  volumeUp() {
    this.http.get(this.baseUrl + '/' + this.guildId + '/volumeUp').subscribe();
  }

  volumeDown() {
    this.http.get(this.baseUrl + '/' + this.guildId + '/volumeDown').subscribe();
  }

  togglePause() {
    this.http.get(this.baseUrl + '/' + this.guildId + '/togglePause').subscribe();
  }

  remove(id: number) {
    this.http.get(this.baseUrl + '/' + this.guildId + '/remove/' + id).subscribe();
  }

  search(query: string): Observable<TrackInfo[]> {
    return this.http.get(this.baseUrl + '/search/' + encodeURIComponent(query)) as Observable<TrackInfo[]>;
  }

  getChannels(): Observable<Channel[]> {
    return this.http.get(this.baseUrl + '/' + this.guildId + '/channels') as Observable<Channel[]>;
  }

  join(id: string) {
    this.http.get(this.baseUrl + '/' + this.guildId + '/join/' + id).subscribe();
  }

  leave() {
    this.http.get(this.baseUrl + '/' + this.guildId + '/leave/').subscribe();
  }

  getGuilds(): Observable<GuildInfo[]> {
    return this.http.get(this.baseUrl + '/guilds') as Observable<GuildInfo[]>;
  }
}
