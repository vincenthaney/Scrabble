import { Component, EventEmitter, Output } from '@angular/core';
import { NAME_VALIDATION } from '@app/classes/name-validation';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-name-field',
    templateUrl: './name-field.component.html',
    styleUrls: ['./name-field.component.scss'],
})
export class NameFieldComponent {
    @Output() isInputNameValid = new EventEmitter<boolean>();

    playerName: string;

    formParameters = new FormGroup({
        inputName: new FormControl('', [
            Validators.required,
            Validators.pattern(NAME_VALIDATION.rule),
            Validators.minLength(NAME_VALIDATION.minLength),
            Validators.maxLength(NAME_VALIDATION.maxLength),
        ]),
    });

    onNameChange(newName: string) {
        this.playerName = newName;
        this.isInputNameValid.emit(this.formParameters.get('inputName')?.valid);
    }
}
