import { DictionaryNode } from '@app/classes/dictionary';
import { LetterValue } from '@app/classes/tile';
import { ALPHABET, BLANK_TILE_LETTER_VALUE, NOT_FOUND } from '@app/constants/game';
import { BoardPlacement } from './board-placement-types';

export interface StackItem {
    node: DictionaryNode;
    playerTiles: string[];
}

export interface SearcherPerpendicularLetters {
    before: string;
    after: string;
    distance: number;
}

export interface PerpendicularWord {
    word: string;
    distance: number;
}

export interface DictionarySearchResult {
    word: string;
    perpendicularWords: PerpendicularWord[];
}

export default class DictionarySearcher {
    private boardPlacement: BoardPlacement;
    private stack: StackItem[];
    private letters: Map<number, string>;
    private perpendicularLetters: SearcherPerpendicularLetters[];
    private node: DictionaryNode;

    constructor(node: DictionaryNode, playerLetters: LetterValue[], boardPlacement: BoardPlacement) {
        this.node = node;
        this.boardPlacement = boardPlacement;
        this.stack = [{ node, playerTiles: this.copyTiles(playerLetters) }];
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

        if (!stackItem) throw new Error("Next node doesn't exists.");

        this.addChildrenToStack(stackItem.node, stackItem.playerTiles);

        return this.getWord(stackItem.node) ?? this.next();
    }

    getAllWords(): DictionarySearchResult[] {
        const results: DictionarySearchResult[] = [];

        try {
            while (this.hasNext()) results.push(this.next());
        } catch (e) {
            // nothing
        }

        return results;
    }

    private copyTiles(letters: LetterValue[]): string[] {
        return letters.map((letter) => letter.toLowerCase());
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

    private addChildrenToStack(node: DictionaryNode, tiles: string[]): void {
        if (node.getDepth() > this.boardPlacement.maxSize) return;

        const [tilesToUse, removeFromTiles] = this.getSearchTilesForNextNode(node.getDepth(), tiles);

        for (const tile of tilesToUse) {
            const child = node.getNode(tile);

            if (child) {
                this.stack.unshift({
                    node: child,
                    playerTiles: removeFromTiles ? this.getTilesLeft(tiles, tile) : [...tiles],
                });
            }
        }
    }

    private isWordValid(word: string) {
        return this.wordSizeIsWithinBounds(word) && this.nextDoesNotHaveLetter(word);
    }

    private getSearchTilesForNextNode(index: number, tiles: string[]): [tiles: string[], removeFromTiles: boolean] {
        const lock = this.letters.get(index + 1);

        if (lock) return [[lock], false];

        if (!tiles.includes(BLANK_TILE_LETTER_VALUE)) return [[...new Set(tiles)], true];
        return [[...new Set([...tiles, ...ALPHABET])], true];
    }

    private getTilesLeft(tiles: string[], playing: string): string[] {
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
