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
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import { BookmarkCreatorComponent } from './bookmark-creator/bookmark-creator.component';
import {MatDialogModule} from '@angular/material/dialog';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {ClipboardModule} from '@angular/cdk/clipboard';
import { JoinChannelComponent } from './join-channel/join-channel.component';
import {MatListModule} from '@angular/material/list';
import { GuildSelectComponent } from './guild-select/guild-select.component';

const config: SocketIoConfig = {url: getUrl(), options: {}};

@NgModule({
  declarations: [
    AppComponent,
    PlayerComponent,
    TrackInfoComponent,
    MinuteSecondsPipe,
    BookmarkCreatorComponent,
    JoinChannelComponent,
    GuildSelectComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SocketIoModule.forRoot(config),
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatButtonToggleModule,
    ClipboardModule,
    MatListModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
