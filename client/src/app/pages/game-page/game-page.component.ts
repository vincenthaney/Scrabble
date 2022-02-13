import { Component, OnInit, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DefaultDialogComponent } from '@app/components/default-dialog/default-dialog.component';
import { GameService } from '@app/services';
import { FocusableComponentsService } from '@app/services/focusable-components/focusable-components.service';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit {
    constructor(public surrenderDialog: MatDialog, public gameService: GameService, private focusableComponentService: FocusableComponentsService) {}

    @HostListener('document:keypress', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        this.focusableComponentService.emitKeyboard(event);
    }

    // TODO: Fix if player goes to /game or change attribute when game starts
    @HostListener('window:beforeunload')
    onBeforeUnload() {
        if (this.gameService.getGameId()) {
            console.log('beforeunload');
            this.gameService.disconnectGame();
        }
    }

    ngOnInit(): void {
        if (!this.gameService.getGameId()) {
            this.gameService.reconnectGame();
        }
    }

    openDialog() {
        this.surrenderDialog.open(DefaultDialogComponent, {
            data: {
                title: 'Abandonner la partie',
                content: 'Voulez-vous vraiment ABANDONNER?',
                buttons: [
                    {
                        content: 'Abandonner la partie',
                        redirect: '/home',
                        style: 'background-color: #FA6B84; color: rgb(0, 0, 0)',
                    },
                    {
                        content: 'Continuer la partie',
                        closeDialog: true,
                        style: 'background-color: rgb(231, 231, 231)',
                    },
                ],
            },
        });
    }
}
