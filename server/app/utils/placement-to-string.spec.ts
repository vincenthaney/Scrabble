/* eslint-disable @typescript-eslint/no-magic-numbers */

import { Orientation, Position } from '@app/classes/board';
import { Tile } from '@app/classes/tile';
import { WordPlacement } from '@app/classes/word-finding/word-placement';
import { IN_UPPER_CASE } from '@app/constants/classes-constants';
import { expect } from 'chai';
import { PlacementToString } from './placement-to-string';

describe('WordPlacement utils', () => {
    describe('positionNumberToLetter', () => {
        it('should convert 0 to a', () => {
            expect(PlacementToString.positionNumberToLetter(0)).to.equal('a');
        });

        it('should convert 5 to f', () => {
            expect(PlacementToString.positionNumberToLetter(5)).to.equal('f');
        });
    });

    describe('orientationToLetter', () => {
        it('should convert horizontal to h', () => {
            expect(PlacementToString.orientationToLetter(Orientation.Horizontal)).to.equal('h');
        });

        it('should convert vertical to v', () => {
            expect(PlacementToString.orientationToLetter(Orientation.Vertical)).to.equal('v');
        });
    });

    describe('tilesToString', () => {
        it('should convert', () => {
            const tiles: Tile[] = [
                { letter: 'A', value: 0 },
                { letter: 'B', value: 0 },
                { letter: 'C', value: 0 },
            ];
            expect(PlacementToString.tilesToString(tiles)).to.equal('abc');
        });

        it('should convert', () => {
            const tiles: Tile[] = [
                { letter: 'A', value: 0 },
                { letter: 'B', value: 0 },
                { letter: 'C', value: 0 },
            ];
            expect(PlacementToString.tilesToString(tiles, IN_UPPER_CASE)).to.equal('ABC');
        });

        it('should convert blank tile to upper case', () => {
            const tiles: Tile[] = [
                { letter: 'A', value: 0 },
                { letter: 'B', value: 0, isBlank: true },
                { letter: 'C', value: 0 },
            ];
            expect(PlacementToString.tilesToString(tiles)).to.equal('aBc');
        });

        it('should convert', () => {
            const tiles: Tile[] = [];
            expect(PlacementToString.tilesToString(tiles)).to.equal('');
        });
    });

    describe('positionAndOrientationToString', () => {
        it('should convert', () => {
            const position = new Position(3, 4);
            const orientation = Orientation.Horizontal;
            expect(PlacementToString.positionAndOrientationToString(position, orientation)).to.equal('d5h');
        });
    });

    describe('tileToLetterConversion', () => {
        it('should convert default', () => {
            const tile: Tile = { letter: 'A', value: 0 };
            // eslint-disable-next-line dot-notation
            expect(PlacementToString['tileToLetterConversion'](tile)).to.equal('a');
        });

        it('should convert blank', () => {
            const tile: Tile = { letter: 'B', value: 0, isBlank: true };
            // eslint-disable-next-line dot-notation
            expect(PlacementToString['tileToLetterConversion'](tile)).to.equal('B');
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

            expect(PlacementToString.wordPlacementToCommandString(placement)).to.equal('!placer g3v xyz');
        });
    });
});
