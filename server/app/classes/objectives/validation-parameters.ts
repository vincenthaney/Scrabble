import { ActionData } from '@app/classes/communication/action-data';
import Game from '@app/classes/game/game';
import { Square } from '@app/classes/square';
import { Tile } from '@app/classes/tile';

export interface ValidationParameters {
    actionData: ActionData;
    game: Game;
    scoredPoints: number;
    createdWords: [Square, Tile][][];
}
