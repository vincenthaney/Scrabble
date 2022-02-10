/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import Game from '@app/classes/game/game';
import Player from '@app/classes/player/player';
import { expect } from 'chai';
import ActionHint from './action-hint';

const DEFAULT_PLAYER_1_NAME = 'player1';
const DEFAULT_PLAYER_1_ID = '1';

describe('ActionReserve', () => {
    let gameStub: SinonStubbedInstance<Game>;
    let action: ActionHint;

    beforeEach(() => {
        gameStub = createStubInstance(Game);
        gameStub.player1 = new Player(DEFAULT_PLAYER_1_ID, DEFAULT_PLAYER_1_NAME);

        action = new ActionHint(gameStub.player1, gameStub as unknown as Game);
    });

    describe('execute', () => {
        it('should throw not implemented', () => {
            expect(() => action.execute()).to.throw('Method not implemented.');
        });
    });

    describe('getMessage', () => {
        it('should return undefined', () => {
            expect(action.getMessage()).to.be.undefined;
        });
    });

    describe('getOpponentMessage', () => {
        it('should return undefined', () => {
            expect(action.getOpponentMessage()).to.be.undefined;
        });
    });
});
