import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DictionaryData } from '@app/classes/dictionary';
import { WRONG_FILE_TYPE } from '@app/constants/dictionaries-components';
import { DictionariesService } from '@app/services/dictionaries-service/dictionaries.service';

@Component({
    selector: 'app-upload-dictionary',
    templateUrl: 'upload-dictionary.component.html',
    styleUrls: ['upload-dictionary.component.scss'],
})
export class UploadDictionaryComponent {
    title: string = "Téléchargement d'un nouveau dictionaire";
    errorMessage: string = '';
    isUploadableFile: boolean = false;
    selectedFile: File;
    newDictionary: DictionaryData;
    constructor(private dialogRef: MatDialogRef<UploadDictionaryComponent>, private dictionariesService: DictionariesService) {}

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onFileChanged(event: any) {
        this.selectedFile = event.target.files[0];
        const fileReader = new FileReader();
        fileReader.readAsText(this.selectedFile, 'UTF-8');
        fileReader.onload = () => {
            try {
                this.newDictionary = JSON.parse(fileReader.result as string) as DictionaryData;
            } catch (error) {
                const newError = error as SyntaxError;
                this.errorMessage = newError.message;
            }
        };
        fileReader.onerror = () => {
            this.errorMessage = WRONG_FILE_TYPE;
        };
    }
    onUpload() {
        this.dictionariesService.uploadDictionary(this.newDictionary);
        this.dialogRef.close();
    }
    closeDialog(): void {
        this.dialogRef.close();
    }
}
