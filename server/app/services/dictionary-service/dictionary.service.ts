import {
    BasicDictionaryData,
    CompleteDictionaryData,
    DictionarySummary,
    DictionaryUpdateInfo,
    DictionaryUsage,
} from '@app/classes/communication/dictionary-data';
import { Dictionary, DictionaryData } from '@app/classes/dictionary';
import {
    DICTIONARY_PATH,
    INVALID_DESCRIPTION_FORMAT,
    INVALID_DICTIONARY_FORMAT,
    INVALID_DICTIONARY_ID,
    INVALID_TITLE_FORMAT,
    MAX_DICTIONARY_DESCRIPTION_LENGTH,
    MAX_DICTIONARY_TITLE_LENGTH,
} from '@app/constants/dictionary.const';
import { DICTIONARIES_MONGO_COLLECTION_NAME } from '@app/constants/services-constants/mongo-db.const';
import DatabaseService from '@app/services/database-service/database.service';
import Ajv, { ValidateFunction } from 'ajv';
import { promises } from 'fs';
import 'mock-fs'; // required when running test. Otherwise compiler cannot resolve fs, path and __dirname
import { Collection, ObjectId } from 'mongodb';
import { join } from 'path';
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
        const dictionaryData: CompleteDictionaryData = { ...(await this.getDbDictionary(id)), id };

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

    async validateDictionary(dictionaryData: BasicDictionaryData): Promise<boolean> {
        if (!this.dictionaryValidator) this.createDictionaryValidator();
        return this.dictionaryValidator(dictionaryData) && (await this.isTitleValid(dictionaryData.title));
    }

    async addNewDictionary(basicDictionaryData: BasicDictionaryData): Promise<void> {
        if (!(await this.validateDictionary(basicDictionaryData))) throw new Error(INVALID_DICTIONARY_FORMAT);
        const dictionaryData: DictionaryData = { ...basicDictionaryData, isDefault: false };
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
        await this.collection.deleteMany({ isDefault: false });
        await this.populateDb();
    }

    async getAllDictionarySummaries(): Promise<DictionarySummary[]> {
        const data = await this.collection.find({}, { projection: { title: 1, description: 1, isDefault: 1 } }).toArray();
        const dictionarySummaries: DictionarySummary[] = [];
        data.forEach((dictionary) => {
            const summary: DictionarySummary = {
                title: dictionary.title,
                description: dictionary.description,
                // The underscore is necessary to access the ObjectId of the mongodb document which is written '_id'
                // eslint-disable-next-line no-underscore-dangle
                id: dictionary._id.toString(),
                isDefault: dictionary.isDefault,
            };
            dictionarySummaries.push(summary);
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
            if (!(await this.isTitleValid(updateInfo.title, new ObjectId(updateInfo.id)))) throw new Error(INVALID_TITLE_FORMAT);
            infoToUpdate.title = updateInfo.title;
        }

        await this.collection.findOneAndUpdate({ _id: new ObjectId(updateInfo.id), isDefault: false }, { $set: infoToUpdate });
    }

    async deleteDictionary(dictionaryId: string): Promise<void> {
        await this.collection.findOneAndDelete({ _id: new ObjectId(dictionaryId), isDefault: false });
    }

    async getDbDictionary(id: string): Promise<DictionaryData> {
        const dictionaryData: DictionaryData | null = await this.collection.findOne({ _id: new ObjectId(id) }, { projection: { _id: 0 } });
        if (dictionaryData) return dictionaryData;

        throw new Error(INVALID_DICTIONARY_ID);
    }

    private async isTitleValid(title: string, id?: ObjectId): Promise<boolean> {
        return (await this.collection.countDocuments({ _id: { $ne: id }, title })) === 0 && title.length < MAX_DICTIONARY_TITLE_LENGTH;
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
                        pattern: '^[a-z]{2,30}$',
                    },
                },
            },
            required: ['title', 'description', 'words'],
            additionalProperties: false,
        };

        this.dictionaryValidator = ajv.compile(schema);
    }
}
