import {
    INVALID_WORD,
    MINIMUM_WORD_LENGTH,
    WORD_CONTAINS_APOSTROPHE,
    WORD_CONTAINS_ASTERISK,
    WORD_CONTAINS_HYPHEN,
    WORD_TOO_SHORT,
} from '@app/constants/services-errors';
import { Service } from 'typedi';
import DictionaryService from '@app/services/dictionary-service/dictionary.service';

@Service()
export class WordsVerificationService {
    constructor(private readonly dictionaryService: DictionaryService) {}

    verifyWords(words: string[], dictionary: string): void {
        for (let word of words) {
            word = this.removeAccents(word).toLowerCase();

            if (word.length < MINIMUM_WORD_LENGTH) throw new Error(word + WORD_TOO_SHORT);
            if (word.includes('*')) throw new Error(word + WORD_CONTAINS_ASTERISK);
            if (word.includes('-')) throw new Error(word + WORD_CONTAINS_HYPHEN);
            if (word.includes("'")) throw new Error(word + WORD_CONTAINS_APOSTROPHE);
            if (!this.dictionaryService.getDictionary(dictionary).wordExists(word)) throw new Error(INVALID_WORD(word.toUpperCase()));
        }
    }

    private removeAccents(word: string): string {
        return word.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
}
