import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';
import { HomePageComponent } from '@app/pages/home-page/home-page.component';
import { InformationBoxComponent } from './components/information-box/information-box.component';
import { CommunicationBoxComponent } from './components/communication-box/communication-box.component';
import { BoardComponent } from './components/board/board.component';
import { RackComponent } from './components/rack/rack.component';
import { SurrenderDialogComponent } from './components/surrender-dialog/surrender-dialog.component';
import { WaitingPageComponent } from '@app/pages/waiting-page/waiting-page.component';
import { CreateWaitingPageComponent } from '@app/pages/create-waiting-page/create-waiting-page.component';
import { DefaultDialogComponent } from './components/default-dialog/default-dialog.component';

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
        MaterialPageComponent,
        PlayAreaComponent,
        SidebarComponent,
        HomePageComponent,
        InformationBoxComponent,
        CommunicationBoxComponent,
        BoardComponent,
        RackComponent,
        SurrenderDialogComponent,
        WaitingPageComponent,
        CreateWaitingPageComponent,
        DefaultDialogComponent,
    ],
    imports: [AppMaterialModule, AppRoutingModule, BrowserAnimationsModule, BrowserModule, FormsModule, HttpClientModule],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
