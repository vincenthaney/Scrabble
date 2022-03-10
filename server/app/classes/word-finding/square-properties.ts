import { Square } from '@app/classes/square';
import { MovePossibilitiesParams } from '.';

export default interface SquareProperties {
    square: Square;
    horizontal: MovePossibilitiesParams;
    vertical: MovePossibilitiesParams;
}
