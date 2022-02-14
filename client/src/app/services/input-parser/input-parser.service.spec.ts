/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines */
/* eslint-disable dot-notation */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActionExchangePayload, ActionPlacePayload, ActionType } from '@app/classes/actions/action-data';
import { Orientation } from '@app/classes/orientation';
import { Player } from '@app/classes/player';
import { Position } from '@app/classes/position';
import { LetterValue, Tile } from '@app/classes/tile';
import { SYSTEM_ERROR_ID } from '@app/constants/game';
import { GamePlayController } from '@app/controllers/game-play-controller/game-play.controller';
import { InputParserService } from '@app/services';
import GameService from '@app/services/game/game.service';
import { CommandErrorMessages, PLAYER_NOT_FOUND } from './command-error-messages';
import CommandError from './command-errors';

describe('InputParserService', () => {
    const VALID_MESSAGE_INPUT = 'How you doin';
    const VALID_LOCATION_INPUT = 'b12h';
    const VALID_LOCATION_INPUT_SINGLE = 'b12';
    const VALID_LETTERS_INPUT_MULTI = 'abc';
    const VALID_LETTERS_INPUT_SINGLE = 'a';

    const VALID_PLACE_INPUT = `!placer ${VALID_LOCATION_INPUT} ${VALID_LETTERS_INPUT_MULTI}`;
    const VALID_PLACE_INPUT_SINGLE = `!placer ${VALID_LOCATION_INPUT_SINGLE} ${VALID_LETTERS_INPUT_SINGLE}`;
    const VALID_EXCHANGE_INPUT = `!échanger ${VALID_LETTERS_INPUT_MULTI}`;
    const VALID_PASS_INPUT = '!passer';
    const VALID_PASS_ACTION_DATA = { type: ActionType.PASS, payload: {} };
    const VALID_RESERVE_INPUT = '!réserve';
    // const VALID_HINT_INPUT = '!indice';
    const VALID_HELP_INPUT = '!aide';

    const DEFAULT_GAME_ID = 'default game id';
    const DEFAULT_PLAYER_ID = 'default player id';
    const DEFAULT_PLAYER_NAME = 'default player name';
    const DEFAULT_TILES: Tile[] = [
        new Tile('A' as LetterValue, 1),
        new Tile('B' as LetterValue, 1),
        new Tile('C' as LetterValue, 1),
        new Tile('C' as LetterValue, 1),
        new Tile('E' as LetterValue, 1),
        new Tile('E' as LetterValue, 1),
        new Tile('*' as LetterValue, 0, true),
    ];
    const DEFAULT_PLAYER = new Player(DEFAULT_PLAYER_ID, DEFAULT_PLAYER_NAME, DEFAULT_TILES);
    // const DEFAULT_ACTION_DATA: ActionData = {
    //     type: ActionType.PASS,
    //     payload: {},
    // };
    // const DEFAULT_MESSAGE: Message = {
    //     content: VALID_MESSAGE_INPUT,
    //     senderId: DEFAULT_PLAYER_ID,
    // };
    const DEFAULT_COMMAND_ERROR_MESSAGE = CommandErrorMessages.InvalidEntry;

    const EXPECTED_PLACE_PAYLOAD_MULTI: ActionPlacePayload = {
        tiles: [new Tile('A' as LetterValue, 1), new Tile('B' as LetterValue, 1), new Tile('C' as LetterValue, 1)],
        startPosition: { row: 1, column: 11 },
        orientation: Orientation.Horizontal,
    };
    const EXPECTED_PLACE_PAYLOAD_SINGLE: ActionPlacePayload = {
        tiles: [new Tile('A' as LetterValue, 1)],
        startPosition: { row: 1, column: 11 },
        orientation: Orientation.Horizontal,
    };
    const EXPECTED_EXCHANGE_PAYLOAD: ActionExchangePayload = {
        tiles: [new Tile('A' as LetterValue, 1), new Tile('B' as LetterValue, 1), new Tile('C' as LetterValue, 1)],
    };

    let service: InputParserService;
    let gameServiceSpy: jasmine.SpyObj<GameService>;
    let gamePlayControllerSpy: jasmine.SpyObj<GamePlayController>;

    beforeEach(() => {
        gameServiceSpy = jasmine.createSpyObj('GameService', ['getLocalPlayer, getGameId']);
    });

    beforeEach(() => {
        gamePlayControllerSpy = jasmine.createSpyObj('GamePlayController', ['sendMessage', 'sendError', 'sendAction']);
        gamePlayControllerSpy.sendMessage.and.callFake(() => {
            return;
        });
        gamePlayControllerSpy.sendError.and.callFake(() => {
            return;
        });
        gamePlayControllerSpy.sendAction.and.callFake(() => {
            return;
        });

        gameServiceSpy = jasmine.createSpyObj('GameService', ['getLocalPlayer', 'getGameId', 'isLocalPlayerPlaying']);
        gameServiceSpy.getLocalPlayer.and.returnValue(DEFAULT_PLAYER);
        gameServiceSpy.getGameId.and.returnValue(DEFAULT_GAME_ID);
        gameServiceSpy.isLocalPlayerPlaying.and.returnValue(true);

        TestBed.configureTestingModule({
            providers: [
                { provide: GamePlayController, useValue: gamePlayControllerSpy },
                { provide: GameService, useValue: gameServiceSpy },
                InputParserService,
            ],
            imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
        });
        service = TestBed.inject(InputParserService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('parseInput', () => {
        it('should always call getLocalPLayer, gamservice.getGameId and parseCommand', () => {
            const getLocalPlayerSpy = spyOn<any>(service, 'getLocalPlayer').and.returnValue(DEFAULT_PLAYER_ID);
            service.parseInput(VALID_MESSAGE_INPUT);
            expect(getLocalPlayerSpy).toHaveBeenCalled();
            expect(gameServiceSpy.getGameId).toHaveBeenCalled();
        });

        it('should call sendMessage if input doesnt start with !', () => {
            service.parseInput(VALID_MESSAGE_INPUT);
            expect(gamePlayControllerSpy.sendMessage).toHaveBeenCalled();
        });

        it('should call parseCommand if input starts with !', () => {
            const spy = spyOn<any>(service, 'parseCommand').and.returnValue(VALID_PASS_ACTION_DATA);
            service.parseInput(VALID_PASS_INPUT);
            expect(spy).toHaveBeenCalled();
        });

        it('should call sendAction if input starts with ! and actionData doesnt throw error', () => {
            spyOn<any>(service, 'parseCommand').and.returnValue(VALID_PASS_ACTION_DATA);
            service.parseInput(VALID_PASS_INPUT);
            expect(gamePlayControllerSpy.sendAction).toHaveBeenCalled();
        });

        it('should have right error message content if input starts with ! and parseCommand throws error NotYourTurn', () => {
            spyOn<any>(service, 'getLocalPlayer').and.returnValue(DEFAULT_PLAYER);
            spyOn<any>(service, 'parseCommand').and.callFake(() => {
                throw new CommandError(DEFAULT_COMMAND_ERROR_MESSAGE);
            });
            service.parseInput(VALID_PASS_INPUT);
            expect(gamePlayControllerSpy.sendError).toHaveBeenCalledWith(DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, {
                content: `La commande ${VALID_PASS_INPUT} est invalide`,
                senderId: SYSTEM_ERROR_ID,
            });
        });

        it('should have right error message content if input starts with ! and parseCommand throws other commandError', () => {
            spyOn<any>(service, 'getLocalPlayer').and.returnValue(DEFAULT_PLAYER);
            spyOn<any>(service, 'parseCommand').and.callFake(() => {
                throw new CommandError(CommandErrorMessages.NotYourTurn);
            });
            service.parseInput(VALID_PASS_INPUT);
            expect(gamePlayControllerSpy.sendError).toHaveBeenCalledWith(DEFAULT_GAME_ID, DEFAULT_PLAYER_ID, {
                content: CommandErrorMessages.NotYourTurn,
                senderId: SYSTEM_ERROR_ID,
            });
        });

        it('should have right error message content if error thrown by parseCommand is not a CommandError', () => {
            spyOn<any>(service, 'getLocalPlayer').and.returnValue(DEFAULT_PLAYER);
            spyOn<any>(service, 'parseCommand').and.callFake(() => {
                throw new Error('other error message');
            });
            service.parseInput(VALID_PASS_INPUT);
            expect(gamePlayControllerSpy.sendError).not.toHaveBeenCalled();
        });
    });

    describe('parseCommand', () => {
        it("should throw error if PLAY command and it is not the player's turn", () => {
            gameServiceSpy.isLocalPlayerPlaying.and.returnValue(false);
            expect(() => {
                service['parseCommand'](VALID_PLACE_INPUT.substring(1).split(' '));
            }).toThrow(new CommandError(CommandErrorMessages.NotYourTurn));
        });

        it('should return right ActionData if input is a valid place command (single letter)', () => {
            expect(service['parseCommand'](VALID_PLACE_INPUT_SINGLE.substring(1).split(' '))).toEqual({
                type: ActionType.PLACE,
                payload: EXPECTED_PLACE_PAYLOAD_SINGLE,
            });
        });

        it('should call createPlaceActionPayloadSingleLetter if input is a valid place command (single letter)', () => {
            const spy = spyOn<any>(service, 'createPlaceActionPayloadSingleLetter').and.returnValue(EXPECTED_PLACE_PAYLOAD_SINGLE);
            service['parseCommand'](VALID_PLACE_INPUT_SINGLE.substring(1).split(' '));
            expect(spy).toHaveBeenCalled();
        });

        it('should return right ActionData if input is a valid place command (multiple letters)', () => {
            expect(service['parseCommand'](VALID_PLACE_INPUT.substring(1).split(' '))).toEqual({
                type: ActionType.PLACE,
                payload: EXPECTED_PLACE_PAYLOAD_MULTI,
            });
        });

        it('should call createPlaceActionPayloadMultipleLetters if input is a valid place command (multiple letters)', () => {
            const spy = spyOn<any>(service, 'createPlaceActionPayloadMultipleLetters').and.returnValue(EXPECTED_PLACE_PAYLOAD_MULTI);
            service['parseCommand'](VALID_PLACE_INPUT.substring(1).split(' '));
            expect(spy).toHaveBeenCalled();
        });

        it('should return right ActionData if input is a valid exchange command', () => {
            expect(service['parseCommand'](VALID_EXCHANGE_INPUT.substring(1).split(' '))).toEqual({
                type: ActionType.EXCHANGE,
                payload: EXPECTED_EXCHANGE_PAYLOAD,
            });
        });

        it('should call createExchangeActionPayload if input is a valid exchange command', () => {
            const spy = spyOn<any>(service, 'createExchangeActionPayload').and.returnValue(EXPECTED_EXCHANGE_PAYLOAD);
            service['parseCommand'](VALID_EXCHANGE_INPUT.substring(1).split(' '));
            expect(spy).toHaveBeenCalled();
        });

        it('should return right ActionData if input is a valid pass command', () => {
            expect(service['parseCommand'](VALID_PASS_INPUT.substring(1).split(' '))).toEqual({ type: ActionType.PASS, payload: {} });
        });

        it('should return right Actiondata if input is a valid pass command', () => {
            expect(service['parseCommand'](VALID_PASS_INPUT.substring(1).split(' '))).toEqual({ type: ActionType.PASS, payload: {} });
        });

        it('should return right Actiondata if input is a valid reserve command', () => {
            expect(service['parseCommand'](VALID_RESERVE_INPUT.substring(1).split(' '))).toEqual({
                type: ActionType.RESERVE,
                payload: {},
            });
        });

        // it('should call sendHintAction if input is a valid hint command', () => {
        //     expect(service['parseCommand'](VALID_HINT_INPUT.substring(1).split(' '))).toEqual({ type: ActionType.HINT, payload: {} });
        // });

        it('should return right Actiondata if input is a valid help command', () => {
            expect(service['parseCommand'](VALID_HELP_INPUT.substring(1).split(' '))).toEqual({ type: ActionType.HELP, payload: {} });
        });

        it('should throw error if commands have incorrect lengths', () => {
            const invalidCommands = [
                '!placer abc',
                '!échanger one two three',
                '!passer thing',
                '!réserve second word',
                // '!indice not length of two',
                '!aide help',
            ];
            for (const invalidCommand of invalidCommands) {
                const inputWords = invalidCommand.substring(1).split(' ');
                expect(() => service['parseCommand'](inputWords)).toThrow(new CommandError(CommandErrorMessages.BadSyntax));
            }
        });

        it('should throw error if command does not exist', () => {
            expect(() => {
                service['parseCommand']('!trouver un ami'.substring(1).split(' '));
            }).toThrow(new CommandError(CommandErrorMessages.InvalidEntry));
        });
    });

    describe('createPlaceActionPayloadSingleLetter', () => {
        it('createPlaceActionPayloadSingleLetter should call parsePlaceLettersToTiles', () => {
            const placeParserSpy = spyOn<any>(service, 'parsePlaceLettersToTiles');
            service['createPlaceActionPayloadSingleLetter'](VALID_LOCATION_INPUT, VALID_LETTERS_INPUT_SINGLE);
            expect(placeParserSpy).toHaveBeenCalled();
        });

        it('createPlaceActionPayloadSingleLetter should call getStartPosition', () => {
            const positionSpy = spyOn<any>(service, 'getStartPosition');
            service['createPlaceActionPayloadSingleLetter'](VALID_LOCATION_INPUT, VALID_LETTERS_INPUT_SINGLE);
            expect(positionSpy).toHaveBeenCalled();
        });

        it('createPlaceActionPayloadSingleLetter should NOT call getOrientation', () => {
            const orientationSpy = spyOn<any>(service, 'getOrientation');
            service['createPlaceActionPayloadSingleLetter'](VALID_LOCATION_INPUT, VALID_LETTERS_INPUT_SINGLE);
            expect(orientationSpy).not.toHaveBeenCalled();
        });

        it('createPlaceActionPayloadSingleLetter should return expected payload (with orientation)', () => {
            expect(service['createPlaceActionPayloadSingleLetter'](VALID_LOCATION_INPUT, VALID_LETTERS_INPUT_SINGLE)).toEqual(
                EXPECTED_PLACE_PAYLOAD_SINGLE,
            );
        });

        it('createPlaceActionPayloadSingleLetter should return expected payload (without orientation)', () => {
            expect(service['createPlaceActionPayloadSingleLetter'](VALID_LOCATION_INPUT_SINGLE, VALID_LETTERS_INPUT_SINGLE)).toEqual(
                EXPECTED_PLACE_PAYLOAD_SINGLE,
            );
        });
    });

    describe('createPlaceActionMultipleLetters', () => {
        it('createPlaceActionPayloadMultipleLetters should call parsePlaceLettersToTiles', () => {
            const placeParserSpy = spyOn<any>(service, 'parsePlaceLettersToTiles');
            service['createPlaceActionPayloadMultipleLetters'](VALID_LOCATION_INPUT, VALID_LETTERS_INPUT_MULTI);
            expect(placeParserSpy).toHaveBeenCalled();
        });

        it('createPlaceActionPayloadMultipleLetters should call getStartPosition', () => {
            const positionSpy = spyOn<any>(service, 'getStartPosition');
            service['createPlaceActionPayloadMultipleLetters'](VALID_LOCATION_INPUT, VALID_LETTERS_INPUT_MULTI);
            expect(positionSpy).toHaveBeenCalled();
        });

        it('createPlaceActionPayloadMultipleLetters should call getOrientation', () => {
            const orientationSpy = spyOn<any>(service, 'getOrientation');
            service['createPlaceActionPayloadMultipleLetters'](VALID_LOCATION_INPUT, VALID_LETTERS_INPUT_MULTI);
            expect(orientationSpy).toHaveBeenCalled();
        });

        it('createPlaceActionPayloadMultipleLetters should return expected payload', () => {
            expect(service['createPlaceActionPayloadMultipleLetters'](VALID_LOCATION_INPUT, VALID_LETTERS_INPUT_MULTI)).toEqual(
                EXPECTED_PLACE_PAYLOAD_MULTI,
            );
        });
    });

    describe('createExchangeActionPayload', () => {
        it('createExchangeActionPayload should call parseExchangeLettersToTiles', () => {
            const exchangeParserSpy = spyOn<any>(service, 'parseExchangeLettersToTiles');
            service['createExchangeActionPayload'](VALID_LETTERS_INPUT_MULTI);
            expect(exchangeParserSpy).toHaveBeenCalled();
        });

        it('createExchangeActionPayload should return expected payload', () => {
            expect(service['createExchangeActionPayload'](VALID_LETTERS_INPUT_MULTI)).toEqual(EXPECTED_EXCHANGE_PAYLOAD);
        });
    });

    describe('parsePlaceLettersToTiles', () => {
        it('should return valid tiles with valid input', () => {
            const validLetters = ['abce', 'abce', 'ceX', 'bKcc', 'ccee'];
            const expectedTiles: Tile[][] = [
                [new Tile('A' as LetterValue, 1), new Tile('B' as LetterValue, 1), new Tile('C' as LetterValue, 1), new Tile('E' as LetterValue, 1)],
                [new Tile('A' as LetterValue, 1), new Tile('B' as LetterValue, 1), new Tile('C' as LetterValue, 1), new Tile('E' as LetterValue, 1)],
                [new Tile('C' as LetterValue, 1), new Tile('E' as LetterValue, 1), new Tile('X' as LetterValue, 0, true)],
                [
                    new Tile('B' as LetterValue, 1),
                    new Tile('K' as LetterValue, 0, true),
                    new Tile('C' as LetterValue, 1),
                    new Tile('C' as LetterValue, 1),
                ],
                [new Tile('C' as LetterValue, 1), new Tile('C' as LetterValue, 1), new Tile('E' as LetterValue, 1), new Tile('E' as LetterValue, 1)],
            ];

            for (let i = 0; i < validLetters.length; i++) {
                console.log(i);
                console.log(service['parsePlaceLettersToTiles'](validLetters[i]));
                console.log(expectedTiles[i]);
                expect(service['parsePlaceLettersToTiles'](validLetters[i])).toEqual(expectedTiles[i]);
            }
        });

        it('should throw error with invalid input', () => {
            const invalidLetters = ['a&c"e', 'abcdefghiklm', 'lmno', 'ABCD', 'aAB', 'aKL'];
            const errorMessages: CommandErrorMessages[] = [
                CommandErrorMessages.ImpossibleCommand,
                CommandErrorMessages.ImpossibleCommand,
                CommandErrorMessages.ImpossibleCommand,
                CommandErrorMessages.ImpossibleCommand,
                CommandErrorMessages.ImpossibleCommand,
                CommandErrorMessages.ImpossibleCommand,
            ];

            for (let i = 0; i < invalidLetters.length; i++) {
                expect(() => {
                    service['parsePlaceLettersToTiles'](invalidLetters[i]);
                }).toThrow(new CommandError(errorMessages[i]));
            }
        });
    });

    describe('parseExchangeLettersToTiles', () => {
        it('should return valid tiles with valid input', () => {
            const validLetters = ['abce', 'abce', 'ab*', 'ccee'];
            const expectedTiles: Tile[][] = [
                [new Tile('A' as LetterValue, 1), new Tile('B' as LetterValue, 1), new Tile('C' as LetterValue, 1), new Tile('E' as LetterValue, 1)],
                [new Tile('A' as LetterValue, 1), new Tile('B' as LetterValue, 1), new Tile('C' as LetterValue, 1), new Tile('E' as LetterValue, 1)],
                [new Tile('A' as LetterValue, 1), new Tile('B' as LetterValue, 1), new Tile('*' as LetterValue, 0)],
                [new Tile('C' as LetterValue, 1), new Tile('C' as LetterValue, 1), new Tile('E' as LetterValue, 1), new Tile('E' as LetterValue, 1)],
            ];

            for (let i = 0; i < validLetters.length; i++) {
                expect(service['parseExchangeLettersToTiles'](validLetters[i])).toEqual(expectedTiles[i]);
            }
        });

        it('should throw error with invalid input', () => {
            const invalidLetters = ['a&c"e', 'abcdefghiklm', 'lmno', 'ABCD', 'aaaa'];
            const errorMessages: CommandErrorMessages[] = [
                CommandErrorMessages.ImpossibleCommand,
                CommandErrorMessages.ImpossibleCommand,
                CommandErrorMessages.ImpossibleCommand,
                CommandErrorMessages.BadSyntax,
                CommandErrorMessages.ImpossibleCommand,
            ];

            for (let i = 0; i < invalidLetters.length; i++) {
                expect(() => {
                    service['parseExchangeLettersToTiles'](invalidLetters[i]);
                }).toThrow(new CommandError(errorMessages[i]));
            }
        });
    });

    describe('getStartPosition', () => {
        it('should throw error if location string is invalid', () => {
            const invalidLocations: string[] = ['abcde', 'g', 'a143', 'A12', 'B3', '%4', 'a17', 'f0', 'o0', '14a'];
            const errorMessages: CommandErrorMessages[] = [
                CommandErrorMessages.BadSyntax,
                CommandErrorMessages.BadSyntax,
                CommandErrorMessages.BadSyntax,
                CommandErrorMessages.ImpossibleCommand,
                CommandErrorMessages.ImpossibleCommand,
                CommandErrorMessages.ImpossibleCommand,
                CommandErrorMessages.ImpossibleCommand,
                CommandErrorMessages.ImpossibleCommand,
                CommandErrorMessages.ImpossibleCommand,
                CommandErrorMessages.ImpossibleCommand,
            ];

            for (let i = 0; i < invalidLocations.length; i++) {
                expect(() => {
                    service['getStartPosition'](invalidLocations[i]);
                }).toThrow(new CommandError(errorMessages[i]));
            }
        });

        it('should return valid Position if location string is valid', () => {
            const validLocationStrings: string[] = ['a1', 'a15', 'b12', 'g12', 'f1', 'm12', 'o15', 'o1'];
            const expectedPositions: Position[] = [
                { row: 0, column: 0 },
                { row: 0, column: 14 },
                { row: 1, column: 11 },
                { row: 6, column: 11 },
                { row: 5, column: 0 },
                { row: 12, column: 11 },
                { row: 14, column: 14 },
                { row: 14, column: 0 },
            ];

            for (let i = 0; i < validLocationStrings.length; i++) {
                expect(service['getStartPosition'](validLocationStrings[i])).toEqual(expectedPositions[i]);
            }
        });
    });

    describe('getOrientation', () => {
        it('should throw error if orientation string is invalid', () => {
            const invalidOrientationStrings: string[] = ['vh', 'H', 'V', 'j', 'K', '*', '8'];

            for (const invalidOrientationString of invalidOrientationStrings) {
                expect(() => {
                    service['getOrientation'](invalidOrientationString);
                }).toThrow(new CommandError(CommandErrorMessages.BadSyntax));
            }
        });

        it('should return valid orientation if orientation string is valid', () => {
            const validLocationStrings: string[] = ['v', 'h'];

            expect(service['getOrientation'](validLocationStrings[0])).toBe(Orientation.Vertical);
            expect(service['getOrientation'](validLocationStrings[1])).toBe(Orientation.Horizontal);
        });
    });

    describe('getLocalPlayer', () => {
        it('should call gameService.getLocalPlayer()', () => {
            gameServiceSpy.getLocalPlayer.and.returnValue(DEFAULT_PLAYER);
            service['getLocalPlayer']();
            expect(gameServiceSpy.getLocalPlayer).toHaveBeenCalled();
        });

        it('should return player if gameservice.localPlayer exits', () => {
            gameServiceSpy.getLocalPlayer.and.returnValue(DEFAULT_PLAYER);
            expect(service['getLocalPlayer']()).toEqual(DEFAULT_PLAYER);
        });

        it('should throw PLAYER_NOT_FOUND if gameservice.localPlayer does not exist', () => {
            gameServiceSpy.getLocalPlayer.and.returnValue(undefined);
            expect(() => service['getLocalPlayer']()).toThrowError(PLAYER_NOT_FOUND);
        });
    });
});
