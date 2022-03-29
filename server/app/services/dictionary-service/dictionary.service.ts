import { Dictionary, DictionaryData } from '@app/classes/dictionary';
import { DICTIONARY_PATH, INVALID_DICTIONARY_ID, INVALID_DICTIONARY_NAME } from '@app/constants/dictionary.const';
import 'mock-fs'; // required when running test. Otherwise compiler cannot resolve fs, path and __dirname
import { promises } from 'fs';
import { join } from 'path';
import DatabaseService from '@app/services/database-service/database.service';
import { DICTIONARIES_MONGO_COLLECTION_NAME } from '@app/constants/services-constants/mongo-db.const';
import { Collection, ObjectId, WithId } from 'mongodb';
import Ajv, { ValidateFunction } from 'ajv';
import { DictionaryDataComplete } from '@app/classes/dictionary/dictionary-data';
import { Service } from 'typedi';

export interface DictionaryUsage {
    dictionary: Dictionary;
    numberOfActiveGames: number;
}

export interface DictionarySummary {
    title: string;
    description: string;
    id: string;
}

export interface DictionaryUpdateInfo {
    id: string;
    title?: string;
    description?: string;
}
export const MAX_DICTIONARY_DESCRIPTION_LENGTH = 80;
export const MAX_DICTIONARY_TITLE_LENGTH = 30;
export const INVALID_DICTIONARY_FORMAT = 'the given dictionary does not respect the expected format';
export const INVALID_DESCRIPTION_FORMAT = 'the given description does not respect the expected format';
export const INVALID_TITLE = 'the given title does not respect the expected format or is not unique';

@Service()
export default class DictionaryService {
    private dictionaryValidator: ValidateFunction<{ [x: string]: unknown }>;
    private activeDictionaries: Map<string, DictionaryUsage> = new Map();

    constructor(private databaseService: DatabaseService) {
        // this.addAllDictionaries();
    }

    private static async fetchDefaultDictionary(): Promise<DictionaryData> {
        const filePath = join(__dirname, DICTIONARY_PATH);
        const dataBuffer = await promises.readFile(filePath, 'utf-8');
        const defaultDictionary: DictionaryData = JSON.parse(dataBuffer);
        defaultDictionary.isDefault = true;
        return defaultDictionary;
    }

    async useDictionary(id: string): Promise<DictionaryUsage> {
        const dictionary = this.activeDictionaries.get(id);
        if (dictionary) {
            dictionary.numberOfActiveGames++;
            return dictionary;
        }
        const dictionaryData: DictionaryDataComplete = { ...(await this.getDbDictionary(id)), id };
        if (!dictionaryData) throw new Error(INVALID_DICTIONARY_NAME);
        const addedDictionary: DictionaryUsage = { numberOfActiveGames: 1, dictionary: new Dictionary(dictionaryData) };
        this.activeDictionaries.set(id, addedDictionary);

        return addedDictionary;
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
        return this.dictionaryValidator(dictionaryData);
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
            // eslint-disable-next-line no-underscore-dangle
            dictionarySummaries.push({ title: dictionary.title, description: dictionary.description, id: dictionary._id.toString() });
        });
        return dictionarySummaries;
    }

    async updateDictionary(updateInfo: DictionaryUpdateInfo): Promise<void> {
        // Might not work because of optional
        if (updateInfo.description && !this.isDescriptionValid(updateInfo.description)) throw new Error(INVALID_DESCRIPTION_FORMAT);
        if (updateInfo.title && !this.isTitleValid(updateInfo.title)) throw new Error(INVALID_DESCRIPTION_FORMAT);

        // console.log(await (await this.collection.find({})).toArray());
        // console.log('--------------');
        // console.log(updateInfo);
        // console.log('--------------');
        // const id = new ObjectId(updateInfo.id);
        // console.log(id);
        // console.log(await (await this.collection.find({ _id: id })).toArray());

        // console.log('--------------');

        // await this.collection.updateOne(
        //     // { id_: updateInfo.id, isDefault: { $exists: false } },
        //     // { title: 'title2' },
        //     { id_: id },
        //     // { id_: updateInfo.id },
        //     { $set: { description: updateInfo.description, title: updateInfo.title } },
        // );
        const toUpdate = {};
        toUpdate
        await this.collection.findOneAndUpdate(
            { _id: new ObjectId(updateInfo.id), isDefault: { $exists: false } },
            { $set: { description: updateInfo.description, title: updateInfo.title } },
        );


        // console.log('------modifyresult--------');
        // console.log(modifyResult);

        console.log(await (await this.collection.find({})).toArray());
    }

    private async isTitleValid(data: string): Promise<boolean> {
        return (await this.collection.countDocuments({ title: data })) === 0 && data.length < MAX_DICTIONARY_TITLE_LENGTH;
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

    private async getDbDictionary(id: string): Promise<WithId<DictionaryData>> {
        const dictionaryData = await this.collection.findOne({ _id: new ObjectId(id) });
        if (dictionaryData) return dictionaryData;
        throw new Error(INVALID_DICTIONARY_ID);
    }

    private createDictionaryValidator(): void {
        const ajv = new Ajv();

        ajv.addKeyword({
            keyword: 'isTitleValid',
            async: true,
            type: 'number',
            validate: this.isTitleValid,
        });

        const schema = {
            $async: true,
            type: 'object',
            properties: {
                title: { allOf: [{ maxLength: MAX_DICTIONARY_TITLE_LENGTH }, { type: 'string' }, { isTitleValid: {} }] },
                description: { allOf: [{ maxLength: MAX_DICTIONARY_DESCRIPTION_LENGTH }, { type: 'string' }] },
                words: {
                    type: 'array',
                    items: {
                        type: 'string',
                        transform: ['trim', 'toLowerCase'],
                    },
                },
            },
            required: ['title', 'description', 'words'],
            additionalProperties: false,
        };

        this.dictionaryValidator = ajv.compile(schema);
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
