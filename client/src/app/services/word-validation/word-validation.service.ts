import { Injectable } from '@angular/core';
@Injectable({
    providedIn: 'root',
})
export class WordValidationService {
    // TODO: Potentially make an interface of a candidate word to make it clearer
    validateWords(newWords: string[]): string[] {
        throw new Error('Method not implemented.');
    }
}
