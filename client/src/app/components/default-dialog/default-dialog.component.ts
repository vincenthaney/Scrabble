import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DefaultDialogButtonParameters, DefaultDialogParameters } from './default-dialog.component.types';

@Component({
    selector: 'app-default-dialog',
    templateUrl: './default-dialog.component.html',
    styleUrls: ['./default-dialog.component.scss'],
})
export class DefaultDialogComponent {
    title: string;
    content: string | undefined;
    buttons: DefaultDialogButtonParameters[];

    constructor(@Inject(MAT_DIALOG_DATA) public data: DefaultDialogParameters, private router: Router) {
        // Data must be handled because it is not typed correctly when used in dialog.open(...)
        if (!this.data.title || typeof this.data.title !== 'string') throw new Error('Default dialog must have a title of type string.');

        this.title = this.data.title;
        this.content = this.data.content;
        this.buttons = [];

        if (this.data.buttons) {
            if (!Array.isArray(this.data.buttons)) throw new Error('Default dialog buttons must be an array');

            this.data.buttons.forEach((btn) => {
                if (!btn.content) throw new Error('Default dialog buttons element must have content');
                this.buttons.push({
                    content: btn.content,
                    closeDialog: btn.redirect ? true : btn.closeDialog ?? false,
                    action: btn.action,
                    redirect: btn.redirect,
                });
            });
        }
    }

    handleButtonClick(button: DefaultDialogButtonParameters) {
        if (button.action) button.action();
        if (button.redirect) this.router.navigate([button.redirect]);
    }
}

/*

HOW TO USE :

    constructor(public dialog: MatDialog) {}

    openDialog() {
        this.dialog.open(DefaultDialogComponent, {
            data: {
                title: 'Dialog title',
                content: 'This is the dialog content',
                buttons: [
                    {
                        content: 'Close',
                        closeDialog: true,
                    },
                    {
                        content: 'Ok',
                        redirect: '/game',
                    },
                ],
            },
        });
    }

*/
