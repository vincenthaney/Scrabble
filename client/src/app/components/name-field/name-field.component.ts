import { Component, EventEmitter, Output } from '@angular/core';
import { NAME_VALIDATION } from '@app/classes/name-validation';
import { FormControl, Validators } from '@angular/forms';

@Component({
    selector: 'app-name-field',
    templateUrl: './name-field.component.html',
    styleUrls: ['./name-field.component.scss'],
})
export class NameFieldComponent {
    @Output() nameChange = new EventEmitter<boolean>();

    playerName: string;

    playerNameValidator = new FormControl('', [
        Validators.pattern(NAME_VALIDATION.rule),
        Validators.minLength(NAME_VALIDATION.minLength),
        Validators.maxLength(NAME_VALIDATION.maxLength),
    ]);

    isInvalidAndModified(): boolean {
        return this.playerNameValidator.invalid && (this.playerNameValidator.dirty || this.playerNameValidator.touched);
    }

    hasSpecialCharacters(): boolean {
        return (
            this.playerNameValidator.errors?.pattern && !this.playerNameValidator.errors?.maxlength && !this.playerNameValidator?.errors?.minlength
        );
    }
    onNameChange(newName: string) {
        this.playerName = newName;
        this.nameChange.emit(this.playerNameValidator.valid);
    }
}
