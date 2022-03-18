import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NAME_VALIDATION } from '@app/classes/name-validation';
import { NAME_NO_MATCH_REGEX, NAME_SAME_AS_VIRTUAL_PLAYER, NAME_TOO_LONG, NAME_TOO_SHORT } from '@app/constants/name-field';

@Component({
    selector: 'app-name-field',
    templateUrl: './name-field.component.html',
    styleUrls: ['./name-field.component.scss'],
})
export class NameFieldComponent implements OnChanges {
    @Input() virtualPlayerName: string = '';
    @Input() mustVerifyVirtualPlayerName: boolean = false;
    @Output() isInputNameValid = new EventEmitter<boolean>();
    @Output() playerNameChange = new EventEmitter<[name: string, valid: boolean]>();
    errorNameTooShort: string = NAME_TOO_SHORT;
    errorNameTooLong: string = NAME_TOO_LONG;
    errorNameNoMatchRegex: string = NAME_NO_MATCH_REGEX;
    errorSameNameAsVirtualPlayer: string = NAME_SAME_AS_VIRTUAL_PLAYER;

    formParameters = new FormGroup({
        inputName: new FormControl('', [
            Validators.required,
            Validators.pattern(NAME_VALIDATION.rule),
            Validators.minLength(NAME_VALIDATION.minLength),
            Validators.maxLength(NAME_VALIDATION.maxLength),
            // we must disable to use the custom validator created in this class.
            // eslint-disable-next-line no-invalid-this
            this.nameDifferentFromVirtualPlayer(),
        ]),
    });

    ngOnChanges(): void {
        this.onChange();
    }

    onChange(): void {
        if (this.formParameters.controls.inputName?.dirty) this.formParameters.controls.inputName?.markAsTouched();
        this.formParameters.controls.inputName?.updateValueAndValidity();
        const isNameValid: boolean = this.formParameters.get('inputName')?.valid ?? false;
        this.isInputNameValid.emit(isNameValid);
        this.playerNameChange.emit([this.formParameters.get('inputName')?.value, isNameValid]);
    }

    private nameDifferentFromVirtualPlayer(): ValidatorFn {
        return (inputName: AbstractControl): ValidationErrors | null => {
            if (!this.mustVerifyVirtualPlayerName) return null;
            if (inputName.value !== this.virtualPlayerName) return null;
            return { nameDifferentFomVirtualPlayer: true };
        };
    }
}
