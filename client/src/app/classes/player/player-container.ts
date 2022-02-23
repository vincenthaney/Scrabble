import { PlayerData } from '@app/classes/communication';
import { MISSING_PLAYER_DATA_TO_INITIALIZE } from '@app/constants/services-errors';
import AbstractPlayer from './abstract-player';
import Player from './player';

export class PlayerContainer {
    private players: Set<AbstractPlayer>;
    private readonly localPlayerId: string;

    constructor(localPlayerId: string) {
        this.players = new Set();
        this.localPlayerId = localPlayerId;
    }

    getLocalPlayerId(): string {
        return this.localPlayerId;
    }

    getLocalPlayer(): AbstractPlayer | undefined {
        if (!this.getLocalPlayerId()) return undefined;
        const filteredPlayers = [...this.players].filter((p) => p.id === this.getLocalPlayerId());

        return filteredPlayers[0] ? filteredPlayers[0] : undefined;
    }

    initializePlayer(playerData: PlayerData): this {
        if (!playerData.name || !playerData.tiles) throw new Error(MISSING_PLAYER_DATA_TO_INITIALIZE);
        this.addPlayer(new Player(playerData.id, playerData.name, playerData.tiles));
        return this;
    }

    initializePlayers(...playerDatas: PlayerData[]): this {
        playerDatas.forEach((playerData: PlayerData) => this.initializePlayer(playerData));
        return this;
    }

    getPlayer(playerNumber: number): AbstractPlayer {
        return [...this.players][playerNumber - 1];
    }

    addPlayer(player: AbstractPlayer): this {
        this.players.add(player);
        return this;
    }

    removePlayer(player: AbstractPlayer): this {
        this.players.delete(player);
        return this;
    }

    resetPlayers(): this {
        this.players.clear();
        return this;
    }

    updatePlayersData(...playerDatas: PlayerData[]): this {
        playerDatas.forEach((playerData: PlayerData) => {
            [...this.players].filter((p: AbstractPlayer) => p.id === playerData.id).map((p: AbstractPlayer) => p.updatePlayerData(playerData));
        });
        return this;
    }
}
