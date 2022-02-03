import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import defaultDialogErrors from './default-dialog.component.errors';
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
        if (!this.data.title || typeof this.data.title !== 'string') throw new Error(defaultDialogErrors.DIALOG_MUST_HAVE_TITLE);

        this.title = this.data.title;
        this.content = this.data.content;
        this.buttons = [];

        if (this.data.buttons) {
            if (!Array.isArray(this.data.buttons)) throw new Error(defaultDialogErrors.DIALOG_BUTTONS_MUST_BE_AN_ARRAY);

            this.data.buttons.forEach((btn) => {
                if (!btn.content) throw new Error(defaultDialogErrors.BUTTON_MUST_HAVE_CONTENT);
                this.buttons.push({
                    content: btn.content,
                    closeDialog: btn.redirect ? true : btn.closeDialog ?? false,
                    action: btn.action,
                    redirect: btn.redirect,
                    style: btn.style,
                });
            });
        }
    }

    handleButtonClick(button: DefaultDialogButtonParameters) {
        if (button.action) button.action();
        if (button.redirect) this.router.navigate([button.redirect]);
    }
}
