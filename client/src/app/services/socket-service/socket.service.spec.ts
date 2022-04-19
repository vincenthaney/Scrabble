/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable dot-notation */
import { TestBed } from '@angular/core/testing';
import { ConnectionState } from '@app/classes/connection-state-service/connection-state-service';
import { SocketTestHelper } from '@app/classes/socket-test-helper/socket-test-helper.spec';
import { SOCKET_ID_UNDEFINED } from '@app/constants/services-errors';
import { SocketService } from '@app/services/';

describe('SocketService', () => {
    let service: SocketService;
    let socket: SocketTestHelper;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SocketService);

        socket = new SocketTestHelper();

        spyOn<any>(service, 'getSocket').and.returnValue(socket);
        service['socket'] = service['getSocket']();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('initializeService', () => {
        let nextStateSpy: jasmine.Spy;

        beforeEach(() => {
            nextStateSpy = spyOn<any>(service, 'nextState');
        });

        it('should call nextState with connected on connect', (done) => {
            service.initializeService();

            socket.on('connect', () => {
                expect(nextStateSpy).toHaveBeenCalledOnceWith(ConnectionState.Connected);
                done();
            });

            socket.peerSideEmit('connect');
        });

        it('should call nextState with Error on connect_error', (done) => {
            service.initializeService();

            socket.on('connect_error', () => {
                expect(nextStateSpy).toHaveBeenCalledOnceWith(ConnectionState.Error);
                done();
            });

            socket.peerSideEmit('connect_error');
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
