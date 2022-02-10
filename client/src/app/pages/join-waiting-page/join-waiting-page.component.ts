import { Component, OnDestroy, OnInit, HostListener } from '@angular/core';
import {
    DIALOG_BUTTON_CONTENT,
    DIALOG_CANCEL_CONTENT,
    DIALOG_CANCEL_TITLE,
    DIALOG_REJECT_CONTENT,
    DIALOG_REJECT_TITLE,
} from './join-waiting-page.component.const';
import { DefaultDialogComponent } from '@app/components/default-dialog/default-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GameDispatcherService } from '@app/services/game-dispatcher/game-dispatcher.service';
import { Router, NavigationStart } from '@angular/router';
import { LobbyInfo } from '@app/classes/communication/lobby-info';
@Component({
    selector: 'app-waiting-page',
    templateUrl: './join-waiting-page.component.html',
    styleUrls: ['./join-waiting-page.component.scss'],
})
export class JoinWaitingPageComponent implements OnInit, OnDestroy {
    canceledGameSubscription: Subscription;
    joinerRejectedSubscription: Subscription;
    routingSubscription: Subscription;
    componentDestroyed$: Subject<boolean> = new Subject();
    currentLobby: LobbyInfo;
    currentName: string;

    constructor(public dialog: MatDialog, public gameDispatcherService: GameDispatcherService, public router: Router) {}
    // TODO: Fix if player goes to /game or change attribute when game starts
    @HostListener('window:beforeunload')
    onBeforeUnload() {
        this.gameDispatcherService.handleLeaveLobby();
    }

    ngOnInit() {
        this.currentLobby = this.gameDispatcherService.currentLobby;
        this.currentName = this.gameDispatcherService.currentName;

        this.routingSubscription = this.router.events.pipe(takeUntil(this.componentDestroyed$)).subscribe((event) => {
            if (event instanceof NavigationStart) {
                this.routerChangeMethod(event.url);
            }
        });

        if (!this.canceledGameSubscription) {
            this.canceledGameSubscription = this.gameDispatcherService.canceledGameEvent
                .pipe(takeUntil(this.componentDestroyed$))
                .subscribe((hostName: string) => this.hostHasCanceled(hostName));
        }
        if (!this.joinerRejectedSubscription) {
            this.joinerRejectedSubscription = this.gameDispatcherService.joinerRejectedEvent
                .pipe(takeUntil(this.componentDestroyed$))
                .subscribe((hostName: string) => this.playerRejected(hostName));
        }
    }
    ngOnDestroy() {
        this.componentDestroyed$.next(true);
        this.componentDestroyed$.complete();
    }

    routerChangeMethod(url: string) {
        if (url !== '/game') {
            this.gameDispatcherService.handleLeaveLobby();
        }
    }

    playerRejected(hostName: string) {
        this.dialog.open(DefaultDialogComponent, {
            data: {
                title: DIALOG_REJECT_TITLE,
                content: hostName + DIALOG_REJECT_CONTENT,
                buttons: [
                    {
                        content: DIALOG_BUTTON_CONTENT,
                        redirect: '/lobby',
                        closeDialog: true,
                    },
                ],
            },
        });
    }

    hostHasCanceled(hostName: string) {
        this.dialog.open(DefaultDialogComponent, {
            data: {
                title: DIALOG_CANCEL_TITLE,
                content: hostName + DIALOG_CANCEL_CONTENT,
                buttons: [
                    {
                        content: DIALOG_BUTTON_CONTENT,
                        redirect: '/lobby',
                        closeDialog: true,
                    },
                ],
            },
        });
    }
}
