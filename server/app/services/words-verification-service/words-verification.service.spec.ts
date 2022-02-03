import { expect } from 'chai';
import { WordsVerificationService } from './words-verification.service';

describe('GamePlayService', () => {
    let wordsVerificationService: WordsVerificationService;

    beforeEach(() => {
        wordsVerificationService = new WordsVerificationService();
    });

    it('should create', () => {
        expect(wordsVerificationService).to.exist;
    });

    /////////////////////////////////////////////////////////////////


    beforeEach(() => {
        wordsVerificationService = new WordsVerificationService();
    });

    it('should not have any character with accent', () => {
        expect(wordsVerificationService.removeAccents('àbçdé')).to.be('abcde');
    });

    it('should return error because word too short', () => {
        expect(wordsVerificationService.verifyWords([['a']], )).to.Throw();
    });

    it('should return error because word contains hyphen', () => {
        expect(gameDispatcherService['waitingGames']).to.be.empty;
    });
    
    it('should return error because word contains apostrophe', () => {
        expect(gameDispatcherService['waitingGames']).to.be.empty;
    });

    it('should return error because word is not in dictionary', () => {
        expect(gameDispatcherService['waitingGames']).to.be.empty;
    });
    


});
