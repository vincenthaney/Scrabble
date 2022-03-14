/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { INITIAL_MESSAGE } from '@app/constants/controller-constants';
import { MESSAGE_STORAGE_KEY } from '@app/constants/session-storage-constants';
import { MessageStorageService } from './message-storage.service';

const TEST_MESSAGES = [INITIAL_MESSAGE, INITIAL_MESSAGE, INITIAL_MESSAGE];

describe('SessionStorageService', () => {
    let service: MessageStorageService;
    let getSpy: jasmine.Spy;
    let setSpy: jasmine.Spy;
    let clearSpy: jasmine.Spy;
    let store: any = {};

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MessageStorageService);
    });

    beforeEach(() => {
        // Mock sessionStorage
        store = {};
        getSpy = spyOn(window.sessionStorage, 'getItem').and.callFake((key: string): string => {
            return store[key] || null;
        });
        setSpy = spyOn(window.sessionStorage, 'setItem').and.callFake((key: string, value: string): string => {
            return (store[key] = value);
        });
        clearSpy = spyOn(window.sessionStorage, 'clear').and.callFake(() => {
            store = {};
        });
    });

    afterEach(() => {
        store = {};
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('initialize', () => {
        it('should not call setItem if key exists', () => {
            store[MESSAGE_STORAGE_KEY] = [];
            service.initializeMessages();
            expect(setSpy).not.toHaveBeenCalled();
        });

        it('should call setItem if key does not exists', () => {
            service.initializeMessages();
            expect(setSpy).toHaveBeenCalled();
        });
    });

    describe('getMessages', () => {
        it('should call getItem', () => {
            service.getMessages();
            expect(getSpy).toHaveBeenCalled();
        });

        it('should return empty array if getItem returns null', () => {
            getSpy.and.returnValue(null);
            expect(service.getMessages()).toEqual([]);
        });

        it('should return local messages if getItem returns value', () => {
            store[MESSAGE_STORAGE_KEY] = JSON.stringify(TEST_MESSAGES);
            expect(service.getMessages()).toEqual(TEST_MESSAGES);
        });
    });

    describe('saveMessage', () => {
        it('should call getMessages and setItem', () => {
            const spy = spyOn(service, 'getMessages').and.returnValue(TEST_MESSAGES);
            service.saveMessage(INITIAL_MESSAGE);
            expect(spy).toHaveBeenCalled();
            expect(setSpy).toHaveBeenCalled();
        });

        it('should add new message to storage', () => {
            store[MESSAGE_STORAGE_KEY] = JSON.stringify(TEST_MESSAGES);
            spyOn(service, 'getMessages').and.returnValue(TEST_MESSAGES);
            const lengthBefore = TEST_MESSAGES.length;

            service.saveMessage(INITIAL_MESSAGE);
            const lengthAfter = JSON.parse(store[MESSAGE_STORAGE_KEY]).length;
            expect(lengthAfter).toEqual(lengthBefore + 1);
        });
    });

    describe('resetMessages', () => {
        it('should call clear', () => {
            service.resetMessages();
            expect(clearSpy).toHaveBeenCalled();
        });
    });
});
