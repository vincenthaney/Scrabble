/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable dot-notation */
import { TestBed } from '@angular/core/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper/socket-test-helper.spec';
import { SOCKET_ID_UNDEFINED } from '@app/constants/services-errors';
import { SocketService } from '@app/services/';
import { Socket } from 'socket.io-client';
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

    it('should call connect on initializeService', () => {
        const spy = spyOn<any>(service, 'connect');
        service.initializeService();
        expect(spy).toHaveBeenCalled();
    });

    it('should throw on initializeService error', async () => {
        const error = 'error';
        spyOn<any>(service, 'connect').and.throwError(error);
        await expectAsync(service.initializeService()).toBeRejectedWithError(error);
    });

    describe('connect', () => {
        it('should set socket on connect', () => {
            (service['socket'] as unknown) = undefined;
            service['connect']();
            expect(service['socket']).toBeTruthy();
        });
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
});
