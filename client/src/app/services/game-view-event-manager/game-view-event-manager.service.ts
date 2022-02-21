import { Injectable } from '@angular/core';
import { ActionPlacePayload } from '@app/classes/actions/action-data';
import { Observable, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UpdateTileReserveEventArgs } from './event-arguments';

@Injectable({
    providedIn: 'root',
})
export class GameViewEventManagerService {
    private updateTileRack$: Subject<void> = new Subject();
    private playingTiles$: Subject<ActionPlacePayload> = new Subject();
    private noActiveGame$: Subject<void> = new Subject();
    private reRender$: Subject<void> = new Subject();
    private updateTileReserve$: Subject<UpdateTileReserveEventArgs> = new Subject();

    emitTileRackUpdate(): void {
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
}
