import { DictionaryNode } from '@app/classes/dictionary';
import { LetterValue } from '@app/classes/tile';
import { NEXT_NODE_DOESNT_EXISTS } from '@app/constants/classes-errors';
import { ALPHABET, BLANK_TILE_LETTER_VALUE, NOT_FOUND } from '@app/constants/game';
import { BoardPlacement, DictionarySearchResult, PerpendicularWord, SearcherPerpendicularLetters, StackItem } from './word-finding-types';

export default class DictionarySearcher {
    private boardPlacement: BoardPlacement;
    private stack: StackItem[];
    private letters: Map<number, string>;
    private perpendicularLetters: SearcherPerpendicularLetters[];
    private node: DictionaryNode;

    constructor(node: DictionaryNode, playerLetters: LetterValue[], boardPlacement: BoardPlacement) {
        this.node = node;
        this.boardPlacement = boardPlacement;
        this.stack = [{ node, playerLetters: this.copyTiles(playerLetters) }];
        this.letters = new Map(boardPlacement.letters.map((letter) => [letter.distance, letter.letter.toLowerCase()]));
        this.perpendicularLetters = boardPlacement.perpendicularLetters.map((perpendicularLetter) => ({
            before: perpendicularLetter.before.join('').toLowerCase(),
            after: perpendicularLetter.after.join('').toLowerCase(),
            distance: perpendicularLetter.distance,
        }));
    }

    hasNext(): boolean {
        return this.stack.length > 0;
    }

    next(): DictionarySearchResult {
        const stackItem = this.stack.pop();

        if (!stackItem) throw new Error(NEXT_NODE_DOESNT_EXISTS);

        this.addChildrenToStack(stackItem.node, stackItem.playerLetters);

        return this.getWord(stackItem.node) ?? this.next();
    }

    getAllWords(): DictionarySearchResult[] {
        const results: DictionarySearchResult[] = [];

        try {
            while (this.hasNext()) results.push(this.next());
        } finally {
            // nothing to do
        }

        return results;
    }

    private getWord(node: DictionaryNode): DictionarySearchResult | undefined {
        const word = node.getValue();

        if (word && this.isWordValid(word)) {
            const perpendicularWords = this.getPerpendicularWords(word);

            if (this.areValidPerpendicularWords(perpendicularWords)) {
                return { word, perpendicularWords };
            }
        }

        return undefined;
    }

    private addChildrenToStack(node: DictionaryNode, letters: string[]): void {
        if (node.getDepth() > this.boardPlacement.maxSize) return;

        const [lettersToUse, removeFromLetters] = this.getSearchLettersForNextNode(node.getDepth(), letters);

        for (const letter of lettersToUse) {
            const child = node.getNode(letter);

            if (child) {
                this.stack.unshift({
                    node: child,
                    playerLetters: removeFromLetters ? this.getLettersLeft(letters, letter) : [...letters],
                });
            }
        }
    }

    private isWordValid(word: string) {
        return this.wordSizeIsWithinBounds(word) && this.nextDoesNotHaveLetter(word);
    }

    private getSearchLettersForNextNode(index: number, letters: string[]): [lettersToUse: string[], removeFromLetters: boolean] {
        const lock = this.letters.get(index + 1);

        if (lock) return [[lock], false];

        if (!letters.includes(BLANK_TILE_LETTER_VALUE)) return [[...new Set(letters)], true];
        return [[...new Set([...letters, ...ALPHABET])], true];
    }

    private getLettersLeft(tiles: string[], playing: string): string[] {
        let index = tiles.indexOf(playing);
        if (index === NOT_FOUND) index = tiles.indexOf(BLANK_TILE_LETTER_VALUE);

        const tilesLeft = [...tiles];
        tilesLeft.splice(index, 1);
        return tilesLeft;
    }

    private getPerpendicularWords(word: string): PerpendicularWord[] {
        const words: PerpendicularWord[] = [];

        for (const { before, after, distance } of this.perpendicularLetters) {
            const letter = word.charAt(distance);
            if (letter !== '') words.push({ word: before + word.charAt(distance) + after, distance });
        }

        return words;
    }

    private copyTiles(letters: LetterValue[]): string[] {
        return letters.map((letter) => letter.toLowerCase());
    }

    private areValidPerpendicularWords(words: PerpendicularWord[]): boolean {
        return words.length > 0 ? words.every((word) => this.node.wordExists(word.word)) : true;
    }

    private nextDoesNotHaveLetter(word: string): boolean {
        return !this.letters.has(word.length);
    }

    private wordSizeIsWithinBounds(word: string): boolean {
        return word.length >= this.boardPlacement.minSize && word.length <= this.boardPlacement.maxSize;
    }
}
