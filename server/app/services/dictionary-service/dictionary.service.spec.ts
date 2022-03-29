/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable dot-notation */
import { Dictionary, DictionaryData } from '@app/classes/dictionary';
import { expect } from 'chai';
import { Container } from 'typedi';
import DictionaryService from './dictionary.service';
import { DICTIONARY_PATHS, INVALID_DICTIONARY_NAME } from '@app/constants/dictionary.const';
import { join } from 'path';
import { SinonStub, stub } from 'sinon';
import * as mock from 'mock-fs';
import { MongoClient } from 'mongodb';
import DatabaseService from '../database-service/database.service';
import { DatabaseServiceMock } from '../database-service/database.service.mock.spec';
import highScoresService from '../high-scores-service/high-scores.service';
import { DICTIONARY_RELATIVE_PATH } from '../words-verification-service/words-verification.service.const';
import { ValidateFunction } from 'ajv';

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

describe('DictionaryService', () => {
    let dictionaryService: DictionaryService;
    let databaseService: DatabaseService;
    let client: MongoClient;

    beforeEach(async () => {
        databaseService = Container.get(DatabaseServiceMock) as unknown as DatabaseService;
        client = (await databaseService.connectToServer()) as MongoClient;
        dictionaryService = Container.get(DictionaryService);
        dictionaryService['databaseService'] = databaseService;
        // await highScoresService['collection'].insertMany(INITIAL_HIGH_SCORES);
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
        it('should create teh dictionary validator if it was not done before', async () => {
            service['dictionaryValidator'] = undefined as unknown as ValidateFunction<{ [x: string]: unknown }>;
            const spy = spy.on(service, 'createDictionaryValidator', () => {});
            service['dictionaryValidator'] = ((x: string) => {
                return x;
            }) as unknown as ValidateFunction<{ [x: string]: unknown }>;

            const highScores = await highScoresService['getHighScores'](GameType.Classic);
            expect(spy).to.have.been.called;
            expect(INITIAL_HIGH_SCORES_CLASSIC).to.deep.equals(highScores);
        });
    });

    let service: DictionaryService;
    let title: string;

    beforeEach(() => {
        mock(mockPaths);
        Container.reset();
        service = Container.get(DictionaryService);
        // title = service.getDictionaryTitles()[0];
    });

    afterEach(() => {
        mock.restore();
    });

    describe('constructor', () => {
        service['coll'];
    });
    // describe('getDictionary', () => {
    //     it('should return dictionary if it exists', () => {
    //         const result = service.getDictionary(title);
    //         expect(result).to.exist;
    //     });

    //     it("should throw if it doesn't exists", () => {
    //         expect(() => service.getDictionary('invalid dictionary')).to.throw(INVALID_DICTIONARY_NAME);
    //     });
    // });

    // describe('getDefaultDictionary', () => {
    //     it('should call getDictionary with first getDictionaryTitles value', () => {
    //         const testTitle = 'test title';
    //         stub(service, 'getDictionaryTitles').returns([testTitle]);
    //         const getDictionaryStub = stub(service, 'getDictionary');

    //         service.getDefaultDictionary();

    //         expect(getDictionaryStub.calledWith(testTitle));
    //     });
    // });

    // describe('addAllDictionaries', () => {
    //     let fetchDictionaryWordsStub: SinonStub;

    //     beforeEach(() => {
    //         service['dictionaryPaths'] = TEST_PATHS;
    //         fetchDictionaryWordsStub = stub<DictionaryService, any>(service, 'fetchDictionaryWords').callsFake((path: string) => {
    //             const index = TEST_PATHS.indexOf(path);
    //             return new Dictionary({ ...TEST_DICTIONARY, title: `dictionary_${index}` });
    //         });
    //     });

    //     it('should call fetchDictionaryWordsStub n times', () => {
    //         service['addAllDictionaries']();

    //         expect(fetchDictionaryWordsStub.callCount).to.equal(TEST_PATHS.length);
    //     });

    //     it('should have n dictionaries in set after', () => {
    //         service['dictionaries'] = new Map();
    //         service['addAllDictionaries']();

    //         expect(service['dictionaries'].size).to.equal(TEST_PATHS.length);
    //     });
    // });

    // describe('fetchDictionaryWords', () => {
    //     it('should return dictionary', () => {
    //         const result = service['fetchDictionaryWords'](DICTIONARY_PATHS[0]);

    //         expect(result).to.exist;
    //     });

    //     it('should return dictionary with words', () => {
    //         const result = service['fetchDictionaryWords'](DICTIONARY_PATHS[0]);

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
