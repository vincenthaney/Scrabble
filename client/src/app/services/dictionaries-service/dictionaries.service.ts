import { Injectable } from '@angular/core';
import { DictionarySummary } from '@app/classes/communication/dictionary';
import { DictionaryData } from '@app/classes/dictionary/dictionary-data';
import { DOWNLOAD_ELEMENT } from '@app/constants/dictionary-service-constants';
import { DictionariesController } from '@app/controllers/dictionaries-controller/dictionaries-controller';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class DictionariesService {
    dictionaryData: DictionaryData;
    dictionaries: DictionarySummary[];
    updateRequestResponse: string;
    deleteRequestResponse: string;
    deleteAllRequestResponse: string;
    uploadRequestResponse: string;
    private dictionariesUpdateMessageEvent: Subject<string> = new Subject();
    private componentUpdateEvent: Subject<string> = new Subject();
    private serviceDestroyed$: Subject<boolean> = new Subject();
    private dictionariesUpdatedEvent: Subject<DictionarySummary[]> = new Subject();

    constructor(private dictionariesController: DictionariesController) {
        this.dictionariesController.subscribeToDictionariesUpdateMessageEvent(this.serviceDestroyed$, (message) => {
            this.dictionariesUpdateMessageEvent.next(message);
            this.componentUpdateEvent.next(message);
            this.getDictionaries();
        });

        this.dictionariesController.subscribeToDictionaryDownloadEvent(this.serviceDestroyed$, (dictionaryData) => {
            this.startDownload(dictionaryData);
        });

        this.dictionariesController.subscribeToDictionaryErrorEvent(this.serviceDestroyed$, (response) => {
            this.componentUpdateEvent.next(response);
        });

        this.dictionariesController.subscribeToGetAllDictionariesEvent(this.serviceDestroyed$, (dictionaries: DictionarySummary[]) => {
            this.dictionaries = dictionaries;
            this.dictionariesUpdatedEvent.next(dictionaries);
        });
    }

    subscribeToDictionariestUpdateDataEvent(serviceDestroyed$: Subject<boolean>, callback: (dictionaries: DictionarySummary[]) => void): void {
        this.dictionariesUpdatedEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }

    subscribeToComponentUpdateEvent(serviceDestroyed$: Subject<boolean>, callback: (response: string) => void): void {
        this.componentUpdateEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }

    subscribeToDictionariesUpdateMessageEvent(serviceDestroyed$: Subject<boolean>, callback: (response: string) => void): void {
        this.dictionariesUpdateMessageEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }

    async updateDictionary(id: string, title: string, description: string): Promise<void> {
        await this.dictionariesController.handleUpdateDictionary({ title, description, id });
    }

    async downloadDictionary(id: string): Promise<void> {
        await this.dictionariesController.handleDownloadDictionary(id);
    }

    async deleteDictionary(id: string): Promise<void | string> {
        await this.dictionariesController.handleDeleteDictionary(id);
    }

    async deleteAllDictionaries(): Promise<void> {
        await this.dictionariesController.handleDeleteAllDictionaries();
    }

    async uploadDictionary(dictionaryData: DictionaryData): Promise<void> {
        await this.dictionariesController.handleUploadDictionary(dictionaryData);
    }

    async updateAllDictionaries(): Promise<void> {
        await this.dictionariesController.handleGetAllDictionariesEvent();
    }

    getDictionaries(): DictionarySummary[] {
        return this.dictionaries;
    }

    private startDownload(dictionaryData: DictionaryData): void {
        const title = dictionaryData.title;
        const downloadProcess = window.document.createElement(DOWNLOAD_ELEMENT);
        downloadProcess.href = window.URL.createObjectURL(new Blob([JSON.stringify(dictionaryData)], { type: 'application/json' }));
        downloadProcess.download = title;
        document.body.appendChild(downloadProcess);
        downloadProcess.click();
        document.body.removeChild(downloadProcess);
    }
}
