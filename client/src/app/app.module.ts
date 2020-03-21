import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {SocketIoConfig, SocketIoModule} from 'ngx-socket-io';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {PlayerComponent} from './player/player.component';
import {FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {getUrl} from './music.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TrackInfoComponent } from './track-info/track-info.component';
import { MinuteSecondsPipe } from './minute-seconds.pipe';
import {MatButtonModule} from '@angular/material/button';
import {HighContrastMode, HighContrastModeDetector} from "@angular/cdk/a11y";

const config: SocketIoConfig = {url: getUrl(), options: {}};

@NgModule({
  declarations: [
    AppComponent,
    PlayerComponent,
    TrackInfoComponent,
    MinuteSecondsPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SocketIoModule.forRoot(config),
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatButtonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
