import { DictionarySummary } from '@app/services/dictionary-service/dictionary.service';
import { DictionaryDataComplete } from './dictionary-data';
import DictionaryNode from './dictionary-node';

export default class Dictionary extends DictionaryNode {
    summary: DictionarySummary;

    constructor(dictionaryData: DictionaryDataComplete) {
        super();

        this.summary = { title: dictionaryData.title, id: dictionaryData.id, description: dictionaryData.description };
        this.depth = -1;

        for (const word of dictionaryData.words) {
            this.addWord(word);
        }
    }
}
