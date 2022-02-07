import { LetterScoreMultiplier, WordScoreMultiplier } from '@app/classes/square';
import { Multiplier } from '@app/classes/square/square';

export const BOARD_CONFIG: string[][] = [
    ['W3', 'x', 'x', 'L2', 'x', 'x', 'x', 'W3', 'x', 'x', 'x', 'L2', 'x', 'x', 'W3'],
    ['x', 'W2', 'x', 'x', 'x', 'L3', 'x', 'x', 'x', 'L3', 'x', 'x', 'x', 'W2', 'x'],
    ['x', 'x', 'W2', 'x', 'x', 'x', 'L2', 'x', 'L2', 'x', 'x', 'x', 'W2', 'x', 'x'],
    ['L2', 'x', 'x', 'W2', 'x', 'x', 'x', 'L2', 'x', 'x', 'x', 'W2', 'x', 'x', 'L2'],
    ['x', 'x', 'x', 'x', 'W2', 'x', 'x', 'x', 'x', 'x', 'W2', 'x', 'x', 'x', 'x'],
    ['x', 'L3', 'x', 'x', 'x', 'L3', 'x', 'x', 'x', 'L3', 'x', 'x', 'x', 'L3', 'x'],
    ['x', 'x', 'L2', 'x', 'x', 'x', 'L2', 'x', 'L2', 'x', 'x', 'x', 'L2', 'x', 'x'],
    ['W3', 'x', 'x', 'L2', 'x', 'x', 'x', 'S', 'x', 'x', 'x', 'L2', 'x', 'x', 'W3'],
    ['x', 'x', 'L2', 'x', 'x', 'x', 'L2', 'x', 'L2', 'x', 'x', 'x', 'L2', 'x', 'x'],
    ['x', 'L3', 'x', 'x', 'x', 'L3', 'x', 'x', 'x', 'L3', 'x', 'x', 'x', 'L3', 'x'],
    ['x', 'x', 'x', 'x', 'W2', 'x', 'x', 'x', 'x', 'x', 'W2', 'x', 'x', 'x', 'x'],
    ['L2', 'x', 'x', 'W2', 'x', 'x', 'x', 'L2', 'x', 'x', 'x', 'W2', 'x', 'x', 'L2'],
    ['x', 'x', 'W2', 'x', 'x', 'x', 'L2', 'x', 'L2', 'x', 'x', 'x', 'W2', 'x', 'x'],
    ['x', 'W2', 'x', 'x', 'x', 'L3', 'x', 'x', 'x', 'L3', 'x', 'x', 'x', 'W2', 'x'],
    ['W3', 'x', 'x', 'L2', 'x', 'x', 'x', 'W3', 'x', 'x', 'x', 'L2', 'x', 'x', 'W3'],
];

export const BOARD_CONFIG_MAP: Map<string, Multiplier> = new Map([
    ['x', null],
    ['L2', new LetterScoreMultiplier(2)],
    ['L3', new LetterScoreMultiplier(3)],
    ['W2', new WordScoreMultiplier(2)],
    ['W3', new WordScoreMultiplier(3)],
    ['S', new LetterScoreMultiplier(2)],
]);
