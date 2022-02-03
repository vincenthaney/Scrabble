import { EMPTY_WORD, INVALID_WORD, MINIMUM_WORD_LEN } from '@app/constants/errors';
import { Service } from 'typedi';

@Service()
export class WordsVerificationService {
    activeDictionaries: Map<string, Set<string>>;


}
