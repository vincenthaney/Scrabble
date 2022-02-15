import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DefaultDialogComponent } from '@app/components/default-dialog/default-dialog.component';
import {
    DIALOG_ABANDON_TITLE,
    DIALOG_ABANDON_CONTENT,
    DIALOG_ABANDON_BUTTON_CONFIRM,
    DIALOG_ABANDON_BUTTON_CONTINUE,
    DIALOG_NO_ACTIVE_GAME_TITLE,
    DIALOG_NO_ACTIVE_GAME_CONTENT,
    DIALOG_NO_ACTIVE_GAME_BUTTON,
} from '@app/constants/pages-constants';
import { GameDispatcherController } from '@app/controllers/game-dispatcher-controller/game-dispatcher.controller';
import { GameService } from '@app/services';
import { FocusableComponentsService } from '@app/services/focusable-components/focusable-components.service';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit, OnDestroy {
    noActiveGameSubscription: Subscription;
    componentDestroyed$: Subject<boolean> = new Subject();

    constructor(
        public dialog: MatDialog,
        public gameService: GameService,
        private focusableComponentService: FocusableComponentsService,
        public reconnectTest: GameDispatcherController,
    ) {}

    @HostListener('document:keypress', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        this.focusableComponentService.emitKeyboard(event);
    }

    @HostListener('window:beforeunload')
    async ngOnDestroy(): Promise<void> {
        if (this.gameService.getGameId()) {
            await this.gameService.disconnectGame();
        }
        this.componentDestroyed$.next(true);
        this.componentDestroyed$.complete();
    }

    ngOnInit(): void {
        this.noActiveGameSubscription = this.gameService.noActiveGameEvent
            .pipe(takeUntil(this.componentDestroyed$))
            .subscribe(() => this.noActiveGameDialog());
        this.gameService.getGameId();
        if (!this.gameService.getGameId()) {
            this.gameService.reconnectGame();
        }
    }

    abandonDialog() {
        this.dialog.open(DefaultDialogComponent, {
            data: {
                title: DIALOG_ABANDON_TITLE,
                content: DIALOG_ABANDON_CONTENT,
                buttons: [
                    {
                        content: DIALOG_ABANDON_BUTTON_CONFIRM,
                        redirect: '/home',
                        style: 'background-color: #FA6B84; color: rgb(0, 0, 0)',
                    },
                    {
                        content: DIALOG_ABANDON_BUTTON_CONTINUE,
                        closeDialog: true,
                        style: 'background-color: rgb(231, 231, 231)',
                    },
                ],
            },
        });
    }
    noActiveGameDialog() {
        this.dialog.open(DefaultDialogComponent, {
            data: {
                title: DIALOG_NO_ACTIVE_GAME_TITLE,
                content: DIALOG_NO_ACTIVE_GAME_CONTENT,
                buttons: [
                    {
                        content: DIALOG_NO_ACTIVE_GAME_BUTTON,
                        closeDialog: true,
                        redirect: '/home',
                        style: 'background-color: rgb(231, 231, 231)',
                    },
                ],
            },
        });
    }
}
