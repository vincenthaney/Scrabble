import { IStorableModel } from './istorablemodel';

export class HighScore extends IStorableModel {
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
