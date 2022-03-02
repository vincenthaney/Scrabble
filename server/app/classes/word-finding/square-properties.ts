import { Square } from '@app/classes/square';
import { MovePossibilities } from '.';

export default interface SquareProperties {
    square: Square;
    horizontal: MovePossibilities;
    vertical: MovePossibilities;
    isEmpty: boolean;
}
