import DictionaryNode from './dictionary-node';

export default class Dictionary extends DictionaryNode {
    constructor(words: string[]) {
        super();

        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        console.log('CREATED DICT WITH WORDS', words.length, words.slice(0, 6));

        for (const word of words) {
            this.addWord(word);
        }
    }
}
