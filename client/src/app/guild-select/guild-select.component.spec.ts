import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GuildSelectComponent } from './guild-select.component';

describe('GuildSelectComponent', () => {
  let component: GuildSelectComponent;
  let fixture: ComponentFixture<GuildSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GuildSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GuildSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
