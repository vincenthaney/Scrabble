/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai';
import { ActionPlace } from '.';
import Game from '@app/classes/game/game';
import Player from '@app/classes/player/player';
import { createStubInstance, SinonStubbedInstance, spy, assert } from 'sinon';
import { Tile } from '@app/classes/tile';
import { Orientation, Position } from '../board';

// player1: Player;
// player2: Player;
// roundManager: RoundManager;
// wordsPlayed: string[];
// gameType: GameType;
// tileReserve: TileReserve;
// board: Board;
// private id: string;

const DEFAULT_PLAYER_1 = new Player('player-1', 'Player 1');
const TILES_PLAYER_1: Tile[] = [
    { letter: 'a', value: 1 },
    { letter: 'a', value: 1 },
    { letter: 'c', value: 1 },
    { letter: '*', value: 0 },
];
const VALID_TILES_TO_PLACE: Tile[] = [
    { letter: 'a', value: 1 },
    { letter: 'f', value: 0 },
    { letter: 'c', value: 1 },
];
const INVALID_TILES_TO_PLACE_VALUE: Tile[] = [
    { letter: 'a', value: 5 },
    { letter: 'a', value: 1 },
    { letter: 'c', value: 1 },
];
const INVALID_TILES_TO_PLACE_WILDCARD: Tile[] = [
    { letter: 'a', value: 5 },
    { letter: 'a', value: 1 },
    { letter: 'c', value: 1 },
];

const DEFAULT_ORIENTATION = Orientation.Horizontal;
const DEFAULT_POSITION: Position = { row: 7, column: 7 };

describe('ActionPlace', () => {
    let action: ActionPlace;
    let game: SinonStubbedInstance<WordExtraction>;

    beforeEach(() => {
        game = createStubInstance(Game);
        game.player1.tiles = TILES_PLAYER_1;
    });

    it('should create', () => {
        action = new ActionPlace(VALID_TILES_TO_PLACE, DEFAULT_POSITION, DEFAULT_ORIENTATION);
        expect(action).to.exist;
    });

    
    it('should create', () => {
        action = new ActionPlace(VALID_TILES_TO_PLACE, DEFAULT_POSITION, DEFAULT_ORIENTATION);
        expect(action).to.exist;
    });

    it('Should call nextRound', () => {
        const spyNextRound = spy(game.roundManager, 'nextRound');
        action.execute(game as unknown as Game, DEFAULT_PLAYER_1);
        assert.called(spyNextRound);
    });

    describe('getMessage', () => {
        it('is not yet implemented', () => {
            expect(() => action.getMessage()).to.throw('Method not implemented.');
        });
    });

    describe('willEndTurn', () => {
        it('should not end turn', () => {
            expect(action.willEndTurn()).to.be.false;
        });
    });
});
