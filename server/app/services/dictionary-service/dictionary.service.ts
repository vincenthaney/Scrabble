import { Dictionary, DictionaryData } from '@app/classes/dictionary';
import { DICTIONARIES, INVALID_DICTIONARY_NAME } from '@app/constants/dictionary.const';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Service } from 'typedi';

@Service()
export default class DictionaryService {
    private dictionaries: Map<string, Dictionary> = new Map();

    constructor() {
        this.addAllDictionaries();
    }

    getDictionary(name: string): Dictionary {
        const dictionary = this.dictionaries.get(name);
        if (dictionary) return dictionary;
        throw new Error(INVALID_DICTIONARY_NAME);
    }

    protected fetchDictionaryWords(path: string): Dictionary {
        const buffer = readFileSync(join(__dirname, path));
        const data: DictionaryData = JSON.parse(buffer.toString());
        return new Dictionary(data.words);
    }

    private addAllDictionaries(): void {
        for (const [path, name] of DICTIONARIES) {
            this.dictionaries.set(name, this.fetchDictionaryWords(path));
        }
    }
}
