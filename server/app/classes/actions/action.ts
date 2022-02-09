import Game from '@app/classes/game/game';
import { GameUpdateData } from '@app/classes/communication/game-update-data';
import Player from '@app/classes/player/player';

export default abstract class Action {
    constructor(protected player: Player, protected game: Game) {}

    abstract willEndTurn(): boolean;
    // messageColor: number; // TODO: potentially make a color enum

    abstract execute(): GameUpdateData | void;

    abstract getMessage(): string | undefined;
}
