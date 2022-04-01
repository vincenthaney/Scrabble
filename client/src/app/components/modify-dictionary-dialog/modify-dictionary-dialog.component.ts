import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DictionaryDialogParameters } from './modify-dictionary-dialog.component.types';

@Component({
    selector: 'app-modify-dictionary-dialog',
    templateUrl: './modify-dictionary-dialog.component.html',
    styleUrls: ['./modify-dictionary-dialog.component.scss'],
})
export class DefaultDialogComponent {
    title: string;
    content: string | undefined;

    constructor(@Inject(MAT_DIALOG_DATA) public data: DictionaryDialogParameters, private router: Router) {
        this.data = data;
    }
}
