import { Square } from '@app/classes/square';
import { MoveRequirements } from '.';

export default interface SquareProperties {
    square: Square;
    horizontal: MoveRequirements;
    vertical: MoveRequirements;
}
