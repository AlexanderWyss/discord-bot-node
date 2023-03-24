import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {SocketIoConfig, SocketIoModule} from 'ngx-socket-io';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {PlayerComponent} from './player/player.component';
import {FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {getUrl} from './music.service';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {TrackInfoComponent} from './track-info/track-info.component';
import {MinuteSecondsPipe} from './minute-seconds.pipe';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatLegacyProgressSpinnerModule as MatProgressSpinnerModule} from '@angular/material/legacy-progress-spinner';
import {MatLegacyFormFieldModule as MatFormFieldModule} from '@angular/material/legacy-form-field';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';
import {MatIconModule} from '@angular/material/icon';
import {MatLegacyCardModule as MatCardModule} from '@angular/material/legacy-card';
import {BookmarkCreatorComponent} from './bookmark-creator/bookmark-creator.component';
import {MatLegacyDialogModule as MatDialogModule} from '@angular/material/legacy-dialog';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {ClipboardModule} from '@angular/cdk/clipboard';
import {JoinChannelComponent} from './join-channel/join-channel.component';
import {MatLegacyListModule as MatListModule} from '@angular/material/legacy-list';
import {GuildSelectComponent} from './guild-select/guild-select.component';
import {MatLegacySnackBarModule as MatSnackBarModule} from '@angular/material/legacy-snack-bar';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {ClearPlaylistComponent} from './clear-playlist/clear-playlist.component';
import {SearchComponent} from './search/search.component';
import {MatLegacyTabsModule as MatTabsModule} from '@angular/material/legacy-tabs';
import {QueueComponent} from './queue/queue.component';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatLegacySliderModule as MatSliderModule} from '@angular/material/legacy-slider';
import {PortalModule} from '@angular/cdk/portal';
import {OverlayModule} from '@angular/cdk/overlay';
import {MatRippleModule} from '@angular/material/core';

const config: SocketIoConfig = {url: getUrl(), options: {}};

@NgModule({
  declarations: [
    AppComponent,
    PlayerComponent,
    TrackInfoComponent,
    MinuteSecondsPipe,
    BookmarkCreatorComponent,
    JoinChannelComponent,
    GuildSelectComponent,
    ClearPlaylistComponent,
    SearchComponent,
    QueueComponent,
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
    MatListModule,
    MatSnackBarModule,
    DragDropModule,
    MatTabsModule,
    ScrollingModule,
    MatExpansionModule,
    MatSliderModule,
    PortalModule,
    OverlayModule,
    MatRippleModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
