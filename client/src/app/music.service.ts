import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {TrackInfo} from './models';
import {Observable} from 'rxjs';

export function getUrl() {
  if (window.location.hostname === 'localhost') {
    return 'discord.wyss.tech';
  }
  return window.location.hostname + ':' + window.location.port;
}

export function getProtocol() {
  if (window.location.hostname === 'localhost') {
    return 'http://';
  }
  return 'https://';
}

@Injectable({
  providedIn: 'root'
})
export class MusicService {
  private readonly baseUrl = getProtocol() + getUrl();

  constructor(private http: HttpClient) {
  }

  queue(guildId: string, url: string) {
    this.http.get(this.baseUrl + '/' + guildId + '/queue/' + encodeURIComponent(url)).subscribe();
  }

  next(guildId: string, url: string) {
    this.http.get(this.baseUrl + '/' + guildId + '/next/' + encodeURIComponent(url)).subscribe();
  }

  now(guildId: string, url: string) {
    this.http.get(this.baseUrl + '/' + guildId + '/now/' + encodeURIComponent(url)).subscribe();
  }

  skip(guildId: string) {
    this.http.get(this.baseUrl + '/' + guildId + '/skip').subscribe();
  }

  skipBack(guildId: string) {
    this.http.get(this.baseUrl + '/' + guildId + '/skipBack').subscribe();
  }

  volumeUp(guildId: string) {
    this.http.get(this.baseUrl + '/' + guildId + '/volumeUp').subscribe();
  }

  volumeDown(guildId: string) {
    this.http.get(this.baseUrl + '/' + guildId + '/volumeDown').subscribe();
  }

  togglePause(guildId: string) {
    this.http.get(this.baseUrl + '/' + guildId + '/togglePause').subscribe();
  }

  remove(guildId: string, id: number) {
    this.http.get(this.baseUrl + '/' + guildId + '/remove/' + id).subscribe();
  }

  search(query: string): Observable<TrackInfo[]> {
    return this.http.get(this.baseUrl + '/search/' + encodeURIComponent(query)) as Observable<TrackInfo[]>;
  }
}
