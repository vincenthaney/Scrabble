import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NavigationStart, Router } from '@angular/router';
import { LobbyInfo } from '@app/classes/communication/';
import { DefaultDialogComponent } from '@app/components/default-dialog/default-dialog.component';
import { GameDispatcherService } from '@app/services/';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { joinWaitingPageConstants } from '@app/constants/pages-constants';
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
        if (this.gameDispatcherService.currentLobby) this.currentLobby = this.gameDispatcherService.currentLobby;
        this.currentName = this.gameDispatcherService.currentName;

        this.routingSubscription = this.router.events.pipe(takeUntil(this.componentDestroyed$)).subscribe((event) => {
            if (event instanceof NavigationStart) {
                this.routerChangeMethod(event.url);
            }
        });

        this.canceledGameSubscription = this.gameDispatcherService.canceledGameEvent
            .pipe(takeUntil(this.componentDestroyed$))
            .subscribe((hostName: string) => this.hostHasCanceled(hostName));
        this.joinerRejectedSubscription = this.gameDispatcherService.joinerRejectedEvent
            .pipe(takeUntil(this.componentDestroyed$))
            .subscribe((hostName: string) => this.playerRejected(hostName));
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
                title: joinWaitingPageConstants.DIALOG_REJECT_TITLE,
                content: hostName + joinWaitingPageConstants.DIALOG_REJECT_CONTENT,
                buttons: [
                    {
                        content: joinWaitingPageConstants.DIALOG_BUTTON_CONTENT,
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
                title: joinWaitingPageConstants.DIALOG_CANCEL_TITLE,
                content: hostName + joinWaitingPageConstants.DIALOG_CANCEL_CONTENT,
                buttons: [
                    {
                        content: joinWaitingPageConstants.DIALOG_BUTTON_CONTENT,
                        redirect: '/lobby',
                        closeDialog: true,
                    },
                ],
            },
        });
    }
}
