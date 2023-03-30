import {Component, OnInit} from '@angular/core';
import {LightDarkModeService} from "./light-dark-mode.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{

  constructor(private lightDarkModeService: LightDarkModeService) {
  }

  ngOnInit(): void {
    this.lightDarkModeService.apply();
  }
}
