import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-upload-dictionary',
    templateUrl: 'upload-dictionary.component.html',
    styleUrls: ['upload-dictionary.component.scss'],
})
export class UploadDictionaryComponent {
    fileName = '';
    isUploadableFile: boolean = false;
    constructor(private http: HttpClient, private dialogRef: MatDialogRef<UploadDictionaryComponent>) {}

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onFileSelected(event: any): void {
        const file: File = event.target.files[0];
        const fileJSON = JSON.stringify(file);
        if (this.isJSONDictionaryFile(fileJSON)) {
            this.isUploadableFile = true;
            const endpoint = `${environment.serverUrl}/dictionaries`;
            const upload$ = this.http.post(endpoint, JSON.stringify(file));
            upload$.subscribe();
            return;
        }
        this.isUploadableFile = false;
    }
    closeDialog(): void {
        this.dialogRef.close();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    isJSONDictionaryFile(fileJSON: any): boolean {
        console.log(fileJSON);
        return fileJSON.title && fileJSON.description && fileJSON.words;
    }
}
