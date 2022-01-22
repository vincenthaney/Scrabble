import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class WordDictionnaryService {
    constructor(private http: HttpClient) {}

    fetchWordDictionnaries(): WordDictionnary[] {
        return [];
    }

    updateWordDictionnary(wordDictionaries: WordDictionary[]): void {
        return;
    }
}
