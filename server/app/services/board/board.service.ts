import { Board } from '@app/classes/board';
import { Multiplier, Square } from '@app/classes/square';
import { Vec2 } from '@app/classes/vec2';
import { BOARD_CONFIG, BOARD_CONFIG_MAP } from '@app/constants/board-config';
import { BOARD_SIZE } from '@app/constants/game';
import { Service } from 'typedi';
import * as BOARD_ERROS from './board.service.error';

@Service()
export default class BoardService {
    private static readonly size: Vec2 = { x: BOARD_SIZE.x, y: BOARD_SIZE.y };

    initializeBoard(): Board {
        const grid: Square[][] = [];
        const center: Vec2 = { x: Math.floor(BoardService.size.x / 2), y: Math.floor(BoardService.size.y / 2) };
        for (let i = 0; i < BoardService.size.y; i++) {
            grid[i] = [];
            for (let j = 0; j < BoardService.size.x; j++) {
                const isCenter = j === center.x && i === center.y;
                const square = {
                    tile: null,
                    multiplier: this.readScoreMultiplierConfig(i, j),
                    wasMultiplierUsed: false,
                    isCenter,
                };
                grid[i][j] = square;
            }
        }
        return new Board(grid);
    }
    private readScoreMultiplierConfig(row: number, col: number): Multiplier {
        if (!this.isBoardConfigDefined(row, col)) throw new Error(BOARD_ERROS.BOARD_CONFIG_UNDEFINED_AT(row, col));
        return this.parseSquareConfig(BOARD_CONFIG[row][col]);
    }

    private parseSquareConfig(data: string): Multiplier {
        if (BOARD_CONFIG_MAP.get(data) === undefined) {
            throw new Error(BOARD_ERROS.NO_MULTIPLIER_MAPPED_TO_INPUT(data));
        }
        return BOARD_CONFIG_MAP.get(data) as Multiplier;
    }

    private isBoardConfigDefined(row: number, col: number): boolean {
        return BOARD_CONFIG && BOARD_CONFIG[0] && BOARD_CONFIG.length > row && BOARD_CONFIG[0].length > col && row >= 0 && col >= 0;
    }
    // private placeTile(position: Position, tile: Tile): boolean {
    //     throw new Error('Method not implemented.');
    // } // Verify if there is already a tile in that square
    // private removePlayedTiles(): void {
    //     throw new Error('Method not implemented.');
    // }
}
