import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClearPlaylistComponent } from './clear-playlist.component';

describe('ClearPlaylistComponent', () => {
  let component: ClearPlaylistComponent;
  let fixture: ComponentFixture<ClearPlaylistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClearPlaylistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClearPlaylistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
