import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
// TODO: See if I have to include manually
@Component({
    selector: 'app-surrender-dialog',
    templateUrl: './surrender-dialog.component.html',
    styleUrls: ['./surrender-dialog.component.scss'],
})
export class SurrenderDialogComponent {
    constructor(public dialog: MatDialog) {}

    openDialog() {
        this.dialog.open(SurrenderDialogComponent);
    }
}
