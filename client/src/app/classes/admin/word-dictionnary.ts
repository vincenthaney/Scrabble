import { StorableModel } from '@app/classes/admin';

export default class WordDictionnary extends StorableModel {
    name: string;
    description: string;
    isEditable: boolean;
    private words: string[];

    getWords(): string[] {
        return [...this.words];
    }
}
