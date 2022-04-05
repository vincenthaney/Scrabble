import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DictionaryData } from '@app/classes/dictionary';
import { FILE_NOT_DICTIONARY, WRONG_FILE_TYPE } from '@app/constants/dictionaries-components';

@Component({
    selector: 'app-upload-dictionary',
    templateUrl: 'upload-dictionary.component.html',
    styleUrls: ['upload-dictionary.component.scss'],
})
export class UploadDictionaryComponent {
    errorMessage: string = '';
    isUploadableFile: boolean = false;
    selectedFile: File;
    jsonFile: DictionaryData;
    constructor(private dialogRef: MatDialogRef<UploadDictionaryComponent>) {}

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onFileChanged(event: any) {
        this.selectedFile = event.target.files[0];
        const fileReader = new FileReader();
        fileReader.readAsText(this.selectedFile, 'UTF-8');
        fileReader.onload = () => {
            try {
                const readFile: DictionaryData = JSON.parse(fileReader.result as string);
                if (this.isDictionaryDataInterface(readFile)) {
                    this.jsonFile = readFile;
                } else {
                    this.errorMessage = FILE_NOT_DICTIONARY;
                }
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
        // upload code goes here
    }
    closeDialog(): void {
        this.dialogRef.close();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    isJSONDictionaryFile(fileJSON: any): boolean {
        console.log(fileJSON);
        return fileJSON.title && fileJSON.description && fileJSON.words;
    }

    isDictionaryDataInterface(data: DictionaryData): boolean {
        return (
            data instanceof Object && 'title' in data && data instanceof Object && 'description' in data && data instanceof Object && 'words' in data
        );
    }
}
