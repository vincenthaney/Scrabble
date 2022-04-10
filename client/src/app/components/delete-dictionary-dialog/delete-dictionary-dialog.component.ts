import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DictionariesService } from '@app/services/dictionaries-service/dictionaries.service';
import { ModifyDictionaryComponent } from '@app/components/modify-dictionary-dialog/modify-dictionary-dialog.component';
import { Subject } from 'rxjs';
import { DeleteDictionaryComponentStates, DeleteDictionaryDialogParameters } from './delete-dictionary-dialog.component.types';

@Component({
    selector: 'app-delete-dictionary-dialog',
    templateUrl: 'delete-dictionary-dialog.component.html',
    styleUrls: ['delete-dictionary-dialog.component.scss'],
})
export class DeleteDictionaryDialogComponent {
    state: DeleteDictionaryComponentStates;
    message: string;
    dictionaryId: string;
    private componentDestroyed$: Subject<boolean>;
    constructor(
        private dialogRef: MatDialogRef<ModifyDictionaryComponent>,
        private dictionariesService: DictionariesService,
        @Inject(MAT_DIALOG_DATA) public data: DeleteDictionaryDialogParameters,
    ) {
        this.componentDestroyed$ = new Subject();
        this.dictionaryId = data.dictionaryId;
        this.dictionariesService.subscribeToComponentUpdateEvent(this.componentDestroyed$, () => {
            this.cleanupDialogStates();
        });
    }

    closeDialog(): void {
        this.dialogRef.close();
    }

    cleanupDialogStates(): void {
        this.state = DeleteDictionaryComponentStates.Ready;
    }

    async deleteDictionary(): Promise<void> {
        this.state = DeleteDictionaryComponentStates.Loading;
        await this.dictionariesService.deleteDictionary(this.dictionaryId);
        this.closeDialog();
    }
}
