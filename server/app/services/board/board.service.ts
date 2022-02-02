import { Board, Position } from '@app/classes/board';
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
        const center: Position = { row: Math.floor(BoardService.size.x / 2), col: Math.floor(BoardService.size.y / 2) };
        for (let i = 0; i < BoardService.size.y; i++) {
            grid[i] = [];
            for (let j = 0; j < BoardService.size.x; j++) {
                const isCenter = j === center.row && i === center.col;
                const square = {
                    tile: null,
                    position: { row: i, col: j },
                    multiplier: this.readScoreMultiplierConfig({ row: i, col: j }),
                    wasMultiplierUsed: false,
                    isCenter,
                };
                grid[i][j] = square;
            }
        }
        return new Board(grid);
    }
    private readScoreMultiplierConfig(position: Position): Multiplier {
        if (!this.isBoardConfigDefined(position)) throw new Error(BOARD_ERROS.BOARD_CONFIG_UNDEFINED_AT(position));
        return this.parseSquareConfig(BOARD_CONFIG[position.row][position.col]);
    }

    private parseSquareConfig(data: string): Multiplier {
        if (BOARD_CONFIG_MAP.get(data) === undefined) {
            throw new Error(BOARD_ERROS.NO_MULTIPLIER_MAPPED_TO_INPUT(data));
        }
        return BOARD_CONFIG_MAP.get(data) as Multiplier;
    }

    private isBoardConfigDefined(position: Position): boolean {
        return (
            BOARD_CONFIG &&
            BOARD_CONFIG[0] &&
            BOARD_CONFIG.length > position.row &&
            BOARD_CONFIG[0].length > position.col &&
            position.row >= 0 &&
            position.col >= 0
        );
    }
    // private placeTile(position: Position, tile: Tile): boolean {
    //     throw new Error('Method not implemented.');
    // } // Verify if there is already a tile in that square
    // private removePlayedTiles(): void {
    //     throw new Error('Method not implemented.');
    // }
}
