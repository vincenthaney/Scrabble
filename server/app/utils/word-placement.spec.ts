/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Orientation, Position } from '@app/classes/board';
import { Tile } from '@app/classes/tile';
import { WordPlacement } from '@app/classes/word-finding';
import { expect } from 'chai';
import { WordPlacementUtils } from './word-placement';

describe('WordPlacement utils', () => {
    describe('positionNumberToLetter', () => {
        it('should convert 0 to a', () => {
            expect(WordPlacementUtils.positionNumberToLetter(0)).to.equal('a');
        });

        it('should convert 5 to f', () => {
            expect(WordPlacementUtils.positionNumberToLetter(5)).to.equal('f');
        });
    });

    describe('orientationToLetter', () => {
        it('should convert horizontal to h', () => {
            expect(WordPlacementUtils.orientationToLetter(Orientation.Horizontal)).to.equal('h');
        });

        it('should convert vertical to v', () => {
            expect(WordPlacementUtils.orientationToLetter(Orientation.Vertical)).to.equal('v');
        });
    });

    describe('tilesToString', () => {
        it('should convert', () => {
            const tiles: Tile[] = [
                { letter: 'A', value: 0 },
                { letter: 'B', value: 0 },
                { letter: 'C', value: 0 },
            ];
            expect(WordPlacementUtils.tilesToString(tiles)).to.equal('abc');
        });

        it('should convert', () => {
            const tiles: Tile[] = [];
            expect(WordPlacementUtils.tilesToString(tiles)).to.equal('');
        });
    });

    describe('positionAndOrientationToString', () => {
        it('should convert', () => {
            const position = new Position(3, 4);
            const orientation = Orientation.Horizontal;
            expect(WordPlacementUtils.positionAndOrientationToString(position, orientation)).to.equal('d5h');
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

            expect(WordPlacementUtils.wordPlacementToCommandString(placement)).to.equal('g3v xyz');
        });
    });
});
