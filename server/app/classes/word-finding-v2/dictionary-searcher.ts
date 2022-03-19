import { DictionaryNode } from '@app/classes/dictionary';
import { LetterValue } from '@app/classes/tile';
import { ERROR_PLAYER_DOESNT_HAVE_TILE, NEXT_NODE_DOES_NOT_EXISTS } from '@app/constants/classes-errors';
import { ALPHABET, BLANK_TILE_LETTER_VALUE, NOT_FOUND } from '@app/constants/game';
import {
    BoardPlacement,
    DictionarySearchResult,
    PerpendicularWord,
    SearcherPerpendicularLetters,
    DictionarySearcherStackItem,
    PerpendicularLettersPosition,
} from './word-finding-types';

export default class DictionarySearcher {
    private boardPlacement: BoardPlacement;
    private stack: DictionarySearcherStackItem[];
    private alreadyPlacedLetters: Map<number, string>;
    private perpendicularLetters: SearcherPerpendicularLetters[];
    private rootNode: DictionaryNode;

    constructor(node: DictionaryNode, playerLetters: LetterValue[], boardPlacement: BoardPlacement) {
        this.rootNode = node;
        this.boardPlacement = boardPlacement;
        this.stack = [{ node, playerLetters: this.copyTiles(playerLetters) }];
        this.alreadyPlacedLetters = new Map(boardPlacement.letters.map((letter) => [letter.distance, letter.letter.toLowerCase()]));
        this.perpendicularLetters = this.convertPerpendicularWords(boardPlacement.perpendicularLetters);
    }

    hasNext(): boolean {
        return this.stack.length > 0;
    }

    next(): DictionarySearchResult {
        const stackItem = this.stack.pop();

        if (!stackItem) throw new Error(NEXT_NODE_DOES_NOT_EXISTS);

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
        return this.wordSizeIsWithinBounds(word) && this.nextTileIsEmpty(word);
    }

    private getSearchLettersForNextNode(index: number, letters: string[]): [lettersToUse: string[], removeFromLetters: boolean] {
        const alreadyPlacedLetter = this.alreadyPlacedLetters.get(index + 1);

        if (alreadyPlacedLetter) return [[alreadyPlacedLetter], false];

        if (!letters.includes(BLANK_TILE_LETTER_VALUE)) return [[...new Set(letters)], true];
        return [[...new Set([...letters, ...ALPHABET])], true];
    }

    private getLettersLeft(letters: string[], playingLetter: string): string[] {
        let index = letters.indexOf(playingLetter);
        if (index === NOT_FOUND) index = letters.indexOf(BLANK_TILE_LETTER_VALUE);
        if (index === NOT_FOUND) throw new Error(ERROR_PLAYER_DOESNT_HAVE_TILE);

        const lettersLeft = [...letters];
        lettersLeft.splice(index, 1);
        return lettersLeft;
    }

    private getPerpendicularWords(word: string): PerpendicularWord[] {
        const perpendicularWords: PerpendicularWord[] = [];

        for (const { before, after, distance } of this.perpendicularLetters) {
            const letter = word.charAt(distance);
            if (letter !== '') perpendicularWords.push({ word: before + word.charAt(distance) + after, distance });
        }

        return perpendicularWords;
    }

    private copyTiles(letters: LetterValue[]): string[] {
        return letters.map((letter) => letter.toLowerCase());
    }

    private areValidPerpendicularWords(words: PerpendicularWord[]): boolean {
        return words.length > 0 ? words.every((word) => this.rootNode.wordExists(word.word)) : true;
    }

    private nextTileIsEmpty(word: string): boolean {
        return !this.alreadyPlacedLetters.has(word.length);
    }

    private wordSizeIsWithinBounds(word: string): boolean {
        return word.length >= this.boardPlacement.minSize && word.length <= this.boardPlacement.maxSize;
    }

    private convertPerpendicularWords(perpendicularLettersPosition: PerpendicularLettersPosition[]): SearcherPerpendicularLetters[] {
        return perpendicularLettersPosition.map((perpendicularLetter) => ({
            before: perpendicularLetter.before.join('').toLowerCase(),
            after: perpendicularLetter.after.join('').toLowerCase(),
            distance: perpendicularLetter.distance,
        }));
    }
}
