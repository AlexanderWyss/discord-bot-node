import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
// @ts-ignore
import Youtube, {YouTube, util, Video} from 'simple-youtube-api';
import {TrackInfo} from './models';

export interface YoutubeKey {
  key: string;
}

export function getUrl() {
  if (window.location.hostname === 'localhost') {
    return 'localhost:3000';
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
  private youtube: YouTube;

  constructor(private http: HttpClient) {
    this.getToken().subscribe(response => this.youtube = new Youtube(response.key));
  }

  private getToken(): Observable<YoutubeKey> {
    return this.http.get(this.baseUrl + '/youtube/key') as Observable<YoutubeKey>;
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

  search(query: string): Promise<TrackInfo[]> {
    return this.youtube.searchVideos(query, 20).then(result => result.map(this.map));
  }
  private map(video: Video): TrackInfo {
    return {
      url: video.url,
      title: video.title,
      artist: video.channel.title,
      thumbnailUrl: (video.thumbnails as any).high.url
    };
  }
}
