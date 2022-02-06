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
        this.activeDictionaries = new Map<string, Set<string>>();
    }

    fetchDictionary(): string[] {
        const filePath = join(__dirname, WordsVerificationConst.DICTIONARY_RELATIVE_PATH);
        const dataBuffer = fs.readFileSync(filePath);
        const data: DictionaryData = JSON.parse(dataBuffer.toString());
        return data.words;
    }

    loadAllDictionaries() {
        // TODO: Change this to upload all dictionaries within directory
        this.addDictionary();
    }

    // TODO: Create a separate service to manage dictionary importation
    async addDictionary() {
        this.activeDictionaries.set(WordsVerificationConst.DICTIONARY_NAME, new Set(this.fetchDictionary()));
    }

    verifyWords(words: string[], dictionary: string): string[] {
        for (const word of words) {
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
