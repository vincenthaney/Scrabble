import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { DictionarySummary } from '@app/classes/communication/dictionary';
import SocketService from '@app/services/socket-service/socket.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class DictionariesController implements OnDestroy {
    private dictionaryUpdateEvent: Subject<DictionarySummary> = new Subject();
    private dictionaryDownloadEvent: Subject<DictionarySummary> = new Subject();
    private dictionaryDeleteEvent: Subject<string> = new Subject();
    private dictionaryUploadEvent: Subject<string> = new Subject();

    private serviceDestroyed$: Subject<boolean> = new Subject();

    constructor(private http: HttpClient, public socketService: SocketService) {
        this.configureSocket();
    }

    ngOnDestroy(): void {
        this.serviceDestroyed$.next(true);
        this.serviceDestroyed$.complete();
    }

    // change back dictionary when resposne is received to avoid updating a value that shouldn't have been updated
    handleUpdateDictionary(newDictionarySummary: DictionarySummary): void {
        const endpoint = `${environment.serverUrl}/dictionaries/${this.socketService.getId()}`;
        this.http.patch<{ dictionarySummary: DictionarySummary }>(endpoint, { newDictionarySummary }).subscribe((response) => {
            this.dictionaryUpdateEvent.next(response.dictionarySummary);
        });
    }

    handleDownloadDictionary(dictionaryId: string): void {
        const endpoint = `${environment.serverUrl}/dictionaries/${dictionaryId}`;
        this.http.get<{ dictionary: DictionaryData }>(endpoint).subscribe((response) => {
            this.dictionaryDownloadEvent.next(response.dictionary);
        });
    }

    // update table on response if deletion worked
    handleDeleteDictionary(dictionaryId: string): void {
        const endpoint = `${environment.serverUrl}/dictionaries/${dictionaryId}`;
        this.http.delete<string>(endpoint, { body: dictionaryId }).subscribe((response) => {
            this.dictionaryDeleteEvent.next(response);
        });
    }
    // fix endpoint
    handleUploadDictionary(dictionaryData: DictionaryData): void {
        const endpoint = `${environment.serverUrl}/dictionaries/${this.socketService.getId()}`;
        this.http.post<string>(endpoint, { dictionaryData }).subscribe((response) => {
            this.dictionaryUploadEvent.next(response);
        });
    }

    subscribeToDictionaryUpdateEvent(serviceDestroyed$: Subject<boolean>, callback: (dictionarySummary: DictionarySummary) => void): void {
        this.dictionaryUpdateEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }

    subscribeToDictionaryDownloadEvent(serviceDestroyed$: Subject<boolean>, callback: (dictionaryData: DictionaryData) => void): void {
        this.dictionaryDownloadEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }

    subscribeToDictionaryDeleteEvent(serviceDestroyed$: Subject<boolean>, callback: (hostName: string) => void): void {
        this.dictionaryDeleteEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }

    private configureSocket(): void {
        this.socketService.on('dictionaryUpdate', (dictionarySummary: DictionarySummary) => {
            this.dictionaryUpdateEvent.next(dictionarySummary);
        });
        this.socketService.on('dictionaryDownload', (dictionaryData: DictionaryData) => {
            this.dictionaryDownloadEvent.next(dictionaryData);
        });
        this.socketService.on('dictionaryDelete', (response: string) => {
            this.dictionaryDeleteEvent.next(response);
        });
        this.socketService.on('dictionaryUpload', (response: string) => {
            this.dictionaryUploadEvent.next(response);
        });
    }
}
