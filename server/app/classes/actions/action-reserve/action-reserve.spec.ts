/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import Game from '@app/classes/game/game';
import Player from '@app/classes/player/player';
import { LetterValue, TileReserve } from '@app/classes/tile';
import { ActionReserve } from '..';
import { expect } from 'chai';

const DEFAULT_PLAYER_1_NAME = 'player1';
const DEFAULT_PLAYER_1_ID = '1';
const DEFAULT_MAP = new Map<LetterValue, number>([
    ['A', 0],
    ['B', 0],
]);

describe('ActionReserve', () => {
    let gameStub: SinonStubbedInstance<Game>;
    let tileReserveStub: SinonStubbedInstance<TileReserve>;
    let action: ActionReserve;

    beforeEach(() => {
        gameStub = createStubInstance(Game);
        tileReserveStub = createStubInstance(TileReserve);

        tileReserveStub.getTilesLeftPerLetter.returns(DEFAULT_MAP);

        gameStub.player1 = new Player(DEFAULT_PLAYER_1_ID, DEFAULT_PLAYER_1_NAME);

        gameStub.tileReserve = tileReserveStub as unknown as TileReserve;

        action = new ActionReserve(gameStub.player1, gameStub as unknown as Game);
    });

    describe('execute', () => {
        it('should call getTilesLeftPerLetter', () => {
            action.execute();
            expect(tileReserveStub.getTilesLeftPerLetter.called).to.be.true;
        });
    });

    describe('getMessage', () => {
        it('should return undefined', () => {
            expect(action.getMessage()).to.be.undefined;
        });
    });
});
