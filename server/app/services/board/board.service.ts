import { Board, Position } from '@app/classes/board';
import { Square } from '@app/classes/square';
import { Multiplier } from '@app/classes/square/square';
import { Vec2 } from '@app/classes/vec2';
import { BOARD_CONFIG, BOARD_CONFIG_MAP } from '@app/constants/board-config';
import { BOARD_SIZE } from '@app/constants/game';
import { Service } from 'typedi';
import { boardErrors } from '@app/constants/services-errors';

@Service()
export default class BoardService {
    private static readonly size: Vec2 = { x: BOARD_SIZE.x, y: BOARD_SIZE.y };

    initializeBoard(): Board {
        const grid: Square[][] = [];
        const center: Position = new Position(Math.floor(BoardService.size.y / 2), Math.floor(BoardService.size.x / 2));
        for (let i = 0; i < BoardService.size.y; i++) {
            grid[i] = [];
            for (let j = 0; j < BoardService.size.x; j++) {
                const isCenter = j === center.row && i === center.column;
                const square: Square = {
                    tile: null,
                    position: new Position(j, i),
                    scoreMultiplier: this.readScoreMultiplierConfig(new Position(j, i)),
                    wasMultiplierUsed: false,
                    isCenter,
                };
                grid[i][j] = square;
            }
        }
        return new Board(grid);
    }
    private readScoreMultiplierConfig(position: Position): Multiplier {
        if (!this.isBoardConfigDefined(position)) throw new Error(boardErrors.BOARD_CONFIG_UNDEFINED_AT(position));
        return this.parseSquareConfig(BOARD_CONFIG[position.row][position.column]);
    }

    private parseSquareConfig(data: string): Multiplier {
        if (BOARD_CONFIG_MAP.get(data) === undefined) {
            throw new Error(boardErrors.NO_MULTIPLIER_MAPPED_TO_INPUT(data));
        }
        return BOARD_CONFIG_MAP.get(data) as Multiplier;
    }

    private isBoardConfigDefined(position: Position): boolean {
        return (
            BOARD_CONFIG &&
            BOARD_CONFIG[0] &&
            BOARD_CONFIG.length > position.row &&
            BOARD_CONFIG[0].length > position.column &&
            position.row >= 0 &&
            position.column >= 0
        );
    }
    // private placeTile(position: Position, tile: Tile): boolean {
    //     throw new Error('Method not implemented.');
    // } // Verify if there is already a tile in that square
    // private removePlayedTiles(): void {
    //     throw new Error('Method not implemented.');
    // }
}
