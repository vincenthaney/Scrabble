/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { HttpParams } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DictionaryData, DictionaryUpdateInfo } from '@app/classes/dictionary/dictionary-data';
import { GameService } from '@app/services';
import { of, throwError } from 'rxjs';
import { DictionaryController } from './dictionary-controller';
const TEST_DICTIONARY_UPDATE_INFO = {} as DictionaryUpdateInfo;
const TEST_DICTIONARY_ID = 'testID';
const TEST_DICTIONARY_DATA = {} as DictionaryData;

describe('DictionariesController', () => {
    let controller: DictionaryController;
    let httpMock: HttpTestingController;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule],
            providers: [DictionaryController, GameService],
        });
        controller = TestBed.inject(DictionaryController);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should create', () => {
        expect(controller).toBeTruthy();
    });

    describe('ngOnDestroy', () => {
        it('should call next', () => {
            const spy = spyOn(controller['serviceDestroyed$'], 'next');
            spyOn(controller['serviceDestroyed$'], 'complete');
            controller.ngOnDestroy();
            expect(spy).toHaveBeenCalled();
        });

        it('should call complete', () => {
            spyOn(controller['serviceDestroyed$'], 'next');
            const spy = spyOn(controller['serviceDestroyed$'], 'complete');
            controller.ngOnDestroy();
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('handleUpdateDictionary', () => {
        it('should  make an HTTP patch request', async () => {
            const httpPatchSpy = spyOn(controller['http'], 'patch').and.returnValue(of(true) as any);
            await controller.handleUpdateDictionary(TEST_DICTIONARY_UPDATE_INFO);
            expect(httpPatchSpy).toHaveBeenCalled();
        });

        it('should call dictionaryErrorEvent.next on an error', async () => {
            spyOn(controller['http'], 'patch').and.callFake(() => {
                return throwError({ error: { message: 'errormessage' } });
            });
            const dictionaryErrorEventSpy = spyOn(controller['dictionaryErrorEvent'], 'next');
            await controller.handleUpdateDictionary(TEST_DICTIONARY_UPDATE_INFO);
            expect(dictionaryErrorEventSpy).toHaveBeenCalled();
        });
    });

    describe('handleDownloadDictionary', () => {
        it('should  make an HTTP get request', async () => {
            const httpGetSpy = spyOn(controller['http'], 'get').and.returnValue(of(true) as any);
            await controller.handleDownloadDictionary(TEST_DICTIONARY_ID);
            expect(httpGetSpy).toHaveBeenCalled();
        });

        it('should call dictionaryErrorEvent.next on an error', async () => {
            spyOn(controller['http'], 'get').and.callFake(() => {
                return throwError({ error: { message: 'errormessage' } });
            });
            const dictionaryErrorEventSpy = spyOn(controller['dictionaryErrorEvent'], 'next');
            await controller.handleDownloadDictionary(TEST_DICTIONARY_ID);
            expect(dictionaryErrorEventSpy).toHaveBeenCalled();
        });
    });

    describe('handleDeleteDictionary', () => {
        it('should  make an HTTP delete request', async () => {
            spyOn(HttpParams.prototype, 'append').and.returnValue({} as HttpParams);
            const httpDeleteSpy = spyOn(controller['http'], 'delete').and.returnValue(of(true) as any);
            await controller.handleDeleteDictionary(TEST_DICTIONARY_ID);
            expect(httpDeleteSpy).toHaveBeenCalled();
        });

        it('should  call HTTPParams.append', async () => {
            spyOn(controller['http'], 'delete').and.returnValue(of(true) as any);
            const httpAppendSpy = spyOn(HttpParams.prototype, 'append').and.returnValue({} as HttpParams);
            await controller.handleDeleteDictionary(TEST_DICTIONARY_ID);
            expect(httpAppendSpy).toHaveBeenCalled();
        });

        it('should call dictionaryErrorEvent.next on an error', async () => {
            spyOn(controller['http'], 'delete').and.callFake(() => {
                return throwError({ error: { message: 'errormessage' } });
            });
            const dictionaryErrorEventSpy = spyOn(controller['dictionaryErrorEvent'], 'next');
            await controller.handleDeleteDictionary(TEST_DICTIONARY_ID);
            expect(dictionaryErrorEventSpy).toHaveBeenCalled();
        });
    });

    describe('handleUploadDictionary', () => {
        it('handleUploadDictionary should  make an HTTP post request', async () => {
            const httpPostSpy = spyOn(controller['http'], 'post').and.returnValue(of(true) as any);
            await controller.handleUploadDictionary(TEST_DICTIONARY_DATA);
            expect(httpPostSpy).toHaveBeenCalled();
        });

        it('should call dictionaryErrorEvent.next on an error', async () => {
            spyOn(controller['http'], 'post').and.callFake(() => {
                return throwError({ error: { message: 'errormessage' } });
            });
            const dictionaryErrorEventSpy = spyOn(controller['dictionaryErrorEvent'], 'next');
            await controller.handleUploadDictionary(TEST_DICTIONARY_DATA);
            expect(dictionaryErrorEventSpy).toHaveBeenCalled();
        });
    });

    describe('handleGetAllDictionariesEvent', () => {
        it('handleGetAllDictionariesEvent should  make an HTTP get request', async () => {
            const httpGetSpy = spyOn(controller['http'], 'get').and.returnValue(of(true) as any);
            await controller.handleGetAllDictionariesEvent();
            expect(httpGetSpy).toHaveBeenCalled();
        });

        it('should call dictionaryErrorEvent.next on an error', async () => {
            spyOn(controller['http'], 'get').and.callFake(() => {
                return throwError({ error: { message: 'errormessage' } });
            });
            const dictionaryErrorEventSpy = spyOn(controller['dictionaryErrorEvent'], 'next');
            await controller.handleGetAllDictionariesEvent();
            expect(dictionaryErrorEventSpy).toHaveBeenCalled();
        });
    });

    describe('handleResetDictionaries', () => {
        it('handleResetDictionaries should  make an HTTP delete request', async () => {
            const httpDeleteSpy = spyOn(controller['http'], 'delete').and.returnValue(of(true) as any);
            await controller.handleResetDictionaries();
            expect(httpDeleteSpy).toHaveBeenCalled();
        });

        it('should call dictionaryErrorEvent.next on an error', async () => {
            spyOn(controller['http'], 'delete').and.callFake(() => {
                return throwError({ error: { message: 'errormessage' } });
            });
            const dictionaryErrorEventSpy = spyOn(controller['dictionaryErrorEvent'], 'next').and.callFake(() => {});
            await controller.handleResetDictionaries();
            expect(dictionaryErrorEventSpy).toHaveBeenCalled();
        });
    });
});
