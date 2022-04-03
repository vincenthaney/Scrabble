import { Injectable } from '@angular/core';
import { DictionarySummary } from '@app/classes/communication/dictionary';
import { DictionaryData, DictionaryUpdateInfo } from '@app/classes/dictionary/dictionary-data';
import {
    DICTIONARIES_ADDED,
    DICTIONARIES_NOT_ADDED,
    DICTIONARY_ADDED,
    DICTIONARY_DELETED,
    DICTIONARY_DOWNLOADING,
    DICTIONARY_NOT_DELETED,
    DICTIONARY_NOT_DOWNLOADED,
    DICTIONARY_NOT_UPDATED,
    DICTIONARY_UPDATED,
} from '@app/constants/dictionary-service-constants';
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
    uploadRequestResponse: string;
    private dictionariesDataUpdateEvent: Subject<DictionarySummary[]> = new Subject();

    constructor(private dictionariesController: DictionariesController, private serviceDestroyed$: Subject<boolean> = new Subject()) {
        this.dictionariesController.subscribeToDictionaryUpdateEvent(this.serviceDestroyed$, (dictionarySummary) => {
            this.updateRequestResponse = dictionarySummary;
        });

        this.dictionariesController.subscribeToDictionaryDownloadEvent(this.serviceDestroyed$, (dictionaryData) => {
            this.dictionaryData = dictionaryData;
        });

        this.dictionariesController.subscribeToDictionaryDeleteEvent(this.serviceDestroyed$, (response) => {
            this.deleteRequestResponse = response;
        });
        this.dictionariesController.subscribeToDictionaryUploadEvent(this.serviceDestroyed$, (response) => {
            this.uploadRequestResponse = response;
        });
        this.dictionariesController.subscribeToGetAllDictionariesEvent(this.serviceDestroyed$, (dictionaries) => {
            this.dictionaries = dictionaries;
        });
    }

    handleDictionariesDataUpdateEvent(): void {
        this.dictionariesDataUpdateEvent.next(this.dictionaries);
    }

    subscribeToDictionariesDataUpdateEvent(serviceDestroyed$: Subject<boolean>, callback: (response: DictionarySummary[]) => void): void {
        this.dictionariesDataUpdateEvent.pipe(takeUntil(serviceDestroyed$)).subscribe(callback);
    }

    async updateDictionary(id: string, name: string, description: string): Promise<DictionaryUpdateInfo | string> {
        this.dictionariesController.handleUpdateDictionary({ title: name, description, id });
        if (this.updateRequestResponse) {
            this.getDictionaries();
            return DICTIONARY_UPDATED;
        }
        return DICTIONARY_NOT_UPDATED;
    }

    async downloadDictionary(id: string): Promise<void | string> {
        this.dictionariesController.handleDownloadDictionary(id);
        if (this.dictionaryData) {
            this.startDownload();
            return DICTIONARY_DOWNLOADING;
        }
        return DICTIONARY_NOT_DOWNLOADED;
    }

    async deleteDictionary(id: string): Promise<void | string> {
        this.dictionariesController.handleDeleteDictionary(id);
        if (this.deleteRequestResponse) {
            this.getDictionaries();
            return DICTIONARY_DELETED;
        }
        return DICTIONARY_NOT_DELETED;
    }

    async uploadDictionary(): Promise<string> {
        // envoyer requete au service du serveur pour supprimer le dictionaire spécifié
        // const dictionaryData = methodToGetDictFromUser()
        // this.dictionariesController.handleUploadDictionary(id);
        // si bonne réponse, supprimer dict et actualiser
        // changer ceci pour le real thang
        const dictionaryData = {} as unknown as DictionaryData;
        this.dictionariesController.handleUploadDictionary(dictionaryData);
        if (this.deleteRequestResponse) {
            this.getDictionaries();
            return DICTIONARY_ADDED;
        }
        return DICTIONARY_NOT_DELETED;
    }

    async getDictionaries(): Promise<string> {
        this.dictionariesController.handleGetAllDictionariesEvent();
        if (this.dictionaries) {
            return DICTIONARIES_ADDED;
        }
        return DICTIONARIES_NOT_ADDED;
    }

    private startDownload(): void {
        const title = this.dictionaryData.title;
        const downloadProcess = window.document.createElement('a');
        downloadProcess.href = window.URL.createObjectURL(new Blob([JSON.stringify(this.dictionaryData)], { type: 'application/json' }));
        downloadProcess.download = title;
        document.body.appendChild(downloadProcess);
        downloadProcess.click();
        document.body.removeChild(downloadProcess);
    }
}
