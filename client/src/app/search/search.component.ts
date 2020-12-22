import {Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {PlaylistInfo, ShelfInfo, TrackInfo} from '../models';
import {MusicService} from '../music.service';
import {TrackInfoEvent} from '../track-info/track-info.component';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {

  @ViewChild('searchElement') searchElement: ElementRef;
  url = '';
  searchResult: Array<TrackInfo | ShelfInfo | PlaylistInfo> = [];
  @Output() searchResultChange = new EventEmitter<Array<TrackInfo | ShelfInfo | PlaylistInfo>>();
  loading: boolean;
  isBrowsing: boolean;
  cache: Array<TrackInfo | ShelfInfo | PlaylistInfo> = [];

  constructor(private musicService: MusicService) {
  }


  ngOnInit() {
    window.addEventListener('keydown', (event) => this.searchEvent(event));
  }

  private searchEvent(event: KeyboardEvent) {
    if (event.key === 'f' && event.ctrlKey) {
      this.searchElement.nativeElement.focus();
      event.preventDefault();
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('keydown', event => this.searchEvent(event));
  }

  now(url?: string) {
    this.musicService.now(url ? url : this.url);
    this.clearUrlIfNull(url);
  }

  next(url?: string) {
    this.musicService.next(url ? url : this.url);
    this.clearUrlIfNull(url);
  }

  queue(url?: string) {
    this.musicService.queue(url ? url : this.url);
    this.clearUrlIfNull(url);
  }

  clearUrlIfNull(url: string) {
    if (!url) {
      this.url = '';
    }
  }

  search() {
    if (!this.url || this.url.trim() === '') {
      this.setSearchResult([]);
      return;
    }
    this.loading = true;
    this.isBrowsing = false;
    this.musicService.search(this.url).subscribe(result => {
      this.setSearchResult(result);
      this.loading = false;
    }, error => {
      console.error(error);
      this.loading = false;
    });
  }

  enter() {
    if (this.url.toLowerCase().startsWith('http://') || this.url.toLowerCase().startsWith('https://')) {
      this.queue();
    } else {
      this.search();
    }
  }

  trackInfoEvent(event: TrackInfoEvent) {
    switch (event.type) {
      case 'NOW':
        this.musicService.now(event.params);
        break;
      case 'NEXT':
        this.musicService.next(event.params);
        break;
      case 'QUEUE':
        this.musicService.queue(event.params);
        break;
      case 'RADIO':
        this.musicService.radio(event.params);
        break;
      case 'BROWSE':
        if (event.params.type === 'shelf') {
          this.browse(event.params.items);
        } else if (event.params.type === 'playlist') {
          this.loading = true;
          this.musicService.getPlaylistTracks(event.params.url).subscribe(res => {
            this.browse(res);
            this.loading = false;
          }, err => {
            console.error(err);
            this.loading = false;
          });
        }
        break;
    }
  }

  private browse(tracks: TrackInfo[]) {
    this.isBrowsing = true;
    this.cache = this.searchResult;
    this.setSearchResult(tracks);
  }

  back() {
    this.isBrowsing = false;
    this.setSearchResult(this.cache);
    this.cache = [];
  }

  selectInput(event: MouseEvent) {
    (event.target as any).select();
  }

  setSearchResult(result: Array<TrackInfo | ShelfInfo | PlaylistInfo>): void {
    this.searchResult = result;
    this.searchResultChange.emit(result);
  }
}
