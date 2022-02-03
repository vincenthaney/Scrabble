import { INVALID_WORD, MINIMUM_WORD_LEN } from '@app/constants/errors';
import { Service } from 'typedi';

@Service()
export class WordsVerificationService {


    verifyWords(words: string[][], dictionary: string) {
        for (const word in words) {
            if (word != null) {
                this.removeAccents(word);
                if (words.length > MINIMUM_WORD_LEN) {
                    throw new Error(INVALID_WORD);
                }
                if (word.includes('-')) {
                    throw new Error(INVALID_WORD);
                }
                if (word.includes("'")) {
                    throw new Error(INVALID_WORD);
                }
                if (this.activeDictionaries.get(dictionary)?.has(word)) {
                    throw new Error(INVALID_WORD);
                }
            }
        }
    }

    removeAccents(word: string) {
        return word.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
}
