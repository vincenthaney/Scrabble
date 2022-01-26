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
        const surrenderDialogRef = this.surrenderDialog.open(SurrenderDialogComponent);
        const subscriber = surrenderDialogRef.componentInstance.surrenderConfirmed.subscribe((result) => {
            if (result) {
                this.surrenderDialog.closeAll();
                // TODO: Verify if possible to do it cleaner and hardcoded to /lobby rightnow
                window.location.href = window.location.hostname + '#/lobby';
            }
        });
        surrenderDialogRef.afterClosed().subscribe(() => {
            subscriber.unsubscribe();
        });
    }
}
