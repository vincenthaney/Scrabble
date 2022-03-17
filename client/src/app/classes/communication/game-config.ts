import { GameMode } from '@app/classes/game-mode';
import { GameType } from '@app/classes/game-type';
import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';
import { Square } from '@app/classes/square';
import { TileReserveData } from '@app/classes/tile/tile.types';
import { RoundData } from './round-data';
import PlayerData from './player-data';

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
    gameType: GameType;
    maxRoundTime: number;
    dictionary: string;
}

export interface ReadyGameConfig extends GameConfig {
    player2: PlayerData;
}

export interface StartGameData extends ReadyGameConfig {
    gameId: string;
    board: Square[][];
    tileReserve: TileReserveData[];
    round: RoundData;
}

export interface InitializeGameData {
    localPlayerId: string;
    startGameData: StartGameData;
}
