import DictionaryNode from './dictionary-node';

export default class Dictionary extends DictionaryNode {
    constructor(words: string[]) {
        super();

        for (const word of words) {
            this.addWord(word);
        }
    }
}
