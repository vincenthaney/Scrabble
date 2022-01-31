import { expect } from 'chai';
import Player from './player';

const ID = 'id';
const DEFAULT_NAME = 'player';

describe('Player', () => {
    let player: Player;

    beforeEach(() => {
        player = new Player(ID, DEFAULT_NAME);
    });

    it('should create', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions, no-unused-expressions
        expect(player).to.exist;
    });
});
