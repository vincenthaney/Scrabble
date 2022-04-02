/* eslint-disable max-lines */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable dot-notation */
import { DictionaryData } from '@app/classes/dictionary';
import { expect } from 'chai';
import { Container } from 'typedi';
import { join } from 'path';
import * as mock from 'mock-fs';
import { MongoClient } from 'mongodb';
import { ValidateFunction } from 'ajv';
import * as chai from 'chai';
import * as sinon from 'sinon';

import * as chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';
import DatabaseService from '@app/services/database-service/database.service';
import { DatabaseServiceMock } from '@app/services/database-service/database.service.mock.spec';
import { DICTIONARY_PATH } from '@app/constants/dictionary.const';
import { DICTIONARY_1, INITIAL_DICTIONARIES, NEW_INVALID_DICTIONARY, NEW_VALID_DICTIONARY } from './dictionary-test.service.spec';
import DictionaryService from './dictionary.service';
chai.use(chaiAsPromised); // this allows us to test for rejection

// mockPaths must be of type any because keys must be dynamic
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockPaths: any = [];
mockPaths[join(__dirname, DICTIONARY_PATH)] = JSON.stringify(DICTIONARY_1);

describe('DictionaryService', () => {
    let dictionaryService: DictionaryService;
    let databaseService: DatabaseService;
    let client: MongoClient;

    beforeEach(async () => {
        databaseService = Container.get(DatabaseServiceMock) as unknown as DatabaseService;
        client = (await databaseService.connectToServer()) as MongoClient;
        dictionaryService = Container.get(DictionaryService);
        dictionaryService['databaseService'] = databaseService;
        await dictionaryService['collection'].insertMany(INITIAL_DICTIONARIES);
    });

    afterEach(async () => {
        await databaseService.closeConnection();
        chai.spy.restore();
        sinon.restore();
    });

    describe('fetchDefaultDictionary', () => {
        it('should get the default dictionary from JSON', async () => {
            mock(mockPaths);
            const dictionaries = await DictionaryService['fetchDefaultDictionary']();
            mock.restore();
            expect(dictionaries.title).to.deep.equal(DICTIONARY_1.title);
        });
    });

    describe('validateDictionary', () => {
        it('should create the dictionary validator if it was not done before', async () => {
            dictionaryService['dictionaryValidator'] = undefined as unknown as ValidateFunction<{ [x: string]: unknown }>;
            const spyCreate = chai.spy.on(dictionaryService, 'createDictionaryValidator', () => {
                dictionaryService['dictionaryValidator'] = ((x: string) => {
                    return x;
                }) as unknown as ValidateFunction<{ [x: string]: unknown }>;
            });

            await dictionaryService.validateDictionary(DICTIONARY_1);
            expect(spyCreate).to.have.been.called;
        });

        it('should not create the dictionary validator if was done before', async () => {
            dictionaryService['dictionaryValidator'] = dictionaryService['dictionaryValidator'] = ((x: string) => {
                return x;
            }) as unknown as ValidateFunction<{ [x: string]: unknown }>;
            const spyCreate = chai.spy.on(dictionaryService, 'createDictionaryValidator', () => {});

            await dictionaryService.validateDictionary(DICTIONARY_1);
            expect(spyCreate).not.to.have.been.called;
        });
    });

    describe('addNewDictionary', () => {
        it('should throw if the dictionary is not valid ', async () => {
            dictionaryService['dictionaryValidator'] = undefined as unknown as ValidateFunction<{ [x: string]: unknown }>;
            chai.spy.on(dictionaryService, 'validateDictionary', () => false);

            expect(dictionaryService.addNewDictionary({} as unknown as DictionaryData)).to.eventually.be.rejectedWith(Error);
        });

        it('should add the dictionary if the title is unique', async () => {
            chai.spy.on(dictionaryService, 'validateDictionary', () => true);

            await dictionaryService.addNewDictionary(NEW_VALID_DICTIONARY);
            expect((await dictionaryService['collection'].find({}).toArray()).length).to.equal(INITIAL_DICTIONARIES.length + 1);
            expect((await dictionaryService['collection'].find({ title: NEW_VALID_DICTIONARY.title }).toArray())[0].description).to.deep.equal(
                NEW_VALID_DICTIONARY.description,
            );
        });

        it('should not add the dictionary if the title is already present', async () => {
            chai.spy.on(dictionaryService, 'validateDictionary', () => true);

            await dictionaryService.addNewDictionary(NEW_INVALID_DICTIONARY);
            expect((await dictionaryService['collection'].find({}).toArray()).length).to.equal(INITIAL_DICTIONARIES.length);
            expect((await dictionaryService['collection'].find({ title: NEW_INVALID_DICTIONARY.title }).toArray())[0].description).not.to.deep.equal(
                NEW_INVALID_DICTIONARY.description,
            );
        });
    });

    describe('resetDbDictionaries', () => {
        it('should call populateDb if the collection has no default dictionaries ', async () => {
            const spy = chai.spy.on(dictionaryService, 'populateDb', () => {});
            await dictionaryService['collection'].deleteMany({ isDefault: { $exists: true } });
            await dictionaryService.resetDbDictionaries();
            expect(spy).to.have.been.called;
        });

        it('should not call populateDb if the collection has a default dictionary ', async () => {
            const spy = chai.spy.on(dictionaryService, 'populateDb', () => {});
            await dictionaryService.resetDbDictionaries();
            expect(spy).not.to.have.been.called;
        });

        it('should only leave the default dictionary', async () => {
            chai.spy.on(dictionaryService, 'populateDb', () => {});
            await dictionaryService.resetDbDictionaries();
            expect((await dictionaryService['collection'].find({}).toArray()).length).to.equal(1);
            expect((await dictionaryService['collection'].find({}).toArray())[0].title).to.equal(DICTIONARY_1.title);
        });
    });
    describe('Error handling', () => {
        it('should throw an error if we try to access the database on a closed connection', async () => {
            await client.close();
            expect(dictionaryService['getAllDictionarySummaries']()).to.eventually.be.rejectedWith(Error);
        });
    });
});
