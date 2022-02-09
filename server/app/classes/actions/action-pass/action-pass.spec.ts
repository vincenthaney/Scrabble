/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */

import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { ActionPass } from '..';
import Game from '@app/classes/game/game';
import Player from '@app/classes/player/player';
import { expect } from 'chai';

const DEFAULT_PLAYER_1_NAME = 'player1';
const DEFAULT_PLAYER_1_ID = '1';

describe('ActionPass', () => {
    let gameStub: SinonStubbedInstance<Game>;
    let action: ActionPass;

    beforeEach(() => {
        gameStub = createStubInstance(Game);

        gameStub.player1 = new Player(DEFAULT_PLAYER_1_ID, DEFAULT_PLAYER_1_NAME);

        action = new ActionPass(gameStub.player1, gameStub as unknown as Game);
    });

    describe('getMessage', () => {
        it('should return message', () => {
            expect(action.getMessage()).to.exist;
        });
    });

    describe('getOpponentMessage', () => {
        it('should equal getMessage', () => {
            expect(action.getOpponentMessage()).to.equal(action.getMessage());
        });
    });
});