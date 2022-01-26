import { Component, EventEmitter, Output } from '@angular/core';
@Component({
    selector: 'app-surrender-dialog',
    templateUrl: './surrender-dialog.component.html',
    styleUrls: ['./surrender-dialog.component.scss'],
})
export class SurrenderDialogComponent {
    @Output() surrenderConfirmed = new EventEmitter<boolean>();

    closeAndRedirect() {
        this.surrenderConfirmed.emit(true);
    }
}
