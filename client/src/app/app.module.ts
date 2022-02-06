import { ScrollingModule } from '@angular/cdk/scrolling';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BoardComponent } from '@app/components/board/board.component';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { SquareComponent } from '@app/components/square/square.component';
import { TileRackComponent } from '@app/components/tile-rack/tile-rack.component';
import { TileComponent } from '@app/components/tile/tile.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { CreateWaitingPageComponent } from '@app/pages/create-waiting-page/create-waiting-page.component';
import { GameCreationPageComponent } from '@app/pages/game-creation-page/game-creation-page.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { HomePageComponent } from '@app/pages/home-page/home-page.component';
import { JoinWaitingPageComponent } from '@app/pages/join-waiting-page/join-waiting-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { CommunicationBoxComponent } from './components/communication-box/communication-box.component';
import { DefaultDialogComponent } from './components/default-dialog/default-dialog.component';
import { IconComponent } from './components/icon/icon.component';
import { InformationBoxComponent } from './components/information-box/information-box.component';
import { LobbyInfoComponent } from './components/lobby-info/lobby-info.component';
import { NameFieldComponent } from './components/name-field/name-field.component';
import { LobbyPageComponent } from './pages/lobby-page/lobby-page.component';

/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [
        AppComponent,
        GamePageComponent,
        MainPageComponent,
        PlayAreaComponent,
        HomePageComponent,
        SquareComponent,
        TileComponent,
        InformationBoxComponent,
        CommunicationBoxComponent,
        BoardComponent,
        TileRackComponent,
        LobbyPageComponent,
        LobbyInfoComponent,
        CreateWaitingPageComponent,
        JoinWaitingPageComponent,
        GameCreationPageComponent,
        DefaultDialogComponent,
        IconComponent,
        NameFieldComponent,
    ],
    imports: [
        AppMaterialModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        ScrollingModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
