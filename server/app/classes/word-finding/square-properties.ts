import { Square } from '@app/classes/square';
import { MovePossibilities } from './move-possibilities';

export interface SquareProperties {
    square: Square;
    horizontal: MovePossibilities;
    vertical: MovePossibilities;
    isEmpty: boolean;
}
