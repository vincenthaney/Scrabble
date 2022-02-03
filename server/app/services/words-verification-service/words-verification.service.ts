import { INVALID_WORD, MINIMUM_WORD_LEN } from '@app/constants/errors';
import { Service } from 'typedi';

@Service()
export class WordsVerificationService {

    removeAccents(word: string) {
        return word.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
}
