import { Dictionary, DictionaryData } from '@app/classes/dictionary';
import {
    DICTIONARY_PATH,
    INVALID_DESCRIPTION_FORMAT,
    INVALID_DICTIONARY_FORMAT,
    INVALID_DICTIONARY_ID,
    MAX_DICTIONARY_DESCRIPTION_LENGTH,
    MAX_DICTIONARY_TITLE_LENGTH,
} from '@app/constants/dictionary.const';
import 'mock-fs'; // required when running test. Otherwise compiler cannot resolve fs, path and __dirname
import { promises } from 'fs';
import { join } from 'path';
import DatabaseService from '@app/services/database-service/database.service';
import { DICTIONARIES_MONGO_COLLECTION_NAME } from '@app/constants/services-constants/mongo-db.const';
import { Collection, ObjectId } from 'mongodb';
import Ajv, { ValidateFunction } from 'ajv';
import { DictionaryDataComplete, DictionarySummary, DictionaryUpdateInfo, DictionaryUsage } from '@app/classes/dictionary/dictionary-data';
import { Service } from 'typedi';

@Service()
export default class DictionaryService {
    private dictionaryValidator: ValidateFunction<{ [x: string]: unknown }>;
    private activeDictionaries: Map<string, DictionaryUsage> = new Map();

    constructor(private databaseService: DatabaseService) {}

    private static async fetchDefaultDictionary(): Promise<DictionaryData> {
        const filePath = join(__dirname, DICTIONARY_PATH);
        const dataBuffer = await promises.readFile(filePath, 'utf-8');
        const defaultDictionary: DictionaryData = JSON.parse(dataBuffer);
        defaultDictionary.isDefault = true;
        return defaultDictionary;
    }

    async useDictionary(id: string): Promise<DictionaryUsage> {
        let dictionary = this.activeDictionaries.get(id);
        if (dictionary) {
            dictionary.numberOfActiveGames++;
            return dictionary;
        }
        const dictionaryData: DictionaryDataComplete = { ...(await this.getDbDictionary(id)), id };

        dictionary = { numberOfActiveGames: 1, dictionary: new Dictionary(dictionaryData) };
        this.activeDictionaries.set(id, dictionary);

        return dictionary;
    }

    getDictionary(id: string): Dictionary {
        const dictionaryUsage = this.activeDictionaries.get(id);
        if (dictionaryUsage) return dictionaryUsage.dictionary;
        throw new Error(INVALID_DICTIONARY_ID);
    }

    stopUsingDictionary(id: string): void {
        const dictionaryUsage = this.activeDictionaries.get(id);
        if (!dictionaryUsage) return;
        if (--dictionaryUsage.numberOfActiveGames === 0) this.activeDictionaries.delete(id);
    }

    async validateDictionary(dictionaryData: DictionaryData): Promise<boolean> {
        if (!this.dictionaryValidator) this.createDictionaryValidator();
        return this.dictionaryValidator(dictionaryData) && (await this.isTitleValid(dictionaryData.title));
    }

    async addNewDictionary(dictionaryData: DictionaryData): Promise<void> {
        if (!this.validateDictionary(dictionaryData)) throw new Error(INVALID_DICTIONARY_FORMAT);
        await this.collection.updateOne(
            {
                title: dictionaryData.title,
            },
            {
                $setOnInsert: dictionaryData,
            },
            { upsert: true },
        );
    }

    async resetDbDictionaries(): Promise<void> {
        await this.collection.deleteMany({ isDefault: { $exists: false } });
        if ((await this.collection.countDocuments({})) === 0) await this.populateDb();
    }

    async getDictionarySummaryTitles(): Promise<DictionarySummary[]> {
        const data = await this.collection.find({}, { projection: { title: 1, description: 1 } }).toArray();
        const dictionarySummaries: DictionarySummary[] = [];
        data.forEach((dictionary) => {
            // It is necessary to access the ObjectId of the mongodb document which
            // eslint-disable-next-line no-underscore-dangle
            dictionarySummaries.push({ title: dictionary.title, description: dictionary.description, id: dictionary._id.toString() });
        });
        return dictionarySummaries;
    }

    async updateDictionary(updateInfo: DictionaryUpdateInfo): Promise<void> {
        const infoToUpdate: { description?: string; title?: string } = {};

        if (updateInfo.description) {
            if (!this.isDescriptionValid(updateInfo.description)) throw new Error(INVALID_DESCRIPTION_FORMAT);
            infoToUpdate.description = updateInfo.description;
        }
        if (updateInfo.title) {
            if (!this.isTitleValid(updateInfo.title)) throw new Error(INVALID_DESCRIPTION_FORMAT);
            infoToUpdate.title = updateInfo.title;
        }

        await this.collection.findOneAndUpdate({ _id: new ObjectId(updateInfo.id), isDefault: { $exists: false } }, { $set: infoToUpdate });
    }

    private async isTitleValid(title: string): Promise<boolean> {
        return (await this.collection.countDocuments({ title })) === 0 && title.length < MAX_DICTIONARY_TITLE_LENGTH;
    }

    private isDescriptionValid(description: string): boolean {
        return description.length < MAX_DICTIONARY_DESCRIPTION_LENGTH;
    }

    private get collection(): Collection<DictionaryData> {
        return this.databaseService.database.collection(DICTIONARIES_MONGO_COLLECTION_NAME);
    }

    private async populateDb(): Promise<void> {
        await this.databaseService.populateDb(DICTIONARIES_MONGO_COLLECTION_NAME, [await DictionaryService.fetchDefaultDictionary()]);
    }

    private async getDbDictionary(id: string): Promise<DictionaryData> {
        const dictionaryData: DictionaryData | null = await this.collection.findOne({ _id: new ObjectId(id) }, { projection: { _id: 0 } });
        if (dictionaryData) return dictionaryData;

        throw new Error(INVALID_DICTIONARY_ID);
    }

    private createDictionaryValidator(): void {
        const ajv = new Ajv();

        const schema = {
            type: 'object',
            properties: {
                title: { type: 'string', maxLength: MAX_DICTIONARY_TITLE_LENGTH },
                description: { type: 'string', maxLength: MAX_DICTIONARY_DESCRIPTION_LENGTH },
                words: {
                    type: 'array',
                    minItems: 1,
                    items: {
                        type: 'string',
                        pattern: '^[a-z]{2,15}$',
                    },
                },
            },
            required: ['title', 'description', 'words'],
            additionalProperties: false,
        };

        this.dictionaryValidator = ajv.compile(schema);
    }
}
