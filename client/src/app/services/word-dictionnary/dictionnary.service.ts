import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { WordDictionnary } from '@app/classes/admin/word-dictionnary';

@Injectable({
    providedIn: 'root',
})
export class WordDictionnaryService {
    constructor(private http: HttpClient) {}

    fetchWordDictionnaries(): WordDictionnary[] {
        throw new Error('Method not implemented.');
    }

    updateWordDictionnaries(wordDictionaries: WordDictionnary[]): void {
        throw new Error('Method not implemented.');
    }
}
