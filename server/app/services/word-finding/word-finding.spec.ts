/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Board } from '@app/classes/board';
import { Tile } from '@app/classes/tile';
import { WordFindingRequest } from '@app/classes/word-finding';
import { expect } from 'chai';
import { Container } from 'typedi';
import { WordFindingService } from './word-finding';

describe('WordFindingservice', () => {
    let service: WordFindingService;

    beforeEach(() => {
        service = Container.get(WordFindingService);
    });

    it('should be created', () => {
        expect(service).to.exist;
    });

    it('should throw', () => {
        const result = () => service.findWords({} as unknown as Board, [] as unknown as Tile[], {} as unknown as WordFindingRequest);
        expect(result).to.throw();
    });
});
