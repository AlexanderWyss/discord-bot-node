import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PlayerComponent} from './player/player.component';
import {GuildSelectComponent} from './guild-select/guild-select.component';


const routes: Routes = [
  {path: 'player/:guildId', component: PlayerComponent},
  {path: 'player/:guildId/:userId', component: PlayerComponent},
  {path: 'guilds', component: GuildSelectComponent},
  {
    path: '**',
    redirectTo: '/guilds',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
