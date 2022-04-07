/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { HttpParams } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DictionaryData, DictionaryUpdateInfo } from '@app/classes/dictionary/dictionary-data';
import { GameService } from '@app/services';
import { of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { DictionariesController } from './dictionaries-controller';
const TEST_DICTIONARY_UPDATE_INFO = {} as DictionaryUpdateInfo;
const TEST_DICTIONARY_ID = 'testID';
const TEST_DICTIONARY_DATA = {} as DictionaryData;

describe('DictionariesController', () => {
    let controller: DictionariesController;
    let httpMock: HttpTestingController;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule],
            providers: [DictionariesController, GameService],
        });
        controller = TestBed.inject(DictionariesController);
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
        it('handleUpdateDictionary should  make an HTTP patch request', async () => {
            const httpPatchSpy = spyOn(controller['http'], 'patch').and.returnValue(of(true) as any);
            controller.handleUpdateDictionary(TEST_DICTIONARY_UPDATE_INFO);
            expect(httpPatchSpy).toHaveBeenCalled();
        });
    });

    describe('handleDownloadDictionary', () => {
        it('handleDownloadDictionary should  make an HTTP get request', async () => {
            const httpGetSpy = spyOn(controller['http'], 'get').and.returnValue(of(true) as any);
            controller.handleDownloadDictionary(TEST_DICTIONARY_ID);
            expect(httpGetSpy).toHaveBeenCalled();
        });
    });

    describe('handleDeleteDictionary', () => {
        it('handleDeleteDictionary should  make an HTTP delete request', async () => {
            spyOn(HttpParams.prototype, 'append').and.returnValue({} as HttpParams);
            const httpDeleteSpy = spyOn(controller['http'], 'delete').and.returnValue(of(true) as any);
            await controller.handleDeleteDictionary(TEST_DICTIONARY_ID);
            expect(httpDeleteSpy).toHaveBeenCalled();
        });

        it('handleDeleteDictionary should  call HTTPParams.append', async () => {
            spyOn(controller['http'], 'delete').and.returnValue(of(true) as any);
            const httpAppendSpy = spyOn(HttpParams.prototype, 'append').and.returnValue({} as HttpParams);
            controller.handleDeleteDictionary(TEST_DICTIONARY_ID);
            expect(httpAppendSpy).toHaveBeenCalled();
        });
    });

    describe('handleUploadDictionary', () => {
        it('handleUploadDictionary should  make an HTTP post request', async () => {
            const httpPostSpy = spyOn(controller['http'], 'post').and.returnValue(of(true) as any);
            controller.handleUploadDictionary(TEST_DICTIONARY_DATA);
            expect(httpPostSpy).toHaveBeenCalled();
        });
    });

    describe('handleGetAllDictionariesEvent', () => {
        it('handleGetAllDictionariesEvent should  make an HTTP get request', async () => {
            const httpGetSpy = spyOn(controller['http'], 'get').and.returnValue(of(true) as any);
            controller.handleGetAllDictionariesEvent();
            expect(httpGetSpy).toHaveBeenCalled();
        });
    });

    describe('handleDeleteAllDictionaries', () => {
        it('handleDeleteAllDictionaries should  make an HTTP delete request', async () => {
            const httpDeleteSpy = spyOn(controller['http'], 'delete').and.returnValue(of(true) as any);
            controller.handleDeleteAllDictionaries();
            expect(httpDeleteSpy).toHaveBeenCalled();
        });

        it('handleDeleteAllDictionaries should call dictionariesErrorEvent when receiving an error response ', async () => {
            const endpoint = `${environment.serverUrl}/dictionaries/reset`;
            const expected = {
                code: 'validationFailed',
                message: 'Invalid input',
            };
            httpMock.expectOne(endpoint).flush(expected, { status: 400, statusText: 'Bad Request' });
            const spyErrorEvent = spyOn(controller['dictionariesErrorEvent'], 'next').and.callFake(() => {
                return;
            });
            controller.handleDeleteAllDictionaries();
            expect(spyErrorEvent).toHaveBeenCalled();
        });
    });
});
