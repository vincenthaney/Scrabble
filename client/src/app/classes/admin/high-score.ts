import { StorableModel } from '@app/classes/admin';

export default class HighScore extends StorableModel {
    score: number;
    playerNames: string[];
}
