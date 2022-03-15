import { DictionaryData } from './dictionary-data';
import DictionaryNode from './dictionary-node';

export default class Dictionary extends DictionaryNode {
    title: string;
    description: string;

    constructor(dictionaryData: DictionaryData) {
        super();

        this.title = dictionaryData.title;
        this.description = dictionaryData.description;

        if (dictionaryData.words.length > 100) throw new Error('Too many words: ' + dictionaryData.words.length);

        for (const word of dictionaryData.words) {
            this.addWord(word);
        }
    }
}
