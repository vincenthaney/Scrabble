/* eslint-disable dot-notation */
import { Observable } from 'rxjs';
import { ConnectionState } from './connection-state';
import ConnectionStateService from './connection-state-service';

class TestClass extends ConnectionStateService {}

describe('ConnectionStateService', () => {
    let connectionStateService: ConnectionStateService;
    let destroy$: Observable<boolean>;

    beforeEach(() => {
        connectionStateService = new TestClass();
        destroy$ = new Observable();
    });

    describe('subscribe', () => {
        it('should call subscribe on state$', () => {
            const spy = spyOn(connectionStateService['state$'], 'subscribe');
            connectionStateService.subscribe(destroy$, () => undefined);
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('getState', () => {
        it('should return state value', () => {
            expect(connectionStateService.getState()).toEqual(connectionStateService['state$'].value);
        });
    });

    describe('nextState', () => {
        it('should call next', () => {
            const spy = spyOn(connectionStateService['state$'], 'next');
            connectionStateService['nextState'](ConnectionState.Loading);
            expect(spy).toHaveBeenCalled();
        });
    });
});
