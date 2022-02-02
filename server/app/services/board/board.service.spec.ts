/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { AbstractScoreMultiplier, LetterScoreMultiplier, WordScoreMultiplier } from '@app/classes/square';
import { Vec2 } from '@app/classes/vec2';
import { BOARD_CONFIG } from '@app/constants/board-config';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import BoardService from './board.service';
import * as BOARD_ERRORS from './board.service.error';

const expect = chai.expect;
chai.use(spies);
chai.use(chaiAsPromised);

describe('BoardService', () => {
    let service: BoardService;

    const boardConfigSize: Vec2 = {
        x: BOARD_CONFIG.length,
        y: BOARD_CONFIG[0] ? BOARD_CONFIG[0].length : 0,
    };
    const isBoardDefined = boardConfigSize.x > 0 && boardConfigSize.y > 0;
    const isBoardDefinedTestCases: Map<Vec2, boolean> = new Map([
        [{ x: -1, y: -1 }, false],
        [{ x: 0, y: 0 }, isBoardDefined],
        [{ x: boardConfigSize.x / 2, y: boardConfigSize.y / 2 }, isBoardDefined],
        [{ x: boardConfigSize.x - 1, y: boardConfigSize.y - 1 }, isBoardDefined],
        [{ x: boardConfigSize.x, y: boardConfigSize.y }, false],
        [{ x: boardConfigSize.x + 1, y: boardConfigSize.y + 1 }, false],
    ]);

    type MapTypes = AbstractScoreMultiplier | null | undefined;
    const boardConfigTestCases: Map<string, MapTypes> = new Map([
        ['x', null],
        ['L2', new LetterScoreMultiplier(2)],
        ['L3', new LetterScoreMultiplier(3)],
        ['W2', new WordScoreMultiplier(2)],
        ['W3', new WordScoreMultiplier(3)],
        ['S', new LetterScoreMultiplier(2)],
        ['?', undefined],
        ['undefined', undefined],
    ]);
    beforeEach(() => {
        service = new BoardService();
    });

    it('should be created', () => {
        expect(service).to.exist;
    });

    isBoardDefinedTestCases.forEach((isDefined: boolean, position: Vec2) => {
        const textToAdd: string = isDefined ? 'defined' : 'undefined';
        it('Board Configuration at ' + position.x + '/' + position.y + ' should be ' + textToAdd, () => {
            expect(service['isBoardConfigDefined'](position.x, position.y)).to.equal(isDefined);
        });
    });

    boardConfigTestCases.forEach((value: MapTypes, key: string) => {
        it('Parsing Square config for data ' + key + ' should return ' + value, () => {
            if (value === undefined) {
                expect(() => service['parseSquareConfig'](key)).to.throw(BOARD_ERRORS.NO_MULTIPLIER_MAPPED_TO_INPUT(key));
            } else {
                expect(service['parseSquareConfig'](key)).to.deep.equal(value);
            }
        });
    });

    it('Reading board config at undefined position should throw error', () => {
        chai.spy.on(service, 'isBoardConfigDefined', () => false);
        expect(() => service['readScoreMultiplierConfig'](-1, -1)).to.throw(BOARD_ERRORS.BOARD_CONFIG_UNDEFINED_AT(-1, -1));
    });

    it('Reading board config at valid position should return appropriate multiplier', () => {
        chai.spy.on(service, 'isBoardConfigDefined', () => true);
        chai.spy.on(service, 'parseSquareConfig', () => new LetterScoreMultiplier(2));
        expect(service['readScoreMultiplierConfig'](5, 5)).to.deep.equal(new LetterScoreMultiplier(2));
    });
});
