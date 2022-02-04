import { INVALID_WORD, MINIMUM_WORD_LENGTH, WORD_CONTAINS_APOSTROPHE, WORD_CONTAINS_HYPHEN, WORD_TOO_SHORT } from '@app/constants/errors';
import { Service } from 'typedi';
import * as fs from 'fs';
import { join } from 'path';
import * as WordsVerificationConst from './words-verification.service.const';
import { DictionaryData } from './words-verification.service.types';

@Service()
export class WordsVerificationService {
    activeDictionaries: Map<string, Set<string>>;

    constructor() {
        this.loadAllDictionaries();
    }

    async fetchDictionary(): Promise<string[]> {
        const filePath = join(__dirname, WordsVerificationConst.DICTIONARY_RELATIVE_PATH);
        const dataBuffer = await fs.promises.readFile(filePath, 'utf-8');
        const data: DictionaryData = JSON.parse(dataBuffer);
        return data.words;
    }

    loadAllDictionaries() {
        // À changer pour une lecture du répertoire de dictionnaires
        this.addDictionary();
    }

    // À mettre dans un service à part
    async addDictionary() {
        this.activeDictionaries[WordsVerificationConst.DICTIONARY_NAME] = new Set(await this.fetchDictionary());
    }

    verifyWords(words: string[][], dictionary: string) {
        for (const word in words) {
            if (word.length > 0) {
                this.removeAccents(word);
                if (word.length < MINIMUM_WORD_LENGTH) {
                    throw new Error(WORD_TOO_SHORT);
                }
                if (word.includes('-')) {
                    throw new Error(WORD_CONTAINS_HYPHEN);
                }
                if (word.includes("'")) {
                    throw new Error(WORD_CONTAINS_APOSTROPHE);
                }
                if (!this.activeDictionaries.get(dictionary)?.has(word)) {
                    throw new Error(INVALID_WORD);
                }
            }
        }
        return words;
    }

    removeAccents(word: string) {
        return word.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
}
