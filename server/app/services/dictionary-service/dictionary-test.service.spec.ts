import { Dictionary } from '@app/classes/dictionary';
import { DictionaryData, DictionaryDataComplete } from '@app/classes/dictionary/dictionary-data';
import { createStubInstance } from 'sinon';
import DictionaryService from './dictionary.service';

const TEST_TITLE = 'Test dictionary';
const TEST_WORDS = ['ab', 'abc', 'abcd', 'abcde'];
const DEFAULT_DICTIONARY: DictionaryDataComplete = {
    title: TEST_TITLE,
    description: 'Dictionary for testing',
    words: TEST_WORDS,
    id: 'id',
};

const getDictionaryTestService = () =>
    createStubInstance(DictionaryService, {
        getDictionary: new Dictionary(DEFAULT_DICTIONARY),
        // getDictionaryTitles: [TEST_TITLE],
        // getDefaultDictionary: new Dictionary(DEFAULT_DICTIONARY),
    }) as unknown as DictionaryService;

export { getDictionaryTestService };

export const DICTIONARY_1: DictionaryData = {
    title: 'title1',
    description: 'description1',
    words: ['word11', 'word12'],
    isDefault: true,
};

export const DICTIONARY_1_ID = 'id-dictionary1';

export const DICTIONARY_2: DictionaryData = {
    title: 'title2',
    description: 'description2',
    words: ['word21', 'word22'],
};

export const DICTIONARY_3: DictionaryData = {
    title: 'title3',
    description: 'description3',
    words: ['word31', 'word32'],
};

export const INITIAL_DICTIONARIES: DictionaryData[] = [DICTIONARY_1, DICTIONARY_2, DICTIONARY_3];

export const NEW_VALID_DICTIONARY: DictionaryData = {
    title: 'newtitle',
    description: 'newdescription',
    words: ['newword1', 'newword2'],
};

export const NEW_INVALID_DICTIONARY: DictionaryData = {
    title: DICTIONARY_2.title,
    description: 'newdescription',
    words: ['newword1', 'newword2'],
};

export const VALID_DICTIONARY: DictionaryData = {
    title: 'validUniqueTitle',
    description: 'valid Desicrition',
    words: ['aa', 'zythums'],
};

export const SAME_TITLE_DICTIONARY: DictionaryData = {
    title: 'title1',
    description: 'valid Desicrition',
    words: ['aa', 'zythums'],
};

export const MISSING_PROPERTY_DICTIONARY: DictionaryData = {
    description: 'valid Desicrition',
    words: ['aa', 'zythums'],
} as unknown as DictionaryData;

export const LONG_TITLE_DICTIONARY: DictionaryData = {
    title: 'title is very longggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg',
    description: 'valid Desicrition',
    words: ['aa', 'zythums'],
};

export const INVALID_TYPES_DICTIONARY: DictionaryData = {
    title: ['validUniqueTitle'],
    description: 123,
    words: ['aa', 'zythums'],
} as unknown as DictionaryData;

export const INVALID_ARRAY_TYPES_DICTIONARY: DictionaryData = {
    title: 'validUniqueTitle',
    description: 'valid Desicrition',
    words: [1, [], true],
} as unknown as DictionaryData;

export const ADDITIONNAL_PROPERTY_DICTIONARY: DictionaryData = {
    title: 'validUniqueTitle',
    description: 'valid Desicrition',
    words: ['aa', 'zythums'],
    isDefault: true,
};

export const INVALID_WORDS_DICTIONARY_1: DictionaryData = {
    title: 'validUniqueTitle',
    description: 'valid Desicrition',
    words: [' s '],
};

export const INVALID_WORDS_DICTIONARY_2: DictionaryData = {
    title: 'validUniqueTitle',
    description: 'valid Desicrition',
    words: ['école'],
};

export const INVALID_WORDS_DICTIONARY_3: DictionaryData = {
    title: 'validUniqueTitle',
    description: 'valid Desicrition',
    words: ["l'a!"],
};

export const INVALID_WORDS_DICTIONARY_4: DictionaryData = {
    title: 'validUniqueTitle',
    description: 'valid Desicrition',
    words: ['MAJUSCULE'],
};

export const INVALID_WORDS_DICTIONARY_5: DictionaryData = {
    title: 'validUniqueTitle',
    description: 'valid Desicrition',
    words: ['troplongggggggggggggggggg'],
};

export const INVALID_WORDS_DICTIONARY_6: DictionaryData = {
    title: 'validUniqueTitle',
    description: 'valid Desicrition',
    words: ['a'],
};
