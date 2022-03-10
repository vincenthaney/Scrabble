import { GameMode } from '@app/classes/game-mode';
import { GameType } from '@app/classes/game-type';
import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';
import { Square } from '@app/classes/square';
import { TileReserveData } from '@app/classes/tile/tile.types';
import { PlayerData } from './';
import { RoundData } from './round-data';

export interface GameConfigData {
    playerName: string;
    playerId: string;
    gameType: GameType;
    gameMode: GameMode;
    maxRoundTime: number;
    dictionary: string;
    virtualPlayerName?: string;
    virtualPlayerLevel?: VirtualPlayerLevel;
}

export interface GameConfig {
    player1: PlayerData;
    player2: PlayerData;
    gameType: GameType;
    maxRoundTime: number;
    dictionary: string;
}

export interface StartGameData extends GameConfig {
    gameId: string;
    board: Square[][];
    tileReserve: TileReserveData[];
    tileReserveTotal: number;
    round: RoundData;
}
