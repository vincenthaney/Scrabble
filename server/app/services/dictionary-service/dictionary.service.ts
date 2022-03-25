import { Dictionary, DictionaryData } from '@app/classes/dictionary';
import { DICTIONARY_PATH, INVALID_DICTIONARY_NAME } from '@app/constants/dictionary.const';
import 'mock-fs'; // required when running test. Otherwise compiler cannot resolve fs, path and __dirname
import { promises, readFileSync } from 'fs';
import { join } from 'path';
import { Service } from 'typedi';
import DatabaseService from '@app/services/database-service/database.service';
import { DICTIONARIES_MONGO_COLLECTION_NAME } from '@app/constants/services-constants/mongo-db.const';
import { Collection } from 'mongodb';

export interface DictionaryUsage {
    dictionary: Dictionary;
    numberOfActiveGames: number;
}

export interface DictionarySummary {
    title: string;
    description: string;
}

@Service()
export default class DictionaryService {
    private activeDictionaries: Map<string, DictionaryUsage> = new Map();

    constructor(private databaseService: DatabaseService) {
        // this.addAllDictionaries();
    }

    private static async fetchDefaultDictionary(): Promise<DictionaryData[]> {
        const filePath = join(__dirname, DICTIONARY_PATH);
        const dataBuffer = await promises.readFile(filePath, 'utf-8');
        const defaultDictionary: DictionaryData = JSON.parse(dataBuffer);
        return [defaultDictionary];
    }

    async resetDbDictionaries(): Promise<void> {
        await this.collection.deleteMany({ isRemovable: { $exists: false } });
        if (await ((await this.collection.find({}).toArray()).length === 0)) await this.populateDb();
    }

    async getDictionarySummaryTitles(): Promise<DictionarySummary[]> {
        const data = await this.collection.find({}, { title: 1, description: 1, _id: 0 }).toArray();
        const dictionarySummaries: DictionarySummary[] = [];
        data.forEach((dictionary) => {
            dictionarySummaries.push({ title: dictionary.title, description: dictionary.description });
        });
        return dictionarySummaries;
    }

    async useDictionary(id: string) {
        const dictionary = this.activeDictionaries.get(id);
        if (dictionary) {
            dictionary.numberOfActiveGames++;
            return dictionary;
        }

        const dictionaryDb = (await (await this.collection.find({ _id: id })).toArray())[0];
        if (!dictionaryDb) throw new Error(INVALID_DICTIONARY_NAME);
        this.activeDictionaries.set(id, { numberOfActiveGames: 1, dictionary: dictionaryDb });
    }

    getDictionary(id: string): Dictionary {
        const dictionary = this.dictionaries.get(title);
        if (dictionary) return dictionary;
        throw new Error(INVALID_DICTIONARY_NAME);
    }

    private get collection(): Collection<DictionaryData> {
        return this.databaseService.database.collection(DICTIONARIES_MONGO_COLLECTION_NAME);
    }

    private async populateDb(): Promise<void> {
        await this.databaseService.populateDb(DICTIONARIES_MONGO_COLLECTION_NAME, await DictionaryService.fetchDefaultDictionary());
    }

    // getDefaultDictionary(): Dictionary {
    //     return this.getDictionary(this.getDictionaryTitles()[0]);
    // }

    // private addAllDictionaries(): void {
    //     for (const path of this.dictionaryPaths) {
    //         const dictionary = this.fetchDictionaryWords(path);
    //         this.dictionaries.set(dictionary.title, dictionary);
    //     }
    // }
}
