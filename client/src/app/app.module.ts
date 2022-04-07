import { ScrollingModule } from '@angular/cdk/scrolling';
import { HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, LOCALE_ID, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BoardComponent } from '@app/components/board/board.component';
import { SquareComponent } from '@app/components/square/square.component';
import { TileRackComponent } from '@app/components/tile-rack/tile-rack.component';
import { TileComponent } from '@app/components/tile/tile.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { CreateWaitingPageComponent } from '@app/pages/create-waiting-page/create-waiting-page.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { HomePageComponent } from '@app/pages/home-page/home-page.component';
import { JoinWaitingPageComponent } from '@app/pages/join-waiting-page/join-waiting-page.component';
import { CommunicationBoxComponent } from './components/communication-box/communication-box.component';
import { DefaultDialogComponent } from './components/default-dialog/default-dialog.component';
import { IconComponent } from './components/icon/icon.component';
import { InformationBoxComponent } from './components/information-box/information-box.component';
import { LobbyInfoComponent } from './components/lobby-info/lobby-info.component';
import { NameFieldComponent } from './components/name-field/name-field.component';
import { PageHeaderComponent } from './components/page-header/page-header.component';
import { TimerSelectionComponent } from './components/timer-selection/timer-selection.component';
import { GameCreationPageComponent } from './pages/game-creation-page/game-creation-page.component';
import { LobbyPageComponent } from './pages/lobby-page/lobby-page.component';
import { SocketService } from './services';
import { HighScoresPageComponent } from './pages/high-scores-page/high-scores-page.component';
import { HighScoreBoxComponent } from './components/high-score-box/high-score-box.component';
import { ConvertDialogComponent } from './components/convert-dialog/convert-dialog.component';
import { AdminPageComponent } from './pages/admin-page/admin-page.component';
import { AdminHighScoresComponent } from './components/admin-high-scores/admin-high-scores.component';
import { AdminGameHistoryComponent } from './components/admin-game-history/admin-game-history.component';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { DurationPipe } from './pipes/duration/duration.pipe';

registerLocaleData(localeFr);

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
        TimerSelectionComponent,
        PageHeaderComponent,
        HighScoresPageComponent,
        HighScoreBoxComponent,
        ConvertDialogComponent,
        AdminPageComponent,
        AdminHighScoresComponent,
        AdminGameHistoryComponent,
        DurationPipe,
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
    providers: [
        SocketService,
        {
            provide: APP_INITIALIZER,
            useFactory: (socketService: SocketService) => async () => socketService.initializeService(),
            deps: [SocketService],
            multi: true,
        },
        {
            provide: LOCALE_ID,
            useValue: 'fr-CA',
        },
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
