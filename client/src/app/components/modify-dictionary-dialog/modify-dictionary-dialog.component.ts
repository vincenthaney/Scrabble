import { Component, Inject, OnChanges, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DICTIONARY_DESCRIPTION_VALIDATION, DICTIONARY_NAME_VALIDATION } from '@app/constants/dictionary-name-validation';
import { DICTIONARY_NOT_UPDATED, DICTIONARY_UPDATED } from '@app/constants/dictionary-service-constants';
import { DictionariesService } from '@app/services/dictionaries-service/dictionaries.service';
import { Subject } from 'rxjs';
import {
    DictionaryDialogParameters,
    ModifyDictionaryComponentIcons,
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
    dictionarytoModifyDescription: string;
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
                Validators.pattern(DICTIONARY_DESCRIPTION_VALIDATION.rule),
                Validators.minLength(DICTIONARY_DESCRIPTION_VALIDATION.minLength),
                Validators.maxLength(DICTIONARY_DESCRIPTION_VALIDATION.maxLength),
            ]),
        });
        this.dictionariesService.subscribeToComponentUpdateEvent(this.serviceDestroyed$, (message) => {
            if (message === DICTIONARY_NOT_UPDATED) {
                this.updateMessage(message);
                this.icon = ModifyDictionaryComponentIcons.ErrorIcon;
            }
            if (message === DICTIONARY_UPDATED) {
                this.updateMessage(message);
                this.icon = ModifyDictionaryComponentIcons.SuccessIcon;
            }
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
    }

    closeDialog(): void {
        this.dialogRef.close();
        this.cleanupDialogStates();
    }

    isInformationValid(): boolean {
        return this.isDictionaryNameValid && this.isDictionaryDescriptionValid;
    }

    cleanupDialogStates(): void {
        this.icon = ModifyDictionaryComponentIcons.NoIcon;
        this.message = '';
    }

    private updateMessage(message: string): void {
        this.state = ModifyDictionaryComponentStates.Message;
        this.message = message;
    }
}
