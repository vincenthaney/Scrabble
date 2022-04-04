/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable dot-notation */
import { Dictionary, DictionaryData } from '@app/classes/dictionary';
import { assert, expect } from 'chai';
import { Container } from 'typedi';
import { MongoClient, ObjectId, WithId } from 'mongodb';
import * as chai from 'chai';
import * as sinon from 'sinon';

import * as chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';
import DatabaseService from '@app/services/database-service/database.service';
import { DatabaseServiceMock } from '@app/services/database-service/database.service.mock.spec';
import { INVALID_DICTIONARY_ID } from '@app/constants/dictionary.const';
import { stub } from 'sinon';
import {
    ADDITIONNAL_PROPERTY_DICTIONARY,
    DICTIONARY_1,
    DICTIONARY_1_ID,
    DICTIONARY_2,
    DICTIONARY_3,
    INITIAL_DICTIONARIES,
    INVALID_ARRAY_TYPES_DICTIONARY,
    INVALID_TYPES_DICTIONARY,
    INVALID_WORDS_DICTIONARY_1,
    INVALID_WORDS_DICTIONARY_2,
    INVALID_WORDS_DICTIONARY_3,
    INVALID_WORDS_DICTIONARY_4,
    INVALID_WORDS_DICTIONARY_5,
    INVALID_WORDS_DICTIONARY_6,
    LONG_TITLE_DICTIONARY,
    MISSING_PROPERTY_DICTIONARY,
    SAME_TITLE_DICTIONARY,
    VALID_DICTIONARY,
} from './dictionary-test.service.spec';
import { BasicDictionaryData, DictionaryUpdateInfo, DictionaryUsage } from '@app/classes/communication/dictionary-data';
import DictionaryService from './dictionary.service';
chai.use(chaiAsPromised); // this allows us to test for rejection

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

    describe('getAllDictionarySummaries', () => {
        it('should return the list with only the wanted attributes', async () => {
            const result = await dictionaryService.getAllDictionarySummaries();
            expect(result.length).to.equal(INITIAL_DICTIONARIES.length);
            expect(result[0].description).to.equal(INITIAL_DICTIONARIES[0].description);
        });
    });

    describe('deleteDictionary', () => {
        it('should delete the dictionary if it is not the default one', async () => {
            const dictToGet: WithId<DictionaryData> = (await dictionaryService['collection'].find({ title: DICTIONARY_2.title }).toArray())[0];

            await dictionaryService.deleteDictionary(dictToGet._id.toString());
            expect((await dictionaryService['collection'].find({}).toArray()).length).to.equal(2);
            expect((await dictionaryService['collection'].find({ title: DICTIONARY_2.title }).toArray()).length).to.equal(0);
        });

        it('should not delete the dictionary if it is the default one', async () => {
            const dictToGet: WithId<DictionaryData> = (await dictionaryService['collection'].find({ title: DICTIONARY_1.title }).toArray())[0];

            await dictionaryService.deleteDictionary(dictToGet._id.toString());
            expect((await dictionaryService['collection'].find({}).toArray()).length).to.equal(3);
            expect((await dictionaryService['collection'].find({ title: DICTIONARY_1.title }).toArray()).length).to.equal(1);
        });
    });

    describe('updateDictionary', () => {
        it('should update the dictionary if it is not a default one and legal', async () => {
            const dictToModify: WithId<DictionaryData> = (await dictionaryService['collection'].find({ title: DICTIONARY_2.title }).toArray())[0];
            const updateInfo: DictionaryUpdateInfo = { id: dictToModify._id.toString(), description: 'modifieddescription', title: 'modifiedTitle' };

            await dictionaryService.updateDictionary(updateInfo);

            const result: WithId<DictionaryData> = (await dictionaryService['collection'].find({ _id: dictToModify._id }).toArray())[0];

            expect(result.title).to.equal(updateInfo.title);
            expect(result.description).to.equal(updateInfo.description);
            expect(result._id).to.deep.equal(dictToModify._id);
        });

        it('should update the dictionary if it is not a default one and legal (only new title)', async () => {
            const dictToModify: WithId<DictionaryData> = (await dictionaryService['collection'].find({ title: DICTIONARY_2.title }).toArray())[0];
            const updateInfo: DictionaryUpdateInfo = { id: dictToModify._id.toString(), title: 'modifiedTitle' };

            await dictionaryService.updateDictionary(updateInfo);
            const result: WithId<DictionaryData> = (await dictionaryService['collection'].find({ _id: dictToModify._id }).toArray())[0];

            expect(result.title).to.equal(updateInfo.title);
            expect(result.description).to.equal(DICTIONARY_2.description);
            expect(result._id).to.deep.equal(dictToModify._id);
        });

        it('should update the dictionary if it is not a default one and legal (only new description)', async () => {
            const dictToModify: WithId<DictionaryData> = (await dictionaryService['collection'].find({ title: DICTIONARY_2.title }).toArray())[0];
            const updateInfo: DictionaryUpdateInfo = { id: dictToModify._id.toString(), description: 'modifiedDescription' };

            await dictionaryService.updateDictionary(updateInfo);
            const result: WithId<DictionaryData> = (await dictionaryService['collection'].find({ _id: dictToModify._id }).toArray())[0];

            expect(result.title).to.equal(DICTIONARY_2.title);
            expect(result.description).to.equal(updateInfo.description);
            expect(result._id).to.deep.equal(dictToModify._id);
        });

        it('should not update the dictionary if it is a default one and legal', async () => {
            const dictToModify: WithId<DictionaryData> = (await dictionaryService['collection'].find({ title: DICTIONARY_1.title }).toArray())[0];

            const updateInfo: DictionaryUpdateInfo = { id: dictToModify._id.toString(), description: 'modifieddescription', title: 'modifiedTitle' };
            await dictionaryService.updateDictionary(updateInfo);
            const result: WithId<DictionaryData> = (await dictionaryService['collection'].find({ _id: dictToModify._id }).toArray())[0];

            expect(result.title).to.equal(DICTIONARY_1.title);
            expect(result.description).to.equal(DICTIONARY_1.description);
            expect(result._id).to.deep.equal(dictToModify._id);
        });

        it('should throw if the data is invalid (description)', async () => {
            const dictToModify: WithId<DictionaryData> = (await dictionaryService['collection'].find({ title: DICTIONARY_2.title }).toArray())[0];
            chai.spy.on(dictionaryService, 'isDescriptionValid', () => false);
            const updateInfo: DictionaryUpdateInfo = { id: dictToModify._id.toString(), description: 'modifieddescription' };
            expect(dictionaryService.updateDictionary(updateInfo)).to.eventually.be.rejectedWith(Error);
        });

        it('should throw if the data is invalid (title)', async () => {
            const dictToModify: WithId<DictionaryData> = (await dictionaryService['collection'].find({ title: DICTIONARY_2.title }).toArray())[0];
            chai.spy.on(dictionaryService, 'isTitleValid', () => false);
            const updateInfo: DictionaryUpdateInfo = { id: dictToModify._id.toString(), title: 'modifiedTitle' };
            expect(dictionaryService.updateDictionary(updateInfo)).to.eventually.be.rejectedWith(Error);
        });
    });

    describe('isTitleValid', () => {
        it('should return true if the title is unique and short', async () => {
            expect(await dictionaryService['isTitleValid']('uniquetitle')).to.be.true;
        });
        it('should return false if the title is not unique and short', async () => {
            expect(await dictionaryService['isTitleValid'](DICTIONARY_3.title)).to.be.false;
        });

        it('should return false if the title is unique and long', async () => {
            expect(await dictionaryService['isTitleValid']('uniquqweqweqweqweqweqwewqqweetitle')).to.be.false;
        });
    });

    describe('isDescriptionValid', () => {
        it('should return true if the description is short', () => {
            expect(dictionaryService['isDescriptionValid']('shortdescription')).to.be.true;
        });

        it('should return false if the description is unique and long', () => {
            expect(
                dictionaryService['isDescriptionValid'](
                    `uniquqweqweqweqweqweqwewqqweedescriptionsdaofhdsfjsdhfosdhfosdfhsdohfsdhifoihsdfhiosdhiofsdihfhidsiohf
                    hdsifhisdoihfhdsifihodsihfhisdhiofsdih`,
                ),
            ).to.be.false;
        });
    });

    describe('populateDb', () => {
        it('should call databaseService.populateDb and fetchDefaultDictionary', async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/consistent-type-assertions
            const spyFetchDefaultHighScores = stub(DictionaryService, <any>'fetchDefaultDictionary').callsFake(() => {});
            const spyPopulateDb = chai.spy.on(dictionaryService['databaseService'], 'populateDb', () => {});
            await dictionaryService['populateDb']();
            expect(spyPopulateDb).to.have.been.called;
            assert(spyFetchDefaultHighScores.calledOnce);
            sinon.restore();
        });
    });

    describe('getDbDictionary', () => {
        it('should return the wanted dictionary with a valid id', async () => {
            const dictToGet: WithId<DictionaryData> = (await dictionaryService['collection'].find({ title: DICTIONARY_2.title }).toArray())[0];

            const result = await dictionaryService['getDbDictionary'](dictToGet._id.toString());
            expect(result.title).to.equal(DICTIONARY_2.title);
            expect(result.description).to.equal(DICTIONARY_2.description);
        });

        it('should throw with am invalid id', async () => {
            expect(dictionaryService['getDbDictionary'](new ObjectId().toString())).to.eventually.be.rejectedWith(Error);
        });
    });

    describe('createDictionaryValidator', () => {
        const dictionariesToTest: [BasicDictionaryData, boolean, string][] = [
            [VALID_DICTIONARY, true, 'VALID_DICTIONARY'],
            [INVALID_TYPES_DICTIONARY, false, 'INVALID_TYPES_DICTIONARY'],
            [LONG_TITLE_DICTIONARY, false, 'LONG_TITLE_DICTIONARY'],
            [MISSING_PROPERTY_DICTIONARY, false, 'MISSING_PROPERTY_DICTIONARY'],
            [SAME_TITLE_DICTIONARY, false, 'SAME_TITLE_DICTIONARY'],
            [INVALID_ARRAY_TYPES_DICTIONARY, false, 'INVALID_ARRAY_TYPES_DICTIONARY'],
            [ADDITIONNAL_PROPERTY_DICTIONARY, false, 'ADDITIONNAL_PROPERTY_DICTIONARY'],
            [INVALID_WORDS_DICTIONARY_1, false, 'INVALID_WORDS_DICTIONARY_1'],
            [INVALID_WORDS_DICTIONARY_2, false, 'INVALID_WORDS_DICTIONARY_2'],
            [INVALID_WORDS_DICTIONARY_3, false, 'INVALID_WORDS_DICTIONARY_3'],
            [INVALID_WORDS_DICTIONARY_4, false, 'INVALID_WORDS_DICTIONARY_4'],
            [INVALID_WORDS_DICTIONARY_5, false, 'INVALID_WORDS_DICTIONARY_5'],
            [INVALID_WORDS_DICTIONARY_6, false, 'INVALID_WORDS_DICTIONARY_6'],
        ];
        const DICTIONARY = 0;
        const EXPECTED = 1;
        const TEST_DESCRIPTION = 2;

        for (const test of dictionariesToTest) {
            it(`should return ${test[EXPECTED]} for a ${test[TEST_DESCRIPTION]}`, async () => {
                expect(await dictionaryService['validateDictionary'](test[DICTIONARY])).to.equal(test[EXPECTED]);
            });
        }
    });

    describe('useDictionary', () => {
        const BASE_DICTIONARY_USAGE: DictionaryUsage = { dictionary: {} as unknown as Dictionary, numberOfActiveGames: 1 };
        const BASE_DICTIONARY_ID = 'id1';
        beforeEach(() => {
            dictionaryService['activeDictionaries'].set(BASE_DICTIONARY_ID, BASE_DICTIONARY_USAGE);
        });

        it('should increment the number of active games and return the correct dictionary', async () => {
            const spy = chai.spy.on(dictionaryService, 'getDbDictionary', () => {
                return {} as unknown as DictionaryData;
            });

            expect(await dictionaryService.useDictionary(BASE_DICTIONARY_ID)).to.deep.equal(BASE_DICTIONARY_USAGE);
            expect(BASE_DICTIONARY_USAGE.numberOfActiveGames).to.equal(2);
            expect(dictionaryService['activeDictionaries'].size).to.equal(1);
            expect(spy).not.to.have.called();
        });

        it('should create a new dictionary and add it to the map ', async () => {
            const spy = chai.spy.on(dictionaryService, 'getDbDictionary', () => {
                return DICTIONARY_1;
            });

            const result = await dictionaryService.useDictionary(DICTIONARY_1_ID);

            expect(result.dictionary.summary.id).to.equal(DICTIONARY_1_ID);
            expect(result.dictionary.summary.title).to.equal(DICTIONARY_1.title);
            expect(result.numberOfActiveGames).to.equal(1);
            expect(dictionaryService['activeDictionaries'].size).to.equal(2);
            expect(dictionaryService['activeDictionaries'].get(DICTIONARY_1_ID)).to.deep.equal(result);

            expect(spy).to.have.called();
        });
    });

    describe('getDictionary', () => {
        const BASE_DICTIONARY_ID = 'id1';
        const BASE_DICTIONARY_USAGE: DictionaryUsage = {
            dictionary: { summary: { id: BASE_DICTIONARY_ID } } as unknown as Dictionary,
            numberOfActiveGames: 1,
        };
        beforeEach(() => {
            dictionaryService['activeDictionaries'].set(BASE_DICTIONARY_ID, BASE_DICTIONARY_USAGE);
        });

        it('should return the dictionary if it exists', () => {
            expect(dictionaryService.getDictionary(BASE_DICTIONARY_ID)).to.deep.equal(BASE_DICTIONARY_USAGE.dictionary);
        });

        it('should throw if the dictionaryId is not a key of the map', () => {
            const result = () => dictionaryService.getDictionary('allo');
            expect(result).to.throw(INVALID_DICTIONARY_ID);
        });
    });

    describe('stopUsingDictionary', () => {
        const BASE_DICTIONARY_ID = 'id1';
        const BASE_DICTIONARY_USAGE: DictionaryUsage = {
            dictionary: { summary: { id: BASE_DICTIONARY_ID } } as unknown as Dictionary,
            numberOfActiveGames: 1,
        };
        beforeEach(() => {
            dictionaryService['activeDictionaries'].clear();
            dictionaryService['activeDictionaries'].set(BASE_DICTIONARY_ID, BASE_DICTIONARY_USAGE);
        });

        it('should delete a dictionary that had 1 active game', () => {
            dictionaryService.stopUsingDictionary(BASE_DICTIONARY_ID);
            expect(dictionaryService['activeDictionaries'].size).to.equal(0);
        });

        it('should decrement a dictionary that had more than 1 active game', () => {
            BASE_DICTIONARY_USAGE.numberOfActiveGames = 3;
            dictionaryService.stopUsingDictionary(BASE_DICTIONARY_ID);
            expect(BASE_DICTIONARY_USAGE.numberOfActiveGames).to.equal(2);
            dictionaryService.stopUsingDictionary(BASE_DICTIONARY_ID);
            expect(BASE_DICTIONARY_USAGE.numberOfActiveGames).to.equal(1);
        });

        it('should not do anything if the dictionaryId is not a key of the map', () => {
            dictionaryService.stopUsingDictionary('BASE_DICTIONARY_ID');
            expect(BASE_DICTIONARY_USAGE.numberOfActiveGames).to.equal(1);
        });
    });

    describe('Error handling', () => {
        it('should throw an error if we try to access the database on a closed connection', async () => {
            await client.close();
            expect(dictionaryService['getAllDictionarySummaries']()).to.eventually.be.rejectedWith(Error);
        });
    });
});
