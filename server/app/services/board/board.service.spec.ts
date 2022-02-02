/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { AbstractScoreMultiplier, LetterScoreMultiplier, WordScoreMultiplier } from '@app/classes/square';
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
