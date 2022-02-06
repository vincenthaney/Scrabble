import { v4 as uuidv4 } from 'uuid';
import Player from '@app/classes/player/player';
import { GameConfig } from './game-config';

export default class WaitingRoom {
    joinedPlayer?: Player;
    private id: string;
    private config: GameConfig;

    constructor(config: GameConfig) {
        this.id = uuidv4();
        this.config = config;
        this.joinedPlayer = undefined;
    }

    getId() {
        return this.id;
    }

    getConfig() {
        return this.config;
    }
}
