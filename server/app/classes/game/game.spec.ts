import { expect } from 'chai';
import Game from './game';
import { GameType } from './game.type';

describe('Game', () => {
    let game: Game;

    beforeEach(() => {
        game = new Game();
    });

    it('should create', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions, no-unused-expressions
        expect(game).to.exist;
    });
});

describe('Game Type', () => {
    it('should contain Classic', () => {
        expect(GameType.Classic).to.equal('Classique');
    });

    it('should contain Classic', () => {
        expect(GameType.LOG2990).to.equal('LOG2990');
    });
});
