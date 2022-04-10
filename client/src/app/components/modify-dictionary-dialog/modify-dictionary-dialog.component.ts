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
    dictionaryToModifyTitle: string;
    dictionaryToModifyDescription: string;
    dictionaryId: string;
    formParameters: FormGroup;
    isDictionaryTitleValid: boolean;
    isDictionaryDescriptionValid: boolean;
    isNewInformationValid: boolean;
    private componentDestroyed$: Subject<boolean>;
    constructor(
        private dialogRef: MatDialogRef<ModifyDictionaryComponent>,
        private dictionariesService: DictionariesService,
        @Inject(MAT_DIALOG_DATA) public data: DictionaryDialogParameters,
    ) {
        this.componentDestroyed$ = new Subject();
        this.state = ModifyDictionaryComponentStates.Ready;
        this.dictionaryToModifyTitle = data.dictionaryToModifyTitle;
        this.dictionaryToModifyDescription = data.dictionaryToModifyDescription;
        this.dictionaryId = data.dictionaryId;
        this.isDictionaryTitleValid = true;
        this.isDictionaryDescriptionValid = true;
        this.isNewInformationValid = false;
        this.formParameters = new FormGroup({
            inputDictionaryTitle: new FormControl(data.dictionaryToModifyTitle, [
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
        this.dictionariesService.subscribeToComponentUpdateEvent(this.componentDestroyed$, () => {
            this.cleanupDialogStates();
        });
    }

    ngOnChanges(): void {
        this.formParameters.controls.inputTitle?.updateValueAndValidity();
        this.isDictionaryTitleValid = this.formParameters.get('inputDictionaryTitle')?.valid ?? false;
        this.isDictionaryDescriptionValid = this.formParameters.get('inputDictionaryDescription')?.valid ?? false;
        this.isNewInformationValid = this.isInformationValid();
    }

    ngOnDestroy(): void {
        this.componentDestroyed$.next(true);
        this.componentDestroyed$.complete();
    }

    updateDictionary(): void {
        this.state = ModifyDictionaryComponentStates.Loading;
        this.dictionariesService.updateDictionary(
            this.dictionaryId,
            this.formParameters.get('inputDictionaryTitle')?.value,
            this.formParameters.get('inputDictionaryDescription')?.value,
        );
        this.closeDialog();
    }

    closeDialog(): void {
        this.dialogRef.close();
        this.cleanupDialogStates();
    }

    isInformationValid(): boolean {
        return this.isDictionaryTitleValid && this.isDictionaryDescriptionValid;
    }

    cleanupDialogStates(): void {
        this.state = ModifyDictionaryComponentStates.Ready;
    }
}
