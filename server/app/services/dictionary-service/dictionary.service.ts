import {
    BasicDictionaryData,
    CompleteDictionaryData,
    DictionarySummary,
    DictionaryUpdateInfo,
    DictionaryUsage,
} from '@app/classes/communication/dictionary-data';
import { Dictionary, DictionaryData } from '@app/classes/dictionary';
import { HttpException } from '@app/classes/http-exception/http-exception';
import {
    DICTIONARY_PATH,
    INVALID_DESCRIPTION_FORMAT,
    INVALID_DICTIONARY_FORMAT,
    INVALID_DICTIONARY_ID,
    INVALID_TITLE_FORMAT,
    MAX_DICTIONARY_DESCRIPTION_LENGTH,
    MAX_DICTIONARY_TITLE_LENGTH,
} from '@app/constants/dictionary.const';
import { ONE_HOUR_IN_MS } from '@app/constants/services-constants/dictionary-const';
import { DICTIONARIES_MONGO_COLLECTION_NAME } from '@app/constants/services-constants/mongo-db.const';
import DatabaseService from '@app/services/database-service/database.service';
import Ajv, { ValidateFunction } from 'ajv';
import { promises } from 'fs';
import { StatusCodes } from 'http-status-codes';
import 'mock-fs'; // required when running test. Otherwise compiler cannot resolve fs, path and __dirname
import { Collection, ObjectId, UpdateResult } from 'mongodb';
import { join } from 'path';
import { Service } from 'typedi';

@Service()
export default class DictionaryService {
    private dictionaryValidator: ValidateFunction<{ [x: string]: unknown }>;
    private activeDictionaries: Map<string, DictionaryUsage> = new Map();

    constructor(private databaseService: DatabaseService) {
        this.databaseService.getDatabaseInitializationEvent().on('initialize', async () => await this.initializeDictionaries());
    }

    private static async fetchDefaultDictionary(): Promise<DictionaryData> {
        const filePath = join(__dirname, DICTIONARY_PATH);
        const dataBuffer = await promises.readFile(filePath, 'utf-8');
        const defaultDictionary: DictionaryData = JSON.parse(dataBuffer);
        defaultDictionary.isDefault = true;
        return defaultDictionary;
    }

    async useDictionary(id: string): Promise<DictionaryUsage> {
        const dictionary: DictionaryUsage | undefined = this.activeDictionaries.get(id);
        if (!dictionary) throw new HttpException(INVALID_DICTIONARY_ID, StatusCodes.NOT_FOUND);

        dictionary.numberOfActiveGames++;
        dictionary.lastUse = new Date();
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
        dictionaryUsage.numberOfActiveGames--;
        this.deleteActiveDictionary(id);
    }

    async validateDictionary(dictionaryData: BasicDictionaryData): Promise<boolean> {
        if (!this.dictionaryValidator) this.createDictionaryValidator();
        return this.dictionaryValidator(dictionaryData) && (await this.isTitleValid(dictionaryData.title));
    }

    async addNewDictionary(basicDictionaryData: BasicDictionaryData): Promise<void> {
        if (!(await this.validateDictionary(basicDictionaryData))) throw new Error(INVALID_DICTIONARY_FORMAT);
        const dictionaryData: DictionaryData = { ...basicDictionaryData, isDefault: false };
        await this.collection
            .updateOne(
                {
                    title: dictionaryData.title,
                },
                {
                    $setOnInsert: dictionaryData,
                },
                { upsert: true },
            )
            .then(async (updateResult: UpdateResult) => await this.initializeDictionary(updateResult.upsertedId.toString()));
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

            this.initializeDictionary(summary.id);
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
            if (!(await this.isTitleValid(updateInfo.title))) throw new Error(INVALID_TITLE_FORMAT);
            infoToUpdate.title = updateInfo.title;
        }

        await this.collection.findOneAndUpdate({ _id: new ObjectId(updateInfo.id), isDefault: false }, { $set: infoToUpdate });
    }

    async deleteDictionary(dictionaryId: string): Promise<void> {
        await this.collection.findOneAndDelete({ _id: new ObjectId(dictionaryId), isDefault: false });
        const dictionaryUsage: DictionaryUsage | undefined = this.activeDictionaries.get(dictionaryId);
        if (dictionaryUsage) {
            dictionaryUsage.isDeleted = true;
            this.deleteActiveDictionary(dictionaryId);
        }
    }

    async getDbDictionary(id: string): Promise<DictionaryData> {
        const dictionaryData: DictionaryData | null = await this.collection.findOne({ _id: new ObjectId(id) }, { projection: { _id: 0 } });
        if (dictionaryData) return dictionaryData;

        throw new Error(INVALID_DICTIONARY_ID);
    }

    private async initializeDictionaries(): Promise<void> {
        const dictionariesId: string[] = await this.getDictionariesId();
        dictionariesId.forEach(async (id: string) => await this.initializeDictionary(id));
    }

    private async getDictionariesId(): Promise<string[]> {
        return await this.collection
            .find({})
            // The underscore is necessary to access the ObjectId of the mongodb document which is written '_id'
            // eslint-disable-next-line no-underscore-dangle
            .map((dictionary) => dictionary._id.toString())
            .toArray();
    }

    private async initializeDictionary(id: string): Promise<void> {
        if (this.activeDictionaries.has(id)) return;

        const dictionaryData: CompleteDictionaryData = { ...(await this.getDbDictionary(id)), id };

        const dictionary = { numberOfActiveGames: 0, dictionary: new Dictionary(dictionaryData), isDeleted: false };
        this.activeDictionaries.set(id, dictionary);
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
        await this.initializeDictionaries();
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

    private deleteActiveDictionary(dictionaryId: string): void {
        const dictionaryUsage: DictionaryUsage | undefined = this.activeDictionaries.get(dictionaryId);
        if (!dictionaryUsage) throw new HttpException(INVALID_DICTIONARY_ID, StatusCodes.NOT_FOUND);

        if (this.shouldDeleteActiveDictionary(dictionaryUsage)) {
            this.activeDictionaries.delete(dictionaryId);
        }

        console.log(this.activeDictionaries);
    }

    private shouldDeleteActiveDictionary(dictionaryUsage: DictionaryUsage): boolean {
        return (
            dictionaryUsage.numberOfActiveGames <= 0 &&
            dictionaryUsage.isDeleted &&
            (!dictionaryUsage.lastUse || (dictionaryUsage.lastUse && Date.now() - dictionaryUsage.lastUse.getDate() > ONE_HOUR_IN_MS))
        );
    }
}
