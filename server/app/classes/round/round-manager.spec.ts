import { expect } from 'chai';
import RoundManager from './round-manager';

describe('RoundManager', () => {
    let roundManager: RoundManager;

    beforeEach(() => {
        roundManager = new RoundManager();
    });

    it('should create', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions, no-unused-expressions
        expect(roundManager).to.exist;
    });

    it('is not yet implemented: getStartGameTime', () => {
        expect(() => roundManager.getStartGameTime()).to.throw('Method not implemented.');
    });

    it('is not yet implemented: startRound', () => {
        expect(() => roundManager.startRound()).to.throw('Method not implemented.');
    });

    it('is not yet implemented: finishRound', () => {
        expect(() => roundManager.finishRound()).to.throw('Method not implemented.');
    });
});
