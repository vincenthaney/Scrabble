import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ConnectionState } from './connection-state';

export default abstract class ConnectionStateService {
    private state$: BehaviorSubject<ConnectionState> = new BehaviorSubject<ConnectionState>(ConnectionState.Loading);

    subscribe(destroy$: Observable<boolean>, next: (state: ConnectionState) => void): Subscription {
        return this.state$.pipe(takeUntil(destroy$)).subscribe(next);
    }

    getState(): ConnectionState {
        return this.state$.value;
    }

    protected nextState(state: ConnectionState) {
        this.state$.next(state);
    }
}
