/* eslint-disable dot-notation */
import { TestBed } from '@angular/core/testing';
import { Square } from '@app/classes/square';
import { BoardService } from '@app/services';

// eslint-disable-next-line no-undef
const DEFAULT_SQUARE: Square = {
    tile: null,
    position: { column: 0, row: 0 },
    scoreMultiplier: null,
    wasMultiplierUsed: false,
    isCenter: false,
};
const DEFAULT_BOARD: Square[][] = [
    [
        { ...DEFAULT_SQUARE, position: { column: 0, row: 0 } },
        { ...DEFAULT_SQUARE, position: { column: 0, row: 1 } },
    ],
    [
        { ...DEFAULT_SQUARE, position: { column: 1, row: 0 } },
        { ...DEFAULT_SQUARE, position: { column: 1, row: 1 } },
    ],
];

describe('BoardService', () => {
    let service: BoardService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(BoardService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('initializeBoard should set value of initialBoard', () => {
        service['initialBoard'] = [[]];
        service.initializeBoard(DEFAULT_BOARD);
        expect(service['initialBoard']).toEqual(DEFAULT_BOARD);
    });

    it('updateBoard should emit boardUpdateEvent', () => {
        const spy = spyOn(service['boardUpdateEvent$'], 'next');
        const squaresUpdated = [DEFAULT_SQUARE];
        service.updateBoard(squaresUpdated);
        expect(spy).toHaveBeenCalledWith(squaresUpdated);
    });
});
