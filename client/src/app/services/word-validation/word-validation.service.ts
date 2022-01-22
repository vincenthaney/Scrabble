import { Injectable } from '@angular/core';
import { Square } from '@app/classes/square';

@Injectable({
    providedIn: 'root',
})
export class WordValidationService {
    // TODO: Potentially make an interface of a candidate word to make it clearer
    calculate(newWords: string[]): string[] {
        return Array(0);
    }
}
