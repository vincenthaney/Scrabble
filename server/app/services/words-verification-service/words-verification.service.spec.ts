import { expect } from 'chai';
import { WordsVerificationService } from './words-verification.service';

// const DEFAULT_GAME_ID = 'gameId';
// const DEFAULT_PLAYER_ID = 'playerId';

describe('GamePlayService', () => {
    let wordsVerificationService: WordsVerificationService;

    beforeEach(() => {
        wordsVerificationService = new WordsVerificationService();
    });

    it('should create', () => {
        expect(gameDispatcherService).to.exist;
    });
});
