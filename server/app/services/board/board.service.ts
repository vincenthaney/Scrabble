// import { Multiplier, Square } from '@app/classes/square';
// import { Vec2 } from '@app/classes/vec2';
// import { BOARD_CONFIG, BOARD_CONFIG_MAP } from '@app/constants/board-config';
// import { BOARD_SIZE, UNDEFINED_BOARD_SIZE } from '@app/constants/game';
import { Service } from 'typedi';

@Service()
export default class BoardService {
    // private static readonly size: Vec2 = { x: BOARD_SIZE.x, y: BOARD_SIZE.y };
    // grid: Square[][];
    // constructor() {
    //     this.initializeBoardGrid();
    // }
    // getGridSize(): Vec2 {
    //     if (!this.grid || !this.grid[0]) {
    //         return UNDEFINED_BOARD_SIZE;
    //     }
    //     const x = this.grid.length;
    //     const y = this.grid[0].length;
    //     return { x, y };
    // }
    // private initializeBoardGrid() {
    //     const multiplierGrid: Multiplier[][] = this.readScoreMultiplierConfig();
    //     this.grid = [];
    //     const center: Vec2 = { x: Math.floor(BoardService.size.x / 2), y: Math.floor(BoardService.size.y / 2) };
    //     for (let i = 0; i < BoardService.size.y; i++) {
    //         this.grid[i] = [];
    //         for (let j = 0; j < BoardService.size.x; j++) {
    //             const isCenter = j === center.x && i === center.y;
    //             const square = {
    //                 tile: null,
    //                 multiplier: multiplierGrid[i][j],
    //                 wasMultiplierUsed: false,
    //                 isCenter,
    //             };
    //             this.grid[i][j] = square;
    //         }
    //     }
    // }
    // private readScoreMultiplierConfig(): Multiplier[][] {
    //     const multiplierGrid: Multiplier[][] = [];
    //     for (const configRow of BOARD_CONFIG) {
    //         const multiplierRow: Multiplier[] = [];
    //         for (const squareConfig of configRow) {
    //             multiplierRow.push(this.parseSquareConfig(squareConfig));
    //         }
    //         multiplierGrid.push(multiplierRow);
    //     }
    //     return multiplierGrid;
    // }
    // private parseSquareConfig(data: string): Multiplier {
    //     if (!BOARD_CONFIG_MAP.get(data)) {
    //         return null;
    //     }
    //     return BOARD_CONFIG_MAP.get(data) as Multiplier;
    // }
    // private placeTile(position: Position, tile: Tile): boolean {
    //     throw new Error('Method not implemented.');
    // } // Verify if there is already a tile in that square
    // private removePlayedTiles(): void {
    //     throw new Error('Method not implemented.');
    // }
}
