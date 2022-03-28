import { DictionaryData } from './dictionary-data';
import DictionaryNode from './dictionary-node';

export default class Dictionary extends DictionaryNode {
    title: string;
    description: string;
    id: string;

    constructor(dictionaryData: DictionaryData) {
        super();

        this.title = dictionaryData.title;
        this.id = dictionaryData._id;
        this.description = dictionaryData.description;
        this.depth = -1;

        for (const word of dictionaryData.words) {
            this.addWord(word);
        }
    }
}


