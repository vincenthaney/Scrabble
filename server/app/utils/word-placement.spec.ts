/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Orientation, Position } from '@app/classes/board';
import { Tile } from '@app/classes/tile';
import { WordPlacement } from '@app/classes/word-finding';
import { expect } from 'chai';
import {
    orientationToLetter,
    positionAndOrientationToString,
    positionNumberToLetter,
    tilesToString,
    wordPlacementToCommandString,
} from './word-placement';

describe.only('WordPlacement utils', () => {
    describe('positionNumberToLetter', () => {
        it('should convert 0 to a', () => {
            expect(positionNumberToLetter(0)).to.equal('a');
        });

        it('should convert 5 to f', () => {
            expect(positionNumberToLetter(5)).to.equal('f');
        });
    });

    describe('orientationToLetter', () => {
        it('should convert horizontal to h', () => {
            expect(orientationToLetter(Orientation.Horizontal)).to.equal('h');
        });

        it('should convert horizontal to h', () => {
            expect(orientationToLetter(Orientation.Vertical)).to.equal('v');
        });
    });

    describe('tilesToString', () => {
        it('should convert', () => {
            const tiles: Tile[] = [
                { letter: 'A', value: 0 },
                { letter: 'B', value: 0 },
                { letter: 'C', value: 0 },
            ];
            expect(tilesToString(tiles)).to.equal('ABC');
        });

        it('should convert', () => {
            const tiles: Tile[] = [];
            expect(tilesToString(tiles)).to.equal('');
        });
    });

    describe('positionAndOrientationToString', () => {
        it('should convert', () => {
            const position = new Position(3, 4);
            const orientation = Orientation.Horizontal;
            expect(positionAndOrientationToString(position, orientation)).to.equal('d5h');
        });
    });

    describe('wordPlacementToCommandString', () => {
        it('should convert', () => {
            const tiles: Tile[] = [
                { letter: 'X', value: 0 },
                { letter: 'Y', value: 0 },
                { letter: 'Z', value: 0 },
            ];
            const position = new Position(6, 2);
            const orientation = Orientation.Vertical;

            const placement: WordPlacement = {
                startPosition: position,
                tilesToPlace: tiles,
                orientation,
            };

            expect(wordPlacementToCommandString(placement)).to.equal('g3v XYZ');
        });
    });
});
