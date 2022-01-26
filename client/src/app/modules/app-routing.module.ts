import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { HomePageComponent } from '@app/pages/home-page/home-page.component';
import { WaitingPageComponent } from '@app/pages/waiting-page/waiting-page.component';
import { LobbyPageComponent } from '@app/pages/lobby-page/lobby-page.component';

import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'main', component: MainPageComponent },
    { path: 'home', component: HomePageComponent },
    { path: 'game', component: GamePageComponent },
    { path: 'material', component: MaterialPageComponent },
    { path: 'waiting', component: WaitingPageComponent },
    { path: 'lobby', component: LobbyPageComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
