import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {PlayerComponent} from "./player/player.component";


const routes: Routes = [
  {path: "player/:guildId", component: PlayerComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
