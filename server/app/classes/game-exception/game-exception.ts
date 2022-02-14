import { GameExceptionType } from '@app/constants/game';

export class GameException extends Error {
    constructor(type: GameExceptionType, public description: string) {
        super(type);
    }
}
