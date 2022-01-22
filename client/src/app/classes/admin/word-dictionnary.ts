import { IStorableModel } from './istorablemodel';

export class WordDictionnary implements IStorableModel {
    name: string;
    description: string;
    isEditable: boolean;
    private words: string[];

    getWords(): string[] {
        return this.words;
    }

    toJSON(): string {
        return '';
    }
}
