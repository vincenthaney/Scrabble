import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

@Component({
    selector: 'app-lobby-page',
    templateUrl: './lobby-page.component.html',
    styleUrls: ['./lobby-page.component.scss'],
})
export class LobbyPageComponent {
    playerName: string;

    playerNameController = new FormControl('', [
        // Validators.pattern(NameValidation.rule),
        // Validators.minLength(NameValidation.minLength),
        // Validators.maxLength(NameValidation.maxLength),
        Validators.minLength(2),
        // Validators.maxLength(20),
    ]);
    onNameFieldChange(name: string) {
        this.playerName = name;
    }
}
