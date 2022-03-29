import { Dictionary } from '@app/classes/dictionary';
import { DictionaryDataComplete } from '@app/classes/dictionary/dictionary-data';
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
