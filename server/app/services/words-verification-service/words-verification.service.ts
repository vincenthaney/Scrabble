import { INVALID_WORD, MINIMUM_WORD_LEN } from '@app/constants/errors';
import { Service } from 'typedi';
import * as fs from 'fs';
import { join } from 'path';
import * as WordsVerificationConst from './words-verification.service.const';
import { DictionaryData } from './words-verification.service.types';

@Service()
export class WordsVerificationService {
    activeDictionaries: Map<string, Set<string>>;

    constructor() {
        this.openAllDictionaries();
    }

    async fetchDictionary(): Promise<string[]> {
        const filePath = join(__dirname, WordsVerificationConst.DICTIONARY_RELATIVE_PATH);
        const dataBuffer = await fs.promises.readFile(filePath, 'utf-8');
        const data: DictionaryData = JSON.parse(dataBuffer);
        return data.words;
    }

    openAllDictionaries() {
        this.addDictionary();
    }

    // À mettre dans un service à part
    async addDictionary() {
        this.activeDictionaries[WordsVerificationConst.DICTIONARY_NAME] = new Set(await this.fetchDictionary());
    }

    verifyWords(words: string[][], dictionary: string) {
        for (const word in words) {
            if (!word) {
                this.removeAccents(word);
                if (words.length < MINIMUM_WORD_LEN) {
                    throw new Error(INVALID_WORD);
                }
                if (word.includes('-')) {
                    throw new Error(INVALID_WORD);
                }
                if (word.includes("'")) {
                    throw new Error(INVALID_WORD);
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
