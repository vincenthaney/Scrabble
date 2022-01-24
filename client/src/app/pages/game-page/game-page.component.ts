import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SurrenderDialogComponent } from '@app/components/surrender-dialog/surrender-dialog.component';
// TODO: See if I have to include manually MatDialog and SurrenderDialogCompo

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent {
    constructor(public dialog: MatDialog) {}

    openDialog() {
        this.dialog.open(SurrenderDialogComponent);
    }
}
