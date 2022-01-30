import { expect } from 'chai';
import Player from './player';

const DEFAULT_NAME = 'player';

describe('Game', () => {
    let player: Player;

    beforeEach(() => {
        player = new Player(DEFAULT_NAME);
    });

    it('should create', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions, no-unused-expressions
        expect(player).to.exist;
    });
});
