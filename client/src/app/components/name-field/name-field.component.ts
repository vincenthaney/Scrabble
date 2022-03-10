import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NAME_VALIDATION } from '@app/classes/name-validation';
import { NAME_NO_MATCH_REGEX, NAME_TOO_LONG, NAME_TOO_SHORT } from '@app/constants/name-field';

@Component({
    selector: 'app-name-field',
    templateUrl: './name-field.component.html',
    styleUrls: ['./name-field.component.scss'],
})
export class NameFieldComponent {
    @Output() isInputNameValid = new EventEmitter<boolean>();
    playerName: string;
    errorNameTooShort: string = NAME_TOO_SHORT;
    errorNameTooLong: string = NAME_TOO_LONG;
    errorNameNoMatchRegex: string = NAME_NO_MATCH_REGEX;

    formParameters = new FormGroup({
        inputName: new FormControl('', [
            Validators.required,
            Validators.pattern(NAME_VALIDATION.rule),
            Validators.minLength(NAME_VALIDATION.minLength),
            Validators.maxLength(NAME_VALIDATION.maxLength),
        ]),
    });

    onNameChange(newName: string): void {
        this.playerName = newName;
        this.isInputNameValid.emit(this.formParameters.get('inputName')?.valid);
    }
}
