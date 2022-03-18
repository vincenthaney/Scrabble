import { ActionData } from '@app/classes/communication/action-data';
import { Service } from 'typedi';
import fetch from 'node-fetch';
import { environment } from '@app/environments/environment';
import { StartGameData } from '@app/classes/game/game-config';
import { GameUpdateData } from '@app/classes/communication/game-update-data';
import Game from '@app/classes/game/game';
import { IS_REQUESTING } from '@app/constants/game';
import { AbstractVirtualPlayer } from '@app/classes/virtual-player/abstract-virtual-player';
import { CONTENT_TYPE, GAME_SHOULD_CONTAIN_ROUND } from '@app/constants/virtual-player-constants';
import Player from '@app/classes/player/player';

@Service()
export class VirtualPlayerService {
    sendAction(gameId: string, playerId: string, action: ActionData): void {
        fetch(`${environment.serverUrl}/games/${gameId}/players/${playerId}/action`, {
            method: 'POST',
            headers: { [CONTENT_TYPE]: 'application/json' },
            body: JSON.stringify({ type: action.type, payload: action.payload, input: action.input }),
        });
    }

    triggerVirtualPlayerTurn(data: StartGameData | GameUpdateData, game: Game): void {
        if (!data.round) throw new Error(GAME_SHOULD_CONTAIN_ROUND);
        const virtualPlayer = game.getPlayer(data.round.playerData.id, IS_REQUESTING) as AbstractVirtualPlayer;
        virtualPlayer.playTurn();
    }

    sliceVirtualPlayerToPlayer(virtualPlayer: Player): Player {
        const player = new Player(virtualPlayer.id, virtualPlayer.name);
        player.tiles = virtualPlayer.tiles;
        player.isConnected = virtualPlayer.isConnected;
        return player;
    }
}
