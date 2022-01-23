import { StorableModel } from '@app/classes/admin';

export default class HighScore extends StorableModel {
    score: number;
    playerNames: string[];
    constructor(score: number, playerNames: string[]) {
        super();
        throw new Error('Method not implemented.');
    }

