import { ActionData } from '@app/classes/communication/action-data';
import { Service } from 'typedi';
import fetch, { Response } from 'node-fetch';
import { environment } from '@app/environments/environment';
import { StartGameData } from '@app/classes/game/game-config';
import { GameUpdateData } from '@app/classes/communication/game-update-data';
import Game from '@app/classes/game/game';
import { IS_REQUESTING } from '@app/constants/game';
import { AbstractVirtualPlayer } from '@app/classes/virtual-player/abstract-virtual-player';
import { CONTENT_TYPE, GAME_SHOULD_CONTAIN_ROUND } from '@app/constants/virtual-player-constants';
import Player from '@app/classes/player/player';
import { ActionPass } from '@app/classes/actions';
import { StatusCodes } from 'http-status-codes';

@Service()
export class VirtualPlayerService {
    async sendAction(gameId: string, playerId: string, action: ActionData): Promise<Response> {
        console.log('sendAction');
        console.log(action);
        let response = await this.sendFetchRequest(gameId, playerId, action);
        // If an error occurs at reception of the request, send an ActionPass to prevent server from crashing
        if (response.status !== StatusCodes.NO_CONTENT) {
            response = await this.sendFetchRequest(gameId, playerId, ActionPass.createActionData());
        }
        return response;
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

    private getEndPoint(): string {
        return environment.serverUrl;
    }

    private async sendFetchRequest(gameId: string, playerId: string, action: ActionData): Promise<Response> {
        return fetch(`${this.getEndPoint()}/games/${gameId}/players/${playerId}/action`, {
            method: 'POST',
            headers: { [CONTENT_TYPE]: 'application/json' },
            body: JSON.stringify(action),
        });
    }
}
