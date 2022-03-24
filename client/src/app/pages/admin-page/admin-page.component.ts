import { Component } from '@angular/core';
import { LobbyInfoComponent } from '@app/components/lobby-info/lobby-info.component';

interface Tab {
    link: string;
    component: unknown;
}

@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent {
    tabs: Tab[];
    currentTab: Tab;

    constructor() {
        this.tabs = [
            { link: 'Link 1', component: LobbyInfoComponent },
            { link: 'Link 2', component: LobbyInfoComponent },
            { link: 'Link 3', component: LobbyInfoComponent },
        ];
        this.currentTab = this.tabs[0];
    }
}
