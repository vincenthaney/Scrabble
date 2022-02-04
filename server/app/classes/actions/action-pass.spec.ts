/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai';
import { ActionPass } from '.';
// import Game from '@app/classes/game/game';
// import Player from '@app/classes/player/player';
// import { createStubInstance, SinonStubbedInstance, spy, assert } from 'sinon';

describe('ActionPass', () => {
    let action: ActionPass;
    // let game: SinonStubbedInstance<Game>;
    // let player: SinonStubbedInstance<Player>;

    beforeEach(() => {
        // game = createStubInstance(Game);
        // game.roundManager.nextRound();
        action = new ActionPass();
    });

    it('should create', () => {
        expect(action).to.exist;
    });

    // it('Should call nextRound', () => {
    //     const spyNextRound = spy(game.roundManager, 'nextRound');
    //     action.execute(game as unknown as Game, player as unknown as Player);
    //     assert.called(spyNextRound);
    // });

    describe('getMessage', () => {
        it('is not yet implemented', () => {
            expect(() => action.getMessage()).to.throw('Method not implemented.');
        });
    });

    describe('willEndTurn', () => {
        it('should not end turn', () => {
            expect(action.willEndTurn()).to.be.false;
        });
    });
});
