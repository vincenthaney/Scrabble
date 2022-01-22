import { StorableModel } from '@app/classes/admin/storable-model';

export class HighScore extends StorableModel {
    score: number;
    playerNames: string[];
    constructor(score: number, playerNames: string[]) {
        super();
        throw new Error('Method not implemented.');
    }

    toJSON(): string {
        return super.toJSON();
    }
}
