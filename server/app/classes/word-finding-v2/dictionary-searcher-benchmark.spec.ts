/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
import { Board, Orientation, Position } from '@app/classes/board';
import DictionaryService from '@app/services/dictionary-service/dictionary.service';
import { Container } from 'typedi';
import { LetterValue, Tile } from '@app/classes/tile';
import { Square } from '@app/classes/square';
import BoardPlacementsExtractor from './board-placement-extractor';
import DictionarySearcher, { DictionarySearchResult } from './dictionary-searcher';

const GRID: (LetterValue | ' ')[][] = [
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'B', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'A', ' ', ' ', ' ', ' ', 'P'],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'R', ' ', ' ', ' ', ' ', 'A'],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', 'B', 'A', 'R', 'R', 'E', ' ', ' ', 'R'],
    [' ', ' ', ' ', 'P', ' ', ' ', ' ', 'O', ' ', 'E', ' ', 'T', ' ', ' ', 'T'],
    [' ', ' ', 'D', 'E', 'V', 'I', 'E', 'N', 'T', ' ', ' ', 'R', ' ', ' ', 'O'],
    [' ', ' ', ' ', 'P', ' ', ' ', ' ', 'J', ' ', ' ', 'S', 'A', 'L', 'O', 'N'],
    [' ', ' ', ' ', 'A', ' ', ' ', ' ', 'O', ' ', ' ', ' ', 'N', ' ', ' ', 'S'],
    [' ', ' ', ' ', 'R', ' ', 'R', 'O', 'U', 'E', 'S', ' ', 'G', ' ', ' ', ' '],
    [' ', ' ', ' ', 'E', ' ', 'O', ' ', 'R', ' ', 'O', ' ', 'E', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', 'U', ' ', ' ', ' ', 'L', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', 'G', ' ', ' ', ' ', 'I', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', 'E', ' ', ' ', ' ', 'D', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', 'C', 'R', 'E', 'T', 'I', 'N', 'S', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
];

const createBoard = (grid: (LetterValue | ' ')[][]): Board => {
    return new Board(
        grid.map((line, row) =>
            line.map(
                (letter, col) =>
                    ({
                        tile: letter === ' ' ? null : ({ letter } as Tile),
                        position: new Position(row, col),
                    } as Square),
            ),
        ),
    );
};

describe.skip('DictionarySearcher Benchmark', () => {
    it('board', () => {
        const dictionaryService = Container.get(DictionaryService);
        const playerLetters: LetterValue[] = ['A', 'E', 'S', 'G', 'L', 'M', '*'];

        const dictionary = dictionaryService.getDictionary(dictionaryService.getDictionaryTitles()[0]);
        const board = createBoard(GRID);

        const start = Date.now();

        const extractor = new BoardPlacementsExtractor(board);
        const boardPlacements = extractor.extractBoardPlacements();
        let allResult: DictionarySearchResult[] = [];

        for (const boardPlacement of boardPlacements) {
            const searcher = new DictionarySearcher(dictionary, playerLetters, boardPlacement);
            allResult = allResult.concat(searcher.getAllWords());
        }

        const duration = Date.now() - start;

        console.log(
            boardPlacements
                .map((p) => {
                    const pos = `(${p.position.row}, ${p.position.column})${p.orientation === Orientation.Horizontal ? 'H' : 'V'}`;
                    const letters = p.letters.map((l) => `${l.letter}|${l.distance}`).join(', ');
                    const perp = p.perpendicularLetters.map((l) => `${l.before.join('')}_${l.after.join('')}|${l.distance}`).join(', ');
                    const minMax = `${p.minSize}|${p.maxSize}`;

                    return `${pos} \t letters=${letters} perp=${perp} minMax=${minMax}`;
                })
                .join('\n'),
        );

        console.log();

        console.log(`${allResult.length} results in ${duration} ms (with ${boardPlacements.length} placements)`);
    });
});
