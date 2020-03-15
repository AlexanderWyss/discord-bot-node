import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {SocketIoConfig, SocketIoModule} from 'ngx-socket-io';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {PlayerComponent} from './player/player.component';
import {FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';

function getUrl() {
  if (window.location.hostname === 'localhost') {
    return 'localhost:3000';
  }
  return window.location.hostname + ':' + window.location.port;
}

const config: SocketIoConfig = {url: getUrl(), options: {}};

@NgModule({
  declarations: [
    AppComponent,
    PlayerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SocketIoModule.forRoot(config),
    FormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
