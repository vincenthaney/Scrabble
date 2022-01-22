import { StorableModel } from '@app/classes/admin/storable-model';

export class WordDictionnary extends StorableModel {
    name: string;
    description: string;
    isEditable: boolean;
    private words: string[];

    constructor(name: string, description: string, isEditable: boolean, words: string[]) {
        super();
        throw new Error('Method not implemented.');
    }

    getWords(): string[] {
        return [...this.words];
    }

    toJSON(): string {
        return super.toJSON();
    }
}
