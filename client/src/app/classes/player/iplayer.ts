import { PlayerData } from '@app/classes/communication/player-data';
import { Tile } from '@app/classes/tile';
export default abstract class IPlayer {
    id: string;
    name: string;
    score: number;
    tiles: Tile[];

    constructor(name: string) {
        this.name = name;
        this.score = 0;
    }

    updatePlayerData(playerData: PlayerData): void {
        this.id = playerData.id ? playerData.id : this.id;
        this.name = playerData.name ? playerData.name : this.name;
        this.score = playerData.score ? playerData.score : this.score;
        this.tiles = playerData.tiles ? playerData.tiles : this.tiles;
    }
}
