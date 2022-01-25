import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SurrenderDialogComponent } from '@app/components/surrender-dialog/surrender-dialog.component';
@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent {
    constructor(public surrenderDialog: MatDialog) {}

    openDialog() {
        this.surrenderDialog.open(SurrenderDialogComponent);
    }
}
