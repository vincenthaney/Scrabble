/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { createStubInstance, SinonStubbedInstance, spy } from 'sinon';
import Game from '@app/classes/game/game';
import Player from '@app/classes/player/player';
import { expect } from 'chai';
import ActionHint from './action-hint';
import { Orientation, Position } from '@app/classes/board';
import { PlacementToString } from '@app/utils/placement-to-string';
import { NO_WORDS_FOUND } from '@app/constants/classes-constants';
import { Container } from 'typedi';
import DictionaryService from '@app/services/dictionary-service/dictionary.service';
import { getDictionaryTestService } from '@app/services/dictionary-service/dictionary-test.service.spec';
import WordFindingService from '@app/services/word-finding-service/word-finding.service';
import { AbstractWordFinding } from '@app/classes/word-finding';

const DEFAULT_PLAYER_1_NAME = 'player1';
const DEFAULT_PLAYER_1_ID = '1';

describe('ActionHint', () => {
    let gameStub: SinonStubbedInstance<Game>;
    let wordFindingServiceStub: SinonStubbedInstance<WordFindingService>;
    let wordFindingInstanceStub: SinonStubbedInstance<AbstractWordFinding>;
    let action: ActionHint;

    beforeEach(() => {
        Container.set(DictionaryService, getDictionaryTestService());

        gameStub = createStubInstance(Game);
        gameStub.player1 = new Player(DEFAULT_PLAYER_1_ID, DEFAULT_PLAYER_1_NAME);

        wordFindingInstanceStub = createStubInstance(AbstractWordFinding, {
            findWords: [],
        });

        wordFindingServiceStub = createStubInstance(WordFindingService, {
            getWordFindingInstance: wordFindingInstanceStub as unknown as AbstractWordFinding,
        });

        action = new ActionHint(gameStub.player1, gameStub as unknown as Game);
        (action['wordFindingService'] as unknown) = wordFindingServiceStub;
    });

    describe('execute', () => {
        it('should call findWords', () => {
            action.execute();
            expect(wordFindingServiceStub.getWordFindingInstance.called).to.be.true;
            expect(wordFindingInstanceStub.findWords.called).to.be.true;
        });

        it('should set wordsPlacement', () => {
            (action['hintResult'] as unknown) = undefined;
            action.execute();
            expect(action['hintResult']).to.not.be.undefined;
        });
    });

    describe('getMessage', () => {
        it('should return message', () => {
            action['hintResult'] = [];
            expect(action.getMessage()).to.not.be.undefined;
        });

        it('should return message with content', () => {
            const placementsAmount = 3;
            action['hintResult'] = [];

            for (let i = 0; i < placementsAmount; ++i) {
                action['hintResult'].push({
                    orientation: Orientation.Horizontal,
                    startPosition: new Position(0, 0),
                    tilesToPlace: [],
                });
            }

            const wordPlacementToCommandStringSpy = spy(PlacementToString, 'wordPlacementToCommandString');

            action.getMessage();

            expect(wordPlacementToCommandStringSpy.callCount).to.equal(placementsAmount);

            wordPlacementToCommandStringSpy.restore();
        });

        it('should have special message if less than 3 words', () => {
            const placementsAmount = 2;
            action['hintResult'] = [];

            for (let i = 0; i < placementsAmount; ++i) {
                action['hintResult'].push({
                    orientation: Orientation.Horizontal,
                    startPosition: new Position(0, 0),
                    tilesToPlace: [],
                });
            }

            const message = action.getMessage();

            expect(message).to.include('mot(s) ont été trouvé');
        });

        it('should return no words found if empty', () => {
            const message = action.getMessage();
            expect(message).to.equal(NO_WORDS_FOUND);
        });
    });

    describe('getOpponentMessage', () => {
        it('should return undefined', () => {
            expect(action.getOpponentMessage()).to.be.undefined;
        });
    });
});
