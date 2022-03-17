import { Dictionary } from '@app/classes/dictionary';
import { createStubInstance } from 'sinon';
import DictionaryService from './dictionary.service';

const TEST_TITLE = 'Test dictionary';
const TEST_WORDS = ['ab', 'abc', 'abcd', 'abcde'];

const getDictionaryTestService = () =>
    createStubInstance(DictionaryService, {
        getDictionary: new Dictionary({
            title: TEST_TITLE,
            description: 'Dictionary for testing',
            words: TEST_WORDS,
        }),
        getDictionaryTitles: [TEST_TITLE],
    }) as unknown as DictionaryService;

export { getDictionaryTestService };
