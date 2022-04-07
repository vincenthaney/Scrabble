import { Component, Inject, OnChanges, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DICTIONARY_DESCRIPTION_VALIDATION, DICTIONARY_NAME_VALIDATION } from '@app/constants/dictionary-name-validation';
import { DictionariesService } from '@app/services/dictionaries-service/dictionaries.service';
import { Subject } from 'rxjs';
import {
    DictionaryDialogParameters,
    ModifyDictionaryComponentStates,
} from '@app/components/modify-dictionary-dialog/modify-dictionary-dialog.component.types';

@Component({
    selector: 'app-modify-dictionary-dialog',
    templateUrl: './modify-dictionary-dialog.component.html',
    styleUrls: ['./modify-dictionary-dialog.component.scss'],
})
export class ModifyDictionaryComponent implements OnChanges, OnDestroy {
    icon: string;
    state: ModifyDictionaryComponentStates;
    message: string;
    title: string;
    dictionaryToModifyName: string;
    dictionaryToModifyDescription: string;
    dictionaryId: string;
    formParameters: FormGroup;
    isDictionaryNameValid: boolean;
    isDictionaryDescriptionValid: boolean;
    isNewInformationValid: boolean;
    private serviceDestroyed$: Subject<boolean> = new Subject();
    constructor(
        private dialogRef: MatDialogRef<ModifyDictionaryComponent>,
        private dictionariesService: DictionariesService,
        @Inject(MAT_DIALOG_DATA) public data: DictionaryDialogParameters,
    ) {
        this.state = ModifyDictionaryComponentStates.Ready;
        this.title = data.title;
        this.dictionaryToModifyName = data.dictionaryToModifyName;
        this.dictionaryToModifyDescription = data.dictionaryToModifyDescription;
        this.dictionaryId = data.dictionaryId;
        this.isDictionaryNameValid = true;
        this.isDictionaryDescriptionValid = true;
        this.isNewInformationValid = true;
        this.formParameters = new FormGroup({
            inputDictionaryName: new FormControl(data.dictionaryToModifyName, [
                Validators.required,
                Validators.minLength(DICTIONARY_NAME_VALIDATION.minLength),
                Validators.maxLength(DICTIONARY_NAME_VALIDATION.maxLength),
            ]),
            inputDictionaryDescription: new FormControl(data.dictionaryToModifyDescription, [
                Validators.required,
                Validators.minLength(DICTIONARY_DESCRIPTION_VALIDATION.minLength),
                Validators.maxLength(DICTIONARY_DESCRIPTION_VALIDATION.maxLength),
            ]),
        });
        this.dictionariesService.subscribeToComponentUpdateEvent(this.serviceDestroyed$, () => {
            this.cleanupDialogStates();
        });
    }

    ngOnChanges(): void {
        this.formParameters.controls.inputName?.updateValueAndValidity();
        this.isDictionaryNameValid = this.formParameters.get('inputDictionaryName')?.valid ?? false;
        this.isDictionaryDescriptionValid = this.formParameters.get('inputDictionaryDescription')?.valid ?? false;
        this.isNewInformationValid = this.isInformationValid();
    }

    ngOnDestroy(): void {
        this.serviceDestroyed$.next(true);
        this.serviceDestroyed$.complete();
    }

    updateDictionary(): void {
        this.state = ModifyDictionaryComponentStates.Loading;
        this.dictionariesService.updateDictionary(
            this.dictionaryId,
            this.formParameters.get('inputDictionaryName')?.value,
            this.formParameters.get('inputDictionaryDescription')?.value,
        );
        this.closeDialog();
    }

    closeDialog(): void {
        this.dialogRef.close();
        this.cleanupDialogStates();
    }

    isInformationValid(): boolean {
        return this.isDictionaryNameValid && this.isDictionaryDescriptionValid;
    }

    cleanupDialogStates(): void {
        this.state = ModifyDictionaryComponentStates.Ready;
    }
}
