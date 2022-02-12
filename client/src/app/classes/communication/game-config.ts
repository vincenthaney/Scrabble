import { GameType } from '@app/classes/game-type';
import { Round } from '@app/classes/round';
import { Square } from '@app/classes/square';
import { TileReserveData } from '@app/classes/tile/tile.types';
import { PlayerData } from './';

export interface GameConfigData {
    playerName: string;
    playerId: string;
    gameType: GameType;
    maxRoundTime: number;
    dictionary: string;
}

export interface SoloGameConfigData extends GameConfigData {
    virtualPlayerName: string;
}

export interface GameConfig {
    player1: PlayerData;
    gameType: GameType;
    maxRoundTime: number;
    dictionary: string;
}

export interface MultiplayerGameConfig extends GameConfig {
    player2: PlayerData;
}

export interface StartMultiplayerGameData extends MultiplayerGameConfig {
    gameId: string;
    board: Square[][];
    tileReserve: TileReserveData[];
    tileReserveTotal: number;
    round: Round;
}
