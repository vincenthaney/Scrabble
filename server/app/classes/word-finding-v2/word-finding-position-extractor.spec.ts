/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
import { LetterValue, Tile } from '@app/classes/tile';
import { Board, BoardNavigator, Orientation, Position } from '@app/classes/board';
import { Square } from '@app/classes/square';
import Player from '@app/classes/player/player';
import WordFindingPositionExtractor, { LetterPosition, WFPosition } from './word-finding-position-extractor';
import { Vec2 } from '@app/classes/vec2';
import { SinonStub, stub } from 'sinon';
import { expect } from 'chai';

const DEFAULT_BOARD: (LetterValue | ' ')[][] = [
    [' ', ' ', 'X', ' ', 'O', ' '],
    [' ', ' ', ' ', 'Y', ' ', ' '],
    [' ', 'Z', 'N', ' ', ' ', ' '],
    [' ', ' ', 'M', 'L', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' '],
];
const DEFAULT_TILES: LetterValue[] = ['A', 'B', 'C'];

const letterToSquare = (letter: LetterValue | ' '): Square =>
    ({
        tile: letter === ' ' ? null : ({ letter } as Tile),
    } as Square);

describe('WordFindingPositionExtractor', () => {
    let board: Board;
    let player: Player;
    let extractor: WordFindingPositionExtractor;

    beforeEach(() => {
        board = new Board(
            DEFAULT_BOARD.map((line, row) =>
                line.map<Square>((value, column) => ({
                    ...letterToSquare(value),
                    position: new Position(row, column),
                })),
            ),
        );

        player = new Player('', '');
        player.tiles = DEFAULT_TILES.map((letter) => ({ letter } as Tile));

        extractor = new WordFindingPositionExtractor(board);
    });

    describe('extractAllPositions', () => {
        let extractLineStub: SinonStub;

        beforeEach(() => {
            extractLineStub = stub(extractor, 'extractLine' as any).returns([]);
        });

        it('should call extractLine # rows + # cols times', () => {
            const expected = board.getSize().x + board.getSize().y;
            extractor.extractAllPositions();
            expect(extractLineStub.callCount).to.equal(expected);
        });

        it('should concat all of extractLine results', () => {
            const call0: WFPosition[] = [1, 2, 3] as unknown as WFPosition[];
            const call1: WFPosition[] = [4, 5, 6, 7] as unknown as WFPosition[];
            const expected = [...call0, ...call1];

            extractLineStub.onCall(0).returns(call0);
            extractLineStub.onCall(1).returns(call1);

            const result = extractor.extractAllPositions();

            expect(result).to.deep.equal(expected);
        });
    });

    describe('extractLine', () => {
        let getLetterPositionsFromLineStub: SinonStub;
        let extractPositionStub: SinonStub;

        beforeEach(() => {
            getLetterPositionsFromLineStub = stub(extractor, 'getLetterPositionsFromLine' as any).returns([]);
            extractPositionStub = stub(extractor, 'extractPosition' as any).returns([]);
            stub(extractor, 'getSize' as any).returns(DEFAULT_BOARD.length);
        });

        it('should call getLetterPositionsFromLine with navigator', () => {
            extractor['extractLine'](extractor['navigator']);
            expect(getLetterPositionsFromLineStub.called).to.be.true;
        });

        it('should call extractPosition n tiles', () => {
            const n = board.getSize().x;
            extractor['extractLine'](extractor['navigator']);
            expect(extractPositionStub.callCount).to.equal(n);
        });

        it('should return as many items as extractPosition returns', () => {
            extractPositionStub.returns(undefined);

            const n = 2;
            for (let i = 0; i < n; ++i) {
                extractPositionStub.onCall(i).returns([]);
            }

            const result = extractor['extractLine'](extractor['navigator']);
            expect(result).to.have.length(n);
        });
        const tests: [ep: LetterPosition[], position: Position, distance: number][] = [
            [[{ letter: 'A', distance: 3 }], new Position(3, 0), 1],
            [[{ letter: 'B', distance: 1 }], new Position(4, 3), 2],
            [[{ letter: 'C', distance: 0 }], new Position(0, 1), 3],
        ];

        let index = 1;
        for (const [extractedPositions, position, distance] of tests) {
            it(`should create WFPositon from extractedPosition (${index})`, () => {
                const size = DEFAULT_BOARD.length;

                extractPositionStub.returns(undefined);
                extractPositionStub.onCall(distance).returns(extractedPositions);
                extractor['navigator'].position = position;
                extractor['navigator'].orientation = Orientation.Horizontal;

                const result = extractor['extractLine'](extractor['navigator']);

                expect(result).to.have.length(1);
                expect(result[0].letters).to.equal(extractedPositions);
                expect(result[0].position).to.deep.equal(new Position(position.row, position.column + distance));
                expect(result[0].orientation).to.equal(extractor['navigator'].orientation);
                expect(result[0].maxSize).to.equal(size - distance);
            });
            index++;
        }
    });

    describe('extractPosition', () => {
        const lineLP: LetterPosition[] = [
            { letter: 'L', distance: 2 },
            { letter: 'M', distance: 4 },
        ];
        const tests: [distance: number, expected: LetterPosition[] | undefined][] = [
            [
                0,
                [
                    { letter: 'L', distance: 2 },
                    { letter: 'M', distance: 4 },
                ],
            ],
            [
                2,
                [
                    { letter: 'L', distance: 0 },
                    { letter: 'M', distance: 2 },
                ],
            ],
            [3, undefined],
            [4, [{ letter: 'M', distance: 0 }]],
            [5, undefined],
            [6, undefined],
        ];

        let index = 1;
        for (const [distance, expected] of tests) {
            it(`should extract position from line letter positions (${index})`, () => {
                const result = extractor['extractPosition'](lineLP, distance);
                expect(result).to.deep.equal(expected);
            });
            index++;
        }
    });

    describe('getLetterPositionsFromLine', () => {
        let getBoardLineStub: SinonStub;

        beforeEach(() => {
            getBoardLineStub = stub(extractor, 'getBoardLine' as any).returns([]);
        });

        it('should call getBoardLine with navigator', () => {
            extractor['getLetterPositionsFromLine'](extractor['navigator']);
            expect(getBoardLineStub.calledWith(extractor['navigator'])).to.be.true;
        });

        const tests: [letters: (LetterValue | ' ')[], expectedLP: LetterPosition[]][] = [
            [[' ', 'A', ' '], [{ letter: 'A', distance: 1 }]],
            [
                ['A', 'B', 'C'],
                [
                    { letter: 'A', distance: 0 },
                    { letter: 'B', distance: 1 },
                    { letter: 'C', distance: 2 },
                ],
            ],
        ];

        let index = 1;
        for (const [letters, expectedLP] of tests) {
            it(`should convert squares to LetterPosition (${index})`, () => {
                getBoardLineStub.returns(letters.map((letter, i) => ({ ...letterToSquare(letter), position: new Position(0, i) })));

                const result = extractor['getLetterPositionsFromLine'](extractor['navigator']);

                expect(result).to.deep.equal(expectedLP);
            });
            index++;
        }
    });

    describe('getBoardLine', () => {
        const BOARD: LetterValue[][] = [
            ['A', 'B', 'C'],
            ['D', 'E', 'F'],
            ['G', 'H', 'I'],
        ];
        const tests: [index: number, orientation: Orientation, expected: string][] = [
            [0, Orientation.Horizontal, 'ABC'],
            [1, Orientation.Horizontal, 'DEF'],
            [2, Orientation.Horizontal, 'GHI'],
            [0, Orientation.Vertical, 'ADG'],
            [1, Orientation.Vertical, 'BEH'],
            [2, Orientation.Vertical, 'CFI'],
        ];

        beforeEach(() => {
            board = new Board(BOARD.map((line) => line.map<Square>(letterToSquare)));
            extractor['board'] = board;
        });

        for (const [index, orientation, expected] of tests) {
            it(`should return ${expected} with index=${index} and orientation=${orientation}`, () => {
                const position = orientation === Orientation.Horizontal ? new Position(index, 0) : new Position(0, index);
                const navigator = new BoardNavigator(board, position, orientation);

                expect(extractor['getBoardLine'](navigator).reduce((prev, square) => (prev += square.tile?.letter), '')).to.equal(expected);
            });
        }
    });

    describe('getDistance', () => {
        const tests: [orientation: Orientation, axis: keyof Position][] = [
            [Orientation.Horizontal, 'column'],
            [Orientation.Vertical, 'row'],
        ];
        let position: Position;

        beforeEach(() => {
            position = new Position(3, 5);
        });

        for (const [orientation, axis] of tests) {
            it(`should return ${axis} axis when orientation is ${orientation}`, () => {
                expect(extractor['getDistance'](position, orientation)).to.equal(position[axis]);
            });
        }
    });

    describe('getSize', () => {
        const tests: [orientation: Orientation, axis: keyof Vec2][] = [
            [Orientation.Horizontal, 'x'],
            [Orientation.Vertical, 'y'],
        ];
        let size: Vec2;

        beforeEach(() => {
            size = { x: 3, y: 5 };
            stub(board, 'getSize').returns(size);
        });

        for (const [orientation, axis] of tests) {
            it(`should return ${axis} axis when orientation is ${orientation}`, () => {
                expect(extractor['getSize'](orientation)).to.equal(size[axis]);
            });
        }
    });
});
