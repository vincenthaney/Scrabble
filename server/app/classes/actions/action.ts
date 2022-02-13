import Game from '@app/classes/game/game';
import { GameUpdateData } from '@app/classes/communication/game-update-data';
import Player from '@app/classes/player/player';

export default abstract class Action {
    constructor(protected player: Player, protected game: Game) {}

    getOpponentMessage(): string | undefined {
        return this.getMessage();
    }

    abstract willEndTurn(): boolean;

    abstract execute(): GameUpdateData | void;

    abstract getMessage(): string | undefined;
}
