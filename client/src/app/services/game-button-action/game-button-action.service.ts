import { Injectable } from '@angular/core';
import { ActionData, ActionType } from '@app/classes/actions/action-data';
import { NO_LOCAL_PLAYER } from '@app/constants/services-errors';
import { GamePlayController } from '@app/controllers/game-play-controller/game-play.controller';
import GameService from '@app/services/game/game.service';

@Injectable({
    providedIn: 'root',
})
export class GameButtonActionService {
    constructor(private gamePlayController: GamePlayController, private gameService: GameService) {}

    createPassAction(): void {
        const actionPass: ActionData = {
            type: ActionType.PASS,
            input: '',
            payload: {},
        };
        const localPlayerId = this.gameService.getLocalPlayerId();
        if (!localPlayerId) throw new Error(NO_LOCAL_PLAYER);
        this.gamePlayController.sendAction(this.gameService.gameId, localPlayerId, actionPass);
    }
}
