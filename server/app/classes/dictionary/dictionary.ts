import { DictionaryData } from './dictionary-data';
import DictionaryNode from './dictionary-node';

export default class Dictionary extends DictionaryNode {
    title: string;
    description: string;

    constructor(dictionaryData: DictionaryData) {
        super();

        this.title = dictionaryData.title;
        this.description = dictionaryData.description;

        for (const word of dictionaryData.words) {
            this.addWord(word);
        }
    }
}
