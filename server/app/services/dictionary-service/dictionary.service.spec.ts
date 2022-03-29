/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable dot-notation */
import { DictionaryData } from '@app/classes/dictionary';
import { expect } from 'chai';
import { Container } from 'typedi';
import DictionaryService from './dictionary.service';
import { join } from 'path';
import * as mock from 'mock-fs';
import { MongoClient } from 'mongodb';
import { ValidateFunction } from 'ajv';
import * as chai from 'chai';

import * as chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';
import DatabaseService from '@app/services/database-service/database.service';
import { DatabaseServiceMock } from '@app/services/database-service/database.service.mock.spec';
import { DICTIONARY_RELATIVE_PATH } from '@app/services/words-verification-service/words-verification.service.const';
chai.use(chaiAsPromised); // this allows us to test for rejection

const DICTIONARY_1: DictionaryData = {
    title: 'title1',
    description: 'description1',
    words: ['word11', 'word12'],
    isDefault: true,
};

const DICTIONARY_2: DictionaryData = {
    title: 'title2',
    description: 'description2',
    words: ['word21', 'word22'],
};

const DICTIONARY_3: DictionaryData = {
    title: 'title3',
    description: 'description3',
    words: ['word31', 'word32'],
};

const INITIAL_DICTIONARIES: DictionaryData[] = [DICTIONARY_1, DICTIONARY_2, DICTIONARY_3];

// const mockInitialDictionaries: DictionaryData = {
//     highScores: INITIAL_DICTIONARIES,
// };

// mockPaths must be of type any because keys must be dynamic
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockPaths: any = [];
mockPaths[join(__dirname, DICTIONARY_RELATIVE_PATH)] = JSON.stringify(INITIAL_DICTIONARIES);

// const TEST_DICTIONARY_NAME = 'TEST_DICTIONARY';
// const TEST_DICTIONARY: DictionaryData = {
//     title: TEST_DICTIONARY_NAME,
//     description: '',
//     words: ['abc', 'abcd', 'abcde'],
// };
// const TEST_PATHS = ['../data/dictionary-french.json', '../data/dictionary-english.json', '../data/dictionary-spanish.json'];

// mockPaths must be of type any because keys must be dynamic
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// const mockPaths: any = [];
// for (const path of DICTIONARY_PATHS) {
//     mockPaths[join(__dirname, path)] = JSON.stringify(TEST_DICTIONARY);
// }

describe.only('DictionaryService', () => {
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
    });

    describe('fetchDefaultDictionary', () => {
        it('should get all courses from JSON', async () => {
            mock(mockPaths);
            const dictionaries = await DictionaryService['fetchDefaultDictionary']();
            mock.restore();
            expect(dictionaries.length).to.equal(INITIAL_DICTIONARIES.length);
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

            const spyValidator = chai.spy.on(dictionaryService, 'dictionaryValidator', () => {});
            await dictionaryService.validateDictionary(DICTIONARY_1);
            expect(spyCreate).to.have.been.called;
            expect(spyValidator).to.have.been.called;
        });

        it('should create the dictionary validator if it was not done before', async () => {
            dictionaryService['dictionaryValidator'] = undefined as unknown as ValidateFunction<{ [x: string]: unknown }>;
            const spyCreate = chai.spy.on(dictionaryService, 'createDictionaryValidator', () => {
                dictionaryService['dictionaryValidator'] = ((x: string) => {
                    return x;
                }) as unknown as ValidateFunction<{ [x: string]: unknown }>;
            });

            const spyValidator = chai.spy.on(dictionaryService, 'dictionaryValidator', () => {});
            await dictionaryService.validateDictionary(DICTIONARY_1);
            expect(spyCreate).to.have.been.called;
            expect(spyValidator).to.have.been.called;
        });
    });

    // describe('validateDictionary', () => {
    //     it('should create the dictionary validator if it was not done before', async () => {
    //         dictionaryService['dictionaryValidator'] = undefined as unknown as ValidateFunction<{ [x: string]: unknown }>;
    //         const spyCreate = chai.spy.on(dictionaryService, 'createDictionaryValidator', () => {
    //             dictionaryService['dictionaryValidator'] = ((x: string) => {
    //                 return x;
    //             }) as unknown as ValidateFunction<{ [x: string]: unknown }>;
    //         });

    //         const spyValidator = chai.spy.on(dictionaryService, 'dictionaryValidator', () => {});
    //         await dictionaryService.validateDictionary(DICTIONARY_1);
    //         expect(spyCreate).to.have.been.called;
    //         expect(spyValidator).to.have.been.called;
    //     });
    // });



    // beforeEach(() => {
    //     mock(mockPaths);
    //     Container.reset();
    //     dictionaryService = Container.get(DictionaryService);
    //     // title = dictionaryService.getDictionaryTitles()[0];
    // });

    // afterEach(() => {
    //     mock.restore();
    // });

    // describe('constructor', () => {
    //     dictionaryService['coll'];
    // });
    // describe('getDictionary', () => {
    //     it('should return dictionary if it exists', () => {
    //         const result = dictionaryService.getDictionary(title);
    //         expect(result).to.exist;
    //     });

    //     it("should throw if it doesn't exists", () => {
    //         expect(() => dictionaryService.getDictionary('invalid dictionary')).to.throw(INVALID_DICTIONARY_NAME);
    //     });
    // });

    // describe('getDefaultDictionary', () => {
    //     it('should call getDictionary with first getDictionaryTitles value', () => {
    //         const testTitle = 'test title';
    //         stub(dictionaryService, 'getDictionaryTitles').returns([testTitle]);
    //         const getDictionaryStub = stub(dictionaryService, 'getDictionary');

    //         dictionaryService.getDefaultDictionary();

    //         expect(getDictionaryStub.calledWith(testTitle));
    //     });
    // });

    // describe('addAllDictionaries', () => {
    //     let fetchDictionaryWordsStub: SinonStub;

    //     beforeEach(() => {
    //         dictionaryService['dictionaryPaths'] = TEST_PATHS;
    //         fetchDictionaryWordsStub = stub<DictionaryService, any>(dictionaryService, 'fetchDictionaryWords').callsFake((path: string) => {
    //             const index = TEST_PATHS.indexOf(path);
    //             return new Dictionary({ ...TEST_DICTIONARY, title: `dictionary_${index}` });
    //         });
    //     });

    //     it('should call fetchDictionaryWordsStub n times', () => {
    //         dictionaryService['addAllDictionaries']();

    //         expect(fetchDictionaryWordsStub.callCount).to.equal(TEST_PATHS.length);
    //     });

    //     it('should have n dictionaries in set after', () => {
    //         dictionaryService['dictionaries'] = new Map();
    //         dictionaryService['addAllDictionaries']();

    //         expect(dictionaryService['dictionaries'].size).to.equal(TEST_PATHS.length);
    //     });
    // });

    // describe('fetchDictionaryWords', () => {
    //     it('should return dictionary', () => {
    //         const result = dictionaryService['fetchDictionaryWords'](DICTIONARY_PATHS[0]);

    //         expect(result).to.exist;
    //     });

    //     it('should return dictionary with words', () => {
    //         const result = dictionaryService['fetchDictionaryWords'](DICTIONARY_PATHS[0]);

    //         for (const word of TEST_DICTIONARY.words) {
    //             expect(result.wordExists(word)).to.be.true;
    //         }
    //     });
    // });

    describe('Error handling', async () => {
        it('should throw an error if we try to access the database on a closed connection', async () => {
            await client.close();
            expect(dictionaryService['getDictionarySummaryTitles']()).to.eventually.be.rejectedWith(Error);
        });
    });
});
