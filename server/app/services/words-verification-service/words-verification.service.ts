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

    verifyWords(words: string[], dictionaryId: string): void {
        for (const word of words) {
            const curatedWord = this.removeAccents(word).toLowerCase();

            if (curatedWord.length < MINIMUM_WORD_LENGTH) throw new Error(curatedWord + WORD_TOO_SHORT);
            if (curatedWord.includes('*')) throw new Error(curatedWord + WORD_CONTAINS_ASTERISK);
            if (curatedWord.includes('-')) throw new Error(curatedWord + WORD_CONTAINS_HYPHEN);
            if (curatedWord.includes("'")) throw new Error(curatedWord + WORD_CONTAINS_APOSTROPHE);
            if (!this.dictionaryService.getDictionary(dictionaryId).wordExists(curatedWord)) throw new Error(INVALID_WORD(word.toUpperCase()));
        }
    }

    private removeAccents(word: string): string {
        return word.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
}
