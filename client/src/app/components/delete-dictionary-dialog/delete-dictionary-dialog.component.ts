import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DictionariesService } from '@app/services/dictionaries-service/dictionaries.service';
import { ModifyDictionaryComponent } from '@app/components/modify-dictionary-dialog/modify-dictionary-dialog.component';
import { Subject } from 'rxjs';
import { DeleteDictionaryComponentStates, DeleteDictionaryDialogParameters } from './delete-dictionary-dialog.component.types';
import { DELETE_COMPONENT_TITLE } from '@app/constants/dictionaries-components';

@Component({
    selector: 'app-delete-dictionary-dialog',
    templateUrl: 'delete-dictionary-dialog.component.html',
    styleUrls: ['delete-dictionary-dialog.component.scss'],
})
export class DeleteDictionaryDialogComponent {
    title: string;
    state: DeleteDictionaryComponentStates;
    message: string;
    dictionaryId: string;
    private serviceDestroyed$: Subject<boolean> = new Subject();
    constructor(
        private dialogRef: MatDialogRef<ModifyDictionaryComponent>,
        private dictionariesService: DictionariesService,
        @Inject(MAT_DIALOG_DATA) public data: DeleteDictionaryDialogParameters,
    ) {
        this.title = DELETE_COMPONENT_TITLE;
        this.dictionaryId = data.dictionaryId;
        this.dictionariesService.subscribeToComponentUpdateEvent(this.serviceDestroyed$, (response) => {
            this.updateMessage(response);
        });
    }

    closeDialog(): void {
        this.dialogRef.close();
    }

    cleanupDialogStates(): void {
        this.state = DeleteDictionaryComponentStates.Ready;
        this.message = '';
    }

    async deleteDictionary(): Promise<void> {
        this.state = DeleteDictionaryComponentStates.Loading;
        await this.dictionariesService.deleteDictionary(this.dictionaryId);
    }

    private updateMessage(message: string): void {
        this.state = DeleteDictionaryComponentStates.Message;
        this.message = message;
    }
}
