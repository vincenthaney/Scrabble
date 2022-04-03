import { Component } from '@angular/core';
// import { FileUploadService } from '@app/services/file-upload-service/file-upload.service';

@Component({
    selector: 'app-file-upload',
    templateUrl: './file-upload.component.html',
    styleUrls: ['./file-upload.component.scss'],
})
export class FileUploadComponent {
    // Variable to store shortLink from api response
    shortLink: string = '';
    loading: boolean = false; // Flag variable
    file: File; // Variable to store file
}
//     // Inject service
//     constructor(private fileUploadService: FileUploadService) {}

//     // On file Select
//     onChange(event) {
//         this.file = event.target.files[0];
//     }

//     // OnClick of button Upload
//     onUpload() {
//         this.loading = !this.loading;
//         this.fileUploadService.upload(this.file).subscribe((event) => {
//             if (typeof event === 'object') {
//                 // Short link via api response
//                 this.shortLink = event.link;

//                 this.loading = false; // Flag variable
//             }
//         });
//     }
