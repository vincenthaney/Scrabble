import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-upload-dictionary',
    templateUrl: 'upload-dictionary.component.html',
    styleUrls: ['upload-dictionary.component.scss'],
})
export class UploadDictionaryComponent {
    fileName = '';

    constructor(private http: HttpClient) {}

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onFileSelected(event: any) {
        const file: File = event.target.files[0];
        if (file) {
            const endpoint = `${environment.serverUrl}/dictionaries`;
            const upload$ = this.http.post(endpoint, JSON.stringify(file));
            upload$.subscribe();
        }
    }
}
