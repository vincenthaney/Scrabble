import { expect } from 'chai';
import { GamePlayService } from '@app/services/game-play-service/game-play.service';
import { ActionData } from '@app/classes/communication/action-data';

const DEFAULT_GAME_ID = 'gameId';
const DEFAULT_PLAYER_ID = 'playerId';
const DEFAULT_ACTION: ActionData = { type: 'exchange', payload: {} };

describe('GamePlayService', () => {
    let gamePlayService: GamePlayService;

    beforeEach(() => {
        gamePlayService = new GamePlayService();
    });

    describe('playAction', () => {
        it('is not implemented', () => {
            expect(() => gamePlayService.playAction(DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, DEFAULT_ACTION)).to.throw('Method not implemented');
        });
    });
});
