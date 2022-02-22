import { Injectable } from '@angular/core';
import { ActionPlacePayload } from '@app/classes/actions/action-data';
import { Message } from '@app/classes/communication/message';
import { INITIAL_MESSAGE } from '@app/constants/controller-constants';
import * as SERVICE_ERRORS from '@app/constants/services-errors';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UpdateTileReserveEventArgs } from './event-arguments';
import { EventArgs } from './event-types';
@Injectable({
    providedIn: 'root',
})
export class GameViewEventManagerService {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private eventMap: Map<keyof EventArgs, Subject<any>> = new Map();

    private updateTileRack$: Subject<void> = new Subject();
    private playingTiles$: Subject<ActionPlacePayload> = new Subject();
    private noActiveGame$: Subject<void> = new Subject();
    private reRender$: Subject<void> = new Subject();
    private updateTileReserve$: Subject<UpdateTileReserveEventArgs> = new Subject();

    private newMessage$: BehaviorSubject<Message> = new BehaviorSubject(INITIAL_MESSAGE);

    constructor() {
        this.eventMap.set('tileRackUpdate', new Subject<void>());
        this.eventMap.set('tilesPlayed', new Subject<ActionPlacePayload>());
        this.eventMap.set('noActiveGame', new Subject<void>());
        this.eventMap.set('reRender', new Subject<void>());
        this.eventMap.set('tileReserveUpdate', new Subject<UpdateTileReserveEventArgs>());
        this.eventMap.set('newMessage', new BehaviorSubject<Message>(INITIAL_MESSAGE));
    }

    emitGameViewEvent<T extends keyof EventArgs, S extends EventArgs[T]>(eventType: T, payload?: S) {
        const subject: Subject<S> = this.getSubjectFromMap(eventType);

        if (payload) {
            subject.next(payload);
        } else {
            subject.next();
        }
    }

    subscribeToGameViewEvent<T extends keyof EventArgs, S extends EventArgs[T]>(
        eventType: T,
        destroy$: Observable<boolean>,
        next: (payload: S) => void,
    ): Subscription {
        const subject: Subject<S> = this.getSubjectFromMap(eventType);
        return subject.pipe(takeUntil(destroy$)).subscribe(next);
    }

    emitTileRackUpdate(): void {
        this.emitGameViewEvent('tileRackUpdate');
        this.updateTileRack$.next();
    }
    subscribeToUpdateTileRackEvent(destroy$: Observable<boolean>, next: () => void): Subscription {
        return this.updateTileRack$.pipe(takeUntil(destroy$)).subscribe(next);
    }

    emitTilesPlayed(payload: ActionPlacePayload): void {
        this.playingTiles$.next(payload);
    }
    subscribeToPlayingTiles(destroy$: Observable<boolean>, next: (payload: ActionPlacePayload) => void): Subscription {
        return this.playingTiles$.pipe(takeUntil(destroy$)).subscribe(next);
    }

    emitNoActiveGameEvent(): void {
        this.noActiveGame$.next();
    }
    subscribeToNoActiveGameEvent(destroy$: Observable<boolean>, next: () => void): Subscription {
        return this.noActiveGame$.pipe(takeUntil(destroy$)).subscribe(next);
    }

    emitReRender(): void {
        this.reRender$.next();
    }
    subscribeToReRender(destroy$: Observable<boolean>, next: () => void): Subscription {
        return this.reRender$.pipe(takeUntil(destroy$)).subscribe(next);
    }

    emitTileReserveUpdate(payload: UpdateTileReserveEventArgs): void {
        this.updateTileReserve$.next(payload);
    }
    subscribeToTileReserveUpdate(destroy$: Observable<boolean>, next: (payload: UpdateTileReserveEventArgs) => void): Subscription {
        return this.updateTileReserve$.pipe(takeUntil(destroy$)).subscribe(next);
    }

    emitNewMessage(newMessage: Message): void {
        this.newMessage$.next(newMessage);
    }
    subscribeToMessages(destroy$: Observable<boolean>, next: (newMessage: Message) => void): Subscription {
        return this.newMessage$.pipe(takeUntil(destroy$)).subscribe(next);
    }

    private getSubjectFromMap<T extends keyof EventArgs, S extends EventArgs[T]>(eventType: T): Subject<S> {
        if (!this.eventMap.get(eventType)) {
            throw new Error(SERVICE_ERRORS.NO_SUBJECT_FOR_EVENT);
        }
        return this.eventMap.get(eventType) as Subject<S>;
    }
}
