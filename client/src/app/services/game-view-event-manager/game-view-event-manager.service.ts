import { Injectable } from '@angular/core';
import { ActionPlacePayload } from '@app/classes/actions/action-data';
import { Message } from '@app/classes/communication/message';
import { INITIAL_MESSAGE } from '@app/constants/controller-constants';
import * as SERVICE_ERRORS from '@app/constants/services-errors';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UpdateTileReserveEventArgs } from './event-arguments';
import { EventTypes } from './event-types';
@Injectable({
    providedIn: 'root',
})
export class GameViewEventManagerService {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private eventMap: Map<keyof EventTypes, Subject<any>> = new Map();

    constructor() {
        this.eventMap.set('tileRackUpdate', new Subject<void>());
        this.eventMap.set('tilesPlayed', new Subject<ActionPlacePayload>());
        this.eventMap.set('noActiveGame', new Subject<void>());
        this.eventMap.set('reRender', new Subject<void>());
        this.eventMap.set('tileReserveUpdate', new Subject<UpdateTileReserveEventArgs>());
        this.eventMap.set('newMessage', new BehaviorSubject<Message>(INITIAL_MESSAGE));
    }

    emitGameViewEvent<T extends keyof EventTypes, S extends EventTypes[T]>(eventType: T, payload?: S) {
        const subject: Subject<S> = this.getSubjectFromMap(eventType);

        if (payload) {
            subject.next(payload);
        } else {
            subject.next();
        }
    }

    subscribeToGameViewEvent<T extends keyof EventTypes, S extends EventTypes[T]>(
        eventType: T,
        destroy$: Observable<boolean>,
        next: (payload: S) => void,
    ): Subscription {
        const subject: Subject<S> = this.getSubjectFromMap(eventType);
        return subject.pipe(takeUntil(destroy$)).subscribe(next);
    }

    private getSubjectFromMap<T extends keyof EventTypes, S extends EventTypes[T]>(eventType: T): Subject<S> {
        if (!this.eventMap.get(eventType)) {
            throw new Error(SERVICE_ERRORS.NO_SUBJECT_FOR_EVENT);
        }
        return this.eventMap.get(eventType) as Subject<S>;
    }
}
