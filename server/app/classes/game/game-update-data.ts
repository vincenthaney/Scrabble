import { Square } from '@app/classes/board';
import { Tile } from '@app/classes/tile';

export interface PlayerData {
    score?: number;
    tiles?: Tile[];
}

// TODO: How to make it different depending on player for some actions
export interface MessageData {
    message: string;
    color: number;
}

export interface GameUpdateData {
    playerId: string;
    player?: PlayerData;
    isGameOver?: boolean;
    board?: (Square | undefined)[][];
    message: MessageData;
}
