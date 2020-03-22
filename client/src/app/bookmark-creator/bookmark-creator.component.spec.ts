import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BookmarkCreatorComponent } from './bookmark-creator.component';

describe('BookmarkCreatorComponent', () => {
  let component: BookmarkCreatorComponent;
  let fixture: ComponentFixture<BookmarkCreatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BookmarkCreatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BookmarkCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
