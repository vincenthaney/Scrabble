import { RoundData } from '@app/classes/communication/round-data';
import { GameMode } from '@app/classes/game/game-mode';
import { GameType } from '@app/classes/game/game-type';
import Player from '@app/classes/player/player';
import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';
import { Square } from '@app/classes/square';
import { TileReserveData } from '@app/classes/tile/tile.types';
import { DictionarySummary } from '@app/services/dictionary-service/dictionary.service';

export interface GameConfigData {
    playerName: string;
    playerId: string;
    gameType: GameType;
    gameMode: GameMode;
    maxRoundTime: number;
    dictionary: DictionarySummary;
    virtualPlayerName?: string;
    virtualPlayerLevel?: VirtualPlayerLevel;
}

export interface GameConfig {
    player1: Player;
    gameType: GameType;
    maxRoundTime: number;
    dictionary: DictionarySummary;
}

export interface ReadyGameConfig extends GameConfig {
    player2: Player;
}

export interface StartGameData extends ReadyGameConfig {
    gameId: string;
    board: Square[][];
    tileReserve: TileReserveData[];
    round: RoundData;
}
