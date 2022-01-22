import { IStorableModel } from './istorablemodel';

export class HighScore implements IStorableModel {
    score: number;
    playerNames: string[];
    toJSON(): string {
        return '';
    }
}
