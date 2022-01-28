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

    // isInvalidAndModified(): boolean {
    //     // Ternary operator since the return types are boolean | undefined
    //     return this.formParameters.get('inputName')?.invalid &&
    //         (this.formParameters.get('inputName')?.dirty || this.formParameters.get('inputName')?.touched ? true : false)
    //         ? true
    //         : false;
    // }

    // isTooShort(): boolean {
    //     return this.formParameters.get('inputName')?.errors?.minlength;
    // }

    // isTooLong(): boolean {
    //     return this.formParameters.get('inputName')?.errors?.maxlength;
    // }

    // hasSpecialCharacters(): boolean {
    //     return (
    //         this.formParameters.get('inputName')?.errors?.pattern &&
    //         !this.formParameters.get('inputName')?.errors?.maxlength &&
    //         !this.formParameters.get('inputName')?.errors?.minlength
    //     );
    // }
    onNameChange(newName: string) {
        this.playerName = newName;
        this.isInputNameValid.emit(this.formParameters.get('inputName')?.valid);
    }
}
