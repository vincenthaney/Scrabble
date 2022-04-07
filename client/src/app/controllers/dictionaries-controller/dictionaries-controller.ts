import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { DictionarySummary } from '@app/classes/communication/dictionary';
import { BasicDictionaryData, DictionaryData, DictionaryUpdateInfo } from '@app/classes/dictionary/dictionary-data';
import { PositiveFeedback } from '@app/constants/dictionaries-components';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class DictionariesController implements OnDestroy {
    private dictionariesUpdateMessageEvent: Subject<string> = new Subject();
    private dictionariesErrorEvent: Subject<HttpErrorResponse> = new Subject();
    private dictionariesDownloadEvent: Subject<BasicDictionaryData> = new Subject();
    private getAllDictionariesEvent: Subject<DictionarySummary[]> = new Subject();

    private serviceDestroyed$: Subject<boolean> = new Subject();

    constructor(private http: HttpClient) {}

    ngOnDestroy(): void {
        this.serviceDestroyed$.next(true);
        this.serviceDestroyed$.complete();
    }

    async handleUpdateDictionary(dictionaryUpdateInfo: DictionaryUpdateInfo): Promise<void> {
        const endpoint = `${environment.serverUrl}/dictionaries`;
        this.http.patch(endpoint, { dictionaryUpdateInfo }).subscribe(
            () => {
                this.dictionariesUpdateMessageEvent.next(PositiveFeedback.DictionaryUpdated);
            },
            (error) => {
                this.dictionariesErrorEvent.next(error.error.message);
            },
        );
    }

    async handleDownloadDictionary(dictionaryId: string): Promise<void> {
        const endpoint = `${environment.serverUrl}/dictionaries/${dictionaryId}`;
        this.http.get<BasicDictionaryData>(endpoint, { observe: 'body' }).subscribe(
            (dictionary) => {
                this.dictionariesDownloadEvent.next(dictionary);
            },
            (error) => {
                this.dictionariesErrorEvent.next(error.error.message);
            },
        );
    }

    async handleDeleteDictionary(dictionaryId: string): Promise<void> {
        let params = new HttpParams();
        params = params.append('dictionaryId', dictionaryId);
        const endpoint = `${environment.serverUrl}/dictionaries`;
        this.http.delete(endpoint, { params }).subscribe(
            () => {
                this.dictionariesUpdateMessageEvent.next(PositiveFeedback.DictionaryDeleted);
            },
            (error) => {
                this.dictionariesErrorEvent.next(error.error.message);
            },
        );
    }

    async handleUploadDictionary(dictionaryData: DictionaryData): Promise<void> {
        const endpoint = `${environment.serverUrl}/dictionaries`;

        this.http.post<string>(endpoint, { dictionaryData }).subscribe(
            () => {
                this.dictionariesUpdateMessageEvent.next(PositiveFeedback.DictionaryAdded);
            },
            (error) => {
                this.dictionariesErrorEvent.next(error.message);
            },
        );
    }

    async handleGetAllDictionariesEvent(): Promise<void> {
        const endpoint = `${environment.serverUrl}/dictionaries/summary`;
        this.http.get<DictionarySummary[]>(endpoint, { observe: 'body' }).subscribe(
            (body) => {
                this.getAllDictionariesEvent.next(body);
            },
            (error) => {
                this.dictionariesErrorEvent.next(error.error.message);
            },
        );
    }

    async handleDeleteAllDictionaries(): Promise<void> {
        const endpoint = `${environment.serverUrl}/dictionaries/reset`;
        this.http.delete<string>(endpoint, {}).subscribe(
            () => {
                this.dictionariesUpdateMessageEvent.next(PositiveFeedback.DictionariesDeleted);
            },
            (error) => {
                this.dictionariesErrorEvent.next(error.error.message);
            },
        );
    }

    subscribeToDictionariesUpdateMessageEvent(serviceDestroyed$: Subject<boolean>, callback: (response: string) => void): void {
        this.dictionariesUpdateMessageEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }

    subscribeToDictionaryDownloadEvent(serviceDestroyed$: Subject<boolean>, callback: (dictionaryData: BasicDictionaryData) => void): void {
        this.dictionariesDownloadEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }

    subscribeToDictionaryErrorEvent(serviceDestroyed$: Subject<boolean>, callback: (response: HttpErrorResponse) => void): void {
        this.dictionariesErrorEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }

    subscribeToGetAllDictionariesEvent(serviceDestroyed$: Subject<boolean>, callback: (dictionaries: DictionarySummary[]) => void): void {
        this.getAllDictionariesEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }
}
