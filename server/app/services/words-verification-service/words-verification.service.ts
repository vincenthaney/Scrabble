import { EMPTY_WORD } from '@app/constants/errors';
import { Service } from 'typedi';

@Service()
export class WordsVerificationService {
    activeDictionary: string = 'log2990_dictionary';

    async verifyWords(words: string[][]) {
        for (const word in words) {
            if (word.length > 0) {
                const letterDictionary = await import(`../assets/${this.activeDictionary}/${this.activeDictionary}_${word[0]}.json`);
                if (word in letterDictionary) {
                    continue;
                } else {
                    return word;
                }
            } else {
                throw new Error(EMPTY_WORD);
            }
        }
        return null;
    }
}
