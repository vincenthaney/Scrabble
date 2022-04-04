import { Injectable } from '@angular/core';
import { DictionarySummary } from '@app/classes/communication/dictionary';
import { DictionaryData } from '@app/classes/dictionary/dictionary-data';
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
    private dictionariesDataUpdateEvent: Subject<string> = new Subject();
    private componentUpdateEvent: Subject<string> = new Subject();
    private serviceDestroyed$: Subject<boolean> = new Subject();

    constructor(private dictionariesController: DictionariesController) {
        this.dictionariesController.subscribeToDictionaryUpdateEvent(this.serviceDestroyed$, (message) => {
            this.dictionariesDataUpdateEvent.next(message);
            this.componentUpdateEvent.next(message);
        });

        this.dictionariesController.subscribeToDictionaryDownloadEvent(this.serviceDestroyed$, (dictionaryData) => {
            this.dictionaryData = dictionaryData;
        });

        this.dictionariesController.subscribeToDictionaryErrorEvent(this.serviceDestroyed$, (response) => {
            this.dictionariesDataUpdateEvent.next(response);
        });

        this.dictionariesController.subscribeToGetAllDictionariesEvent(this.serviceDestroyed$, (dictionaries) => {
            this.dictionaries = dictionaries;
        });
    }

    subscribeToComponentUpdateEvent(serviceDestroyed$: Subject<boolean>, callback: (response: string) => void): void {
        this.componentUpdateEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }

    subscribeToDictionariesDataUpdateEvent(serviceDestroyed$: Subject<boolean>, callback: (response: string) => void): void {
        this.dictionariesDataUpdateEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
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

    async getDictionaries(): Promise<DictionarySummary[]> {
        await this.dictionariesController.handleGetAllDictionariesEvent();
        return this.dictionaries;
    }
}
