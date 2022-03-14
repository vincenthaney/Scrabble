import { Dictionary } from '@app/classes/dictionary';
import { createStubInstance } from 'sinon';
import DictionaryService from './dictionary.service';

const TEST_WORDS = ['ab', 'abc', 'abcd', 'abcde'];
const dictionaryTestService = createStubInstance(DictionaryService, {
    getDictionary: new Dictionary(TEST_WORDS),
}) as unknown as DictionaryService;

export { dictionaryTestService };
