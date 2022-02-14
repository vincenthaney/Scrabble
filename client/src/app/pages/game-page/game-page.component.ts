import { Component, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DefaultDialogComponent } from '@app/components/default-dialog/default-dialog.component';
import { GameService } from '@app/services';
import { FocusableComponentsService } from '@app/services/focusable-components/focusable-components.service';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent {
    constructor(public surrenderDialog: MatDialog, public gameService: GameService, private focusableComponentService: FocusableComponentsService) {}

    @HostListener('document:keypress', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        this.focusableComponentService.emitKeyboard(event);
    }

    quitButtonClicked() {
        let title = '';
        let content = '';
        const buttonsContent = ['', ''];
        if (this.gameService.isGameOver) {
            title = 'Quitter la partie';
            content = 'Voulez-vous vraiment quitter la partie?';
            buttonsContent[0] = 'Quitter la partie';
            buttonsContent[1] = 'Rester dans la partie';
        } else {
            title = 'Abandonner la partie';
            content = 'Voulez-vous vraiment ABANDONNER?';
            buttonsContent[0] = 'Abandonner la partie';
            buttonsContent[1] = 'Continuer la partie';
        }
        this.openDialog(title, content, buttonsContent);
        this.gameService.handleLocalPlayerLeavesGame();
    }

    openDialog(title: string, content: string, buttonsContent: string[]) {
        this.surrenderDialog.open(DefaultDialogComponent, {
            data: {
                title,
                content,
                buttons: [
                    {
                        content: buttonsContent[0],
                        redirect: '/home',
                        style: 'background-color: #FA6B84; color: rgb(0, 0, 0)',
                    },
                    {
                        content: buttonsContent[1],
                        closeDialog: true,
                        style: 'background-color: rgb(231, 231, 231)',
                    },
                ],
            },
        });
    }
}
