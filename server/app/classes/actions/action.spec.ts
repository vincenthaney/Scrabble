/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */

import Game from '@app/classes/game/game';
import Player from '@app/classes/player/player';
import { expect } from 'chai';
import { ActionHelp, ActionInfo, ActionPass, ActionPlay } from '.';

describe('Action', () => {
    describe('ActionPlay', () => {
        let action: ActionPlay;

        beforeEach(() => {
            action = new ActionPass(null as unknown as Player, null as unknown as Game);
        });

        it('should end round', () => {
            expect(action.willEndTurn()).to.be.true;
        });
    });

    describe('ActionInfo', () => {
        let action: ActionInfo;

        beforeEach(() => {
            action = new ActionHelp(null as unknown as Player, null as unknown as Game);
        });

        it('should not end round', () => {
            expect(action.willEndTurn()).to.be.false;
        });
    });
});
