import { Component, Inject, OnChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DICTIONARY_NAME_VALIDATION } from '@app/constants/dictionary-name-validation';
import { DictionariesService } from '@app/services/dictionaries-service/dictionaries.service';
import { DictionaryDialogParameters } from './modify-dictionary-dialog.component.types';

@Component({
    selector: 'app-modify-dictionary-dialog',
    templateUrl: './modify-dictionary-dialog.component.html',
    styleUrls: ['./modify-dictionary-dialog.component.scss'],
})
export class ModifyDictionaryComponent implements OnChanges {
    title: string;
    dictionaryToModifyName: string;
    dictionarytoModifyDescription: string;
    dictionaryId: string;
    formParameters: FormGroup;
    isDictionaryNameValid: boolean;
    isDictionaryDescriptionValid: boolean;
    isNewInformationValid: boolean;

    constructor(
        private dialogRef: MatDialogRef<ModifyDictionaryComponent>,
        private dictionariesService: DictionariesService,
        @Inject(MAT_DIALOG_DATA) public data: DictionaryDialogParameters,
    ) {
        this.title = data.title;
        this.dictionaryToModifyName = data.dictionaryToModifyName;
        this.dictionarytoModifyDescription = data.dictionarytoModifyDescription;
        this.dictionaryId = data.dictionaryId;
        this.isDictionaryNameValid = true;
        this.isDictionaryDescriptionValid = true;
        this.isNewInformationValid = true;
        this.formParameters = new FormGroup({
            inputDictionaryName: new FormControl(data.dictionaryToModifyName, [
                Validators.required,
                Validators.pattern(DICTIONARY_NAME_VALIDATION.rule),
                Validators.minLength(DICTIONARY_NAME_VALIDATION.minLength),
                Validators.maxLength(DICTIONARY_NAME_VALIDATION.maxLength),
            ]),
            inputDictionaryDescription: new FormControl(data.dictionarytoModifyDescription, [
                Validators.required,
                Validators.pattern(DICTIONARY_NAME_VALIDATION.rule),
                Validators.minLength(DICTIONARY_NAME_VALIDATION.minLength),
                Validators.maxLength(DICTIONARY_NAME_VALIDATION.maxLength),
            ]),
        });
    }

    ngOnChanges(): void {
        this.onChange();
    }

    onChange(): void {
        this.formParameters.controls.inputName?.updateValueAndValidity();
        this.isDictionaryNameValid = this.formParameters.get('inputDictionaryName')?.valid ?? false;
        this.isDictionaryDescriptionValid = this.formParameters.get('inputDictionaryDescription')?.valid ?? false;
        this.isNewInformationValid = this.isInformationValid();
    }

    updateDictionary(): void {
        this.dictionariesService.updateDictionary(
            this.dictionaryId,
            this.formParameters.get('inputDictionaryName')?.value,
            this.formParameters.get('inputDictionaryDescription')?.value,
        );
        this.dialogRef.close();
    }

    closeDialog(): void {
        this.dialogRef.close();
    }

    isInformationValid(): boolean {
        return this.isDictionaryNameValid && this.isDictionaryDescriptionValid;
    }
}
