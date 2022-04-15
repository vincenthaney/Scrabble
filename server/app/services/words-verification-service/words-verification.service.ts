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
import { HttpException } from '@app/classes/http-exception/http-exception';
import { StatusCodes } from 'http-status-codes';

@Service()
export class WordsVerificationService {
    constructor(private readonly dictionaryService: DictionaryService) {}

    verifyWords(words: string[], dictionaryId: string): void {
        for (const word of words) {
            const curatedWord = this.removeAccents(word).toLowerCase();

            if (curatedWord.length < MINIMUM_WORD_LENGTH) throw new HttpException(curatedWord + WORD_TOO_SHORT, StatusCodes.BAD_REQUEST);
            if (curatedWord.includes('*')) throw new HttpException(curatedWord + WORD_CONTAINS_ASTERISK, StatusCodes.BAD_REQUEST);
            if (curatedWord.includes('-')) throw new HttpException(curatedWord + WORD_CONTAINS_HYPHEN, StatusCodes.BAD_REQUEST);
            if (curatedWord.includes("'")) throw new HttpException(curatedWord + WORD_CONTAINS_APOSTROPHE, StatusCodes.BAD_REQUEST);
            if (!this.dictionaryService.getDictionary(dictionaryId).wordExists(curatedWord))
                throw new HttpException(INVALID_WORD(word.toUpperCase()), StatusCodes.BAD_REQUEST);
        }
    }

    private removeAccents(word: string): string {
        return word.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
}
