import { Component } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-lobby-info',
    templateUrl: './lobby-info.component.html',
    styleUrls: ['./lobby-info.component.scss'],
})
export class LobbyInfoComponent {
    timer: number;
    playerName: string;
    // gameMode: GameMode;
    // dictionnaries: Dictionnaries[]

    constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
        iconRegistry.addSvgIcon('thumbs-up', sanitizer.bypassSecurityTrustResourceUrl('icon.svg'));
    }
}
