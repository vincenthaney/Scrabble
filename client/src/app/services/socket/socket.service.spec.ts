/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable dot-notation */
import { TestBed } from '@angular/core/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper/socket-test-helper.spec';
import { SocketService } from '@app/services/';
import { Socket } from 'socket.io-client';
import { SOCKET_ID_UNDEFINED } from '@app/constants/services-errors';

describe('SocketService', () => {
    let service: SocketService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SocketService);
        service['socket'] = new SocketTestHelper() as unknown as Socket;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should disconnect', () => {
        const spy = spyOn(service['socket'], 'disconnect');
        service.disconnect();
        expect(spy).toHaveBeenCalled();
    });

    it('should check if socket is defined on disconnect', () => {
        (service['socket'] as unknown) = undefined;
        const result = service.disconnect();
        expect(result).toBeFalse();
    });

    it('should call connect on initializeService', () => {
        const spy = spyOn(service, 'connect');
        service.initializeService();
        expect(spy).toHaveBeenCalled();
    });

    it('should throw on initializeService error', async () => {
        const error = 'error';
        spyOn(service, 'connect').and.throwError(error);
        await expectAsync(service.initializeService()).toBeRejectedWithError(error);
    });

    describe('connect', () => {
        it('should set socket on connect', () => {
            (service['socket'] as unknown) = undefined;
            service.connect();
            expect(service['socket']).toBeTruthy();
        });
    });

    it('isSocketAlive should return true if the socket is still connected', () => {
        service['socket'].connected = true;
        const isAlive = service.isSocketAlive();
        expect(isAlive).toBeTruthy();
    });

    it('isSocketAlive should return false if the socket is no longer connected', () => {
        service['socket'].connected = false;
        const isAlive = service.isSocketAlive();
        expect(isAlive).toBeFalsy();
    });

    it('isSocketAlive should return false if the socket is not defined', () => {
        (service['socket'] as unknown) = undefined;
        const isAlive = service.isSocketAlive();
        expect(isAlive).toBeFalsy();
    });

    it('should call socket.on with an event', () => {
        const event = 'helloWorld';
        const action = () => {};
        const spy = spyOn(service['socket'], 'on');
        service.on(event, action);
        expect(spy).toHaveBeenCalledWith(event, action);
    });

    it('should call emit with data when using send', () => {
        const event = 'helloWorld';
        const data = 42;
        const spy = spyOn(service['socket'], 'emit');
        service.emit(event, data);
        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith(event, [data]);
    });

    it('should call emit without data when using send if data is undefined', () => {
        const event = 'helloWorld';
        const data = undefined;
        const spy = spyOn(service['socket'], 'emit');
        service.emit(event, data);
        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith(event, [data]);
    });

    it('should check is socket is undefined on emit', () => {
        (service['socket'] as unknown) = undefined;
        const result = service.emit('');
        expect(result).toBeFalse();
    });

    it('should throw when socket is undefined on getId', () => {
        (service['socket'] as unknown) = undefined;
        expect(() => service.getId()).toThrowError(SOCKET_ID_UNDEFINED);
    });

    // describe('waitForConnection', () => {
    //     const DELAY = 10;
    //     const TIMEOUT = 1000;
    //     const BEFORE_RESOLVE = 40;

    //     it('should resolve when predicate is true', async () => {
    //         const predicate = () => true;
    //         await expectAsync(service.waitForConnection(predicate, DELAY, TIMEOUT)).toBeResolved();
    //     });

    //     it('should resolve when predicate will be true', async () => {
    //         let predicateValue = false;
    //         const predicate = () => predicateValue;
    //         const wait = service.waitForConnection(predicate, DELAY, TIMEOUT);

    //         setTimeout(() => {
    //             predicateValue = true;
    //         }, BEFORE_RESOLVE);

    //         await expectAsync(wait).toBeResolved();
    //     });

    //     it('should reject when timeout is reached', async () => {
    //         const predicate = () => false;
    //         await expectAsync(service.waitForConnection(predicate, DELAY, TIMEOUT)).toBeRejectedWith(SOCKET_ERROR.TIMEOUT_REACHED);
    //     });
    // });
});
