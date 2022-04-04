import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { DictionarySummary } from '@app/classes/communication/dictionary';
import { BasicDictionaryData, DictionaryData, DictionaryUpdateInfo } from '@app/classes/dictionary/dictionary-data';
import { DICTIONARIES_DELETED, DICTIONARY_ADDED, DICTIONARY_DELETED, DICTIONARY_UPDATED } from '@app/constants/dictionary-service-constants';
import SocketService from '@app/services/socket-service/socket.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class DictionariesController implements OnDestroy {
    private dictionaryUpdateEvent: Subject<string> = new Subject();
    private dictionaryErrorEvent: Subject<string> = new Subject();
    private dictionaryDownloadEvent: Subject<BasicDictionaryData> = new Subject();
    private getAllDictionariesEvent: Subject<DictionarySummary[]> = new Subject();

    private serviceDestroyed$: Subject<boolean> = new Subject();

    constructor(private http: HttpClient, public socketService: SocketService) {
        this.configureSocket();
    }

    ngOnDestroy(): void {
        this.serviceDestroyed$.next(true);
        this.serviceDestroyed$.complete();
    }

    async handleUpdateDictionary(dictionaryUpdateInfo: DictionaryUpdateInfo): Promise<void> {
        const endpoint = `${environment.serverUrl}/dictionaries`;
        this.http.patch<string>(endpoint, { dictionaryUpdateInfo }).subscribe(
            () => {
                this.dictionaryUpdateEvent.next(DICTIONARY_UPDATED);
            },
            (error) => {
                this.dictionaryErrorEvent.next(error.message);
            },
        );
    }

    async handleDownloadDictionary(dictionaryId: string): Promise<void> {
        const endpoint = `${environment.serverUrl}/dictionaries/${dictionaryId}`;
        this.http.get<BasicDictionaryData>(endpoint, { observe: 'body' }).subscribe(
            (dictionary) => {
                this.dictionaryDownloadEvent.next(dictionary);
            },
            (error) => {
                this.dictionaryErrorEvent.next(error.message);
            },
        );
    }

    async handleDeleteDictionary(dictionaryId: string): Promise<void> {
        const endpoint = `${environment.serverUrl}/dictionaries`;
        this.http.delete<string>(endpoint, { body: dictionaryId }).subscribe(
            () => {
                this.dictionaryUpdateEvent.next(DICTIONARY_DELETED);
            },
            (error) => {
                this.dictionaryErrorEvent.next(error.message);
            },
        );
    }

    async handleUploadDictionary(dictionaryData: DictionaryData): Promise<void> {
        const endpoint = `${environment.serverUrl}/dictionaries`;
        this.http.post<string>(endpoint, { dictionaryData }).subscribe(
            () => {
                this.dictionaryUpdateEvent.next(DICTIONARY_ADDED);
            },
            (error) => {
                this.dictionaryErrorEvent.next(error.message);
            },
        );
    }

    async handleGetAllDictionariesEvent(): Promise<void> {
        const endpoint = `${environment.serverUrl}/dictionaries`;
        this.http.get<{ dictionaries: DictionarySummary[] }>(endpoint, { observe: 'body' }).subscribe(
            (body) => {
                this.getAllDictionariesEvent.next(body.dictionaries);
            },
            (error) => {
                this.dictionaryErrorEvent.next(error.message);
            },
        );
    }

    async handleDeleteAllDictionaries(): Promise<void> {
        const endpoint = `${environment.serverUrl}/dictionaries`;
        this.http.delete<string>(endpoint, {}).subscribe(
            () => {
                this.dictionaryUpdateEvent.next(DICTIONARIES_DELETED);
            },
            (error) => {
                this.dictionaryErrorEvent.next(error.message);
            },
        );
    }

    subscribeToDictionaryUpdateEvent(serviceDestroyed$: Subject<boolean>, callback: (response: string) => void): void {
        this.dictionaryUpdateEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }

    subscribeToDictionaryDownloadEvent(serviceDestroyed$: Subject<boolean>, callback: (dictionaryData: BasicDictionaryData) => void): void {
        this.dictionaryDownloadEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }

    subscribeToDictionaryErrorEvent(serviceDestroyed$: Subject<boolean>, callback: (response: string) => void): void {
        this.dictionaryErrorEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }

    // subscribeToDictionaryUploadEvent(serviceDestroyed$: Subject<boolean>, callback: (response: string) => void): void {
    //     this.dictionaryUploadEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    // }

    subscribeToGetAllDictionariesEvent(serviceDestroyed$: Subject<boolean>, callback: (dictionaries: DictionarySummary[]) => void): void {
        this.getAllDictionariesEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }

    private configureSocket(): void {
        this.socketService.on('dictionaryUpdate', (response: string) => {
            this.dictionaryUpdateEvent.next(response);
        });
        this.socketService.on('dictionaryDownload', (dictionaryData: DictionaryData) => {
            this.dictionaryDownloadEvent.next(dictionaryData);
        });
        // this.socketService.on('dictionaryDelete', (response: string) => {
        //     this.dictionaryDeleteEvent.next(response);
        // });
        // this.socketService.on('dictionaryUpload', (response: string) => {
        //     this.dictionaryUploadEvent.next(response);
        // });
    }
}
