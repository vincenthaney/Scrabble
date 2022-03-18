import { Dictionary, DictionaryData } from '@app/classes/dictionary';
import { DICTIONARY_PATHS, INVALID_DICTIONARY_NAME } from '@app/constants/dictionary.const';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Service } from 'typedi';

@Service()
export default class DictionaryService {
    private dictionaries: Map<string, Dictionary> = new Map();
    private dictionaryPaths: string[] = DICTIONARY_PATHS;

    constructor() {
        this.addAllDictionaries();
    }

    getDictionaryTitles(): string[] {
        return [...this.dictionaries.keys()] || [];
    }

    getDictionary(title: string): Dictionary {
        const dictionary = this.dictionaries.get(title);
        if (dictionary) return dictionary;
        throw new Error(INVALID_DICTIONARY_NAME);
    }

    getDefaultDictionary(): Dictionary {
        return this.getDictionary(this.getDictionaryTitles()[0]);
    }

    protected fetchDictionaryWords(path: string): Dictionary {
        const buffer = readFileSync(join(__dirname, path));
        const data: DictionaryData = JSON.parse(buffer.toString());
        return new Dictionary(data);
    }

    private addAllDictionaries(): void {
        for (const path of this.dictionaryPaths) {
            const dictionary = this.fetchDictionaryWords(path);
            this.dictionaries.set(dictionary.title, dictionary);
        }
    }
}
