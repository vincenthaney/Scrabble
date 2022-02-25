/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { createStubInstance, SinonStubbedInstance, spy } from 'sinon';
import Game from '@app/classes/game/game';
import Player from '@app/classes/player/player';
import { expect } from 'chai';
import ActionHint from './action-hint';
import WordFindingService from '@app/services/word-finding/word-finding';
import { Orientation, Position } from '@app/classes/board';
import { WordPlacementUtils } from '@app/utils/word-placement';
import { NO_WORDS_FOUND } from '@app/constants/classes-constants';

const DEFAULT_PLAYER_1_NAME = 'player1';
const DEFAULT_PLAYER_1_ID = '1';

describe('ActionReserve', () => {
    let gameStub: SinonStubbedInstance<Game>;
    let wordFindingServiceStub: SinonStubbedInstance<WordFindingService>;
    let action: ActionHint;

    beforeEach(() => {
        gameStub = createStubInstance(Game);
        gameStub.player1 = new Player(DEFAULT_PLAYER_1_ID, DEFAULT_PLAYER_1_NAME);

        wordFindingServiceStub = createStubInstance(WordFindingService, {
            findWords: [],
        });

        action = new ActionHint(gameStub.player1, gameStub as unknown as Game);
        (action['wordFindingService'] as unknown) = wordFindingServiceStub;
    });

    describe('execute', () => {
        it('should call findWords', () => {
            action.execute();
            expect(wordFindingServiceStub.findWords.called).to.be.true;
        });

        it('should set wordsPlacement', () => {
            (action['wordsPlacement'] as unknown) = undefined;
            action.execute();
            expect(action['wordsPlacement']).to.not.be.undefined;
        });
    });

    describe('getMessage', () => {
        it('should return message', () => {
            action['wordsPlacement'] = [];
            expect(action.getMessage()).to.not.be.undefined;
        });

        it('should return message with content', () => {
            const placementsAmount = 3;
            action['wordsPlacement'] = [];

            for (let i = 0; i < placementsAmount; ++i) {
                action['wordsPlacement'].push({
                    orientation: Orientation.Horizontal,
                    startPosition: new Position(0, 0),
                    tilesToPlace: [],
                });
            }

            const wordPlacementToCommandStringSpy = spy(WordPlacementUtils, 'wordPlacementToCommandString');

            action.getMessage();

            expect(wordPlacementToCommandStringSpy.callCount).to.equal(placementsAmount);

            wordPlacementToCommandStringSpy.restore();
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
