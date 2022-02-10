// /* eslint-disable max-lines */
// /* eslint-disable dot-notation */
// import { TestBed } from '@angular/core/testing';
// import { ActionExchangePayload, ActionPlacePayload } from '@app/classes/actions/action-data';
// import { Orientation } from '@app/classes/orientation';
// import { Player } from '@app/classes/player';
// import { Position } from '@app/classes/position';
// import { LetterValue, Tile } from '@app/classes/tile';
// import { InputControllerService } from '@app/controllers/input-controller/input-controller.service';
// import { InputParserService } from '@app/services';
// import GameService from '@app/services/game/game.service';
// import { CommandErrorMessages } from './command-error-messages';
// import CommandError from './command-errors';

// export class GameServiceSpy extends GameService {
//     handleLobbyListRequest() {
//         // eslint-disable-next-line no-console
//         console.log('handleLobbyListRequest');
//         return;
//     }
//     handleJoinLobby() {
//         return;
//     }
//     // lobbiesUpdateEvent: {subscribe: createSpy('lobbiesUpdateEvent subscribe')};
//     // lobbiesUpdateEvent
// }

// describe('InputParserService', () => {
//     const VALID_MESSAGE = 'this is a regular message';
//     const VALID_LOCATION_INPUT = 'b12h';
//     const VALID_LOCATION_INPUT_SINGLE = 'b12';
//     const VALID_LETTERS_INPUT_MULTI = 'abc';
//     const VALID_LETTERS_INPUT_SINGLE = 'a';

//     const VALID_PLACE_INPUT = `!placer ${VALID_LOCATION_INPUT} ${VALID_LETTERS_INPUT_MULTI}`;
//     const VALID_PLACE_INPUT_SINGLE = `!placer ${VALID_LOCATION_INPUT_SINGLE} ${VALID_LETTERS_INPUT_SINGLE}`;
//     const VALID_EXCHANGE_INPUT = `!échanger ${VALID_LETTERS_INPUT_MULTI}`;
//     const VALID_PASS_INPUT = '!passer';
//     const VALID_RESERVE_INPUT = '!réserve';
//     const VALID_HINT_INPUT = '!indice';
//     const VALID_HELP_INPUT = '!aide';

//     const EXPECTED_PLACE_PAYLOAD_MULTI: ActionPlacePayload = {
//         tiles: [new Tile('A' as LetterValue, 1), new Tile('B' as LetterValue, 1), new Tile('C' as LetterValue, 1)],
//         startPosition: { row: 1, column: 11 },
//         orientation: Orientation.Horizontal,
//     };
//     const EXPECTED_PLACE_PAYLOAD_SINGLE: ActionPlacePayload = {
//         tiles: [new Tile('A' as LetterValue, 1)],
//         startPosition: { row: 1, column: 11 },
//         orientation: Orientation.Horizontal,
//     };
//     const EXPECTED_EXCHANGE_PAYLOAD: ActionExchangePayload = {
//         tiles: [new Tile('A' as LetterValue, 1), new Tile('B' as LetterValue, 1), new Tile('C' as LetterValue, 1)],
//     };

//     let service: InputParserService;
//     const inputControllerSpy: jasmine.SpyObj<InputControllerService> = jasmine.createSpyObj('InputControllerService', [
//         'sendPlaceAction',
//         'sendExchangeAction',
//         'sendPassAction',
//         'sendReserveAction',
//         'sendHintAction',
//         'sendHelpAction',
//         'sendMessage',
//     ]);

//     const testPlayerTiles = [
//         new Tile('A' as LetterValue, 1),
//         new Tile('B' as LetterValue, 1),
//         new Tile('C' as LetterValue, 1),
//         new Tile('C' as LetterValue, 1),
//         new Tile('E' as LetterValue, 1),
//         new Tile('E' as LetterValue, 1),
//         new Tile('*' as LetterValue, 0),
//     ];

//     const gameServiceSpy: jasmine.SpyObj<GameService> = jasmine.createSpyObj('GameService', ['getLocalPlayer']);
//     gameServiceSpy.getLocalPlayer.and.returnValue({
//         id: '123456789',
//         name: 'testPlayer',
//         score: 200,
//         tiles: testPlayerTiles,
//         getTiles: () => {
//             return testPlayerTiles;
//         },
//         // eslint-disable-next-line @typescript-eslint/no-empty-function
//         updatePlayerData: () => {},
//     });
//     gameServiceSpy.getLocalPlayer.and.returnValue(new Player('test player'));

//     beforeEach(() => {
//         TestBed.configureTestingModule({
//             providers: [
//                 InputParserService,
//                 { provide: InputControllerService, useValue: inputControllerSpy },
//                 { provide: GameService, useValue: gameServiceSpy },
//             ],
//         });
//         service = TestBed.inject(InputParserService);
//     });

//     it('should be created', () => {
//         expect(service).toBeTruthy();
//     });

//     it('getOrientation should throw error if orientation string is invalid', () => {
//         const invalidOrientationStrings: string[] = ['vh', 'H', 'V', 'j', 'K', '*', '8'];

//         for (const invalidOrientationString of invalidOrientationStrings) {
//             expect(() => {
//                 service['getOrientation'](invalidOrientationString);
//             }).toThrow(new CommandError(CommandErrorMessages.BAD_SYNTAX));
//         }
//     });

//     it('getOrientation should return valid orientation if orientation string is valid', () => {
//         const validLocationStrings: string[] = ['v', 'h'];

//         expect(service['getOrientation'](validLocationStrings[0])).toBe(Orientation.Vertical);
//         expect(service['getOrientation'](validLocationStrings[1])).toBe(Orientation.Horizontal);
//     });

//     it('getStartPosition should throw error if location string is invalid', () => {
//         const invalidLocations: string[] = ['abcde', 'g', 'a143', 'A12', 'B3', '%4', 'a17', 'f0', 'o0', '14a'];
//         const errorMessages: CommandErrorMessages[] = [
//             CommandErrorMessages.BAD_SYNTAX,
//             CommandErrorMessages.BAD_SYNTAX,
//             CommandErrorMessages.BAD_SYNTAX,
//             CommandErrorMessages.IMPOSSIBLE_COMMAND,
//             CommandErrorMessages.IMPOSSIBLE_COMMAND,
//             CommandErrorMessages.IMPOSSIBLE_COMMAND,
//             CommandErrorMessages.IMPOSSIBLE_COMMAND,
//             CommandErrorMessages.IMPOSSIBLE_COMMAND,
//             CommandErrorMessages.IMPOSSIBLE_COMMAND,
//             CommandErrorMessages.IMPOSSIBLE_COMMAND,
//         ];

//         for (let i = 0; i < invalidLocations.length; i++) {
//             expect(() => {
//                 service['getStartPosition'](invalidLocations[i]);
//             }).toThrow(new CommandError(errorMessages[i]));
//         }
//     });

//     it('getStartPosition should return valid Position if location string is valid', () => {
//         const validLocationStrings: string[] = ['a1', 'a15', 'b12', 'g12', 'f1', 'm12', 'o15', 'o1'];
//         const expectedPositions: Position[] = [
//             { row: 0, column: 0 },
//             { row: 0, column: 14 },
//             { row: 1, column: 11 },
//             { row: 6, column: 11 },
//             { row: 5, column: 0 },
//             { row: 12, column: 11 },
//             { row: 14, column: 14 },
//             { row: 14, column: 0 },
//         ];

//         for (let i = 0; i < validLocationStrings.length; i++) {
//             expect(service['getStartPosition'](validLocationStrings[i])).toEqual(expectedPositions[i]);
//         }
//     });

//     it('parseExchangeLettersToTiles should return valid tiles with valid input', () => {
//         const validLetters = ['abce', 'abce', 'ab*', 'ccee'];
//         const expectedTiles: Tile[][] = [
//             [new Tile('A' as LetterValue, 1), new Tile('B' as LetterValue, 1), new Tile('C' as LetterValue, 1), new Tile('E' as LetterValue, 1)],
//             [new Tile('A' as LetterValue, 1), new Tile('B' as LetterValue, 1), new Tile('C' as LetterValue, 1), new Tile('E' as LetterValue, 1)],
//             [new Tile('A' as LetterValue, 1), new Tile('B' as LetterValue, 1), new Tile('*' as LetterValue, 0)],
//             [new Tile('C' as LetterValue, 1), new Tile('C' as LetterValue, 1), new Tile('E' as LetterValue, 1), new Tile('E' as LetterValue, 1)],
//         ];

//         for (let i = 0; i < validLetters.length; i++) {
//             expect(service['parseExchangeLettersToTiles'](validLetters[i])).toEqual(expectedTiles[i]);
//         }
//     });

//     it('parseExchangeLettersToTiles should throw error with invalid input', () => {
//         const invalidLetters = ['a&c"e', 'abcdefghiklm', 'lmno', 'ABCD', 'aaaa'];
//         const errorMessages: CommandErrorMessages[] = [
//             CommandErrorMessages.IMPOSSIBLE_COMMAND,
//             CommandErrorMessages.IMPOSSIBLE_COMMAND,
//             CommandErrorMessages.IMPOSSIBLE_COMMAND,
//             CommandErrorMessages.BAD_SYNTAX,
//             CommandErrorMessages.IMPOSSIBLE_COMMAND,
//         ];

//         for (let i = 0; i < invalidLetters.length; i++) {
//             expect(() => {
//                 service['parseExchangeLettersToTiles'](invalidLetters[i]);
//             }).toThrow(new CommandError(errorMessages[i]));
//         }
//     });

//     it('parsePlaceLettersToTiles should return valid tiles with valid input', () => {
//         const validLetters = ['abce', 'abce', 'ceX', 'bKcc', 'ccee'];
//         const expectedTiles: Tile[][] = [
//             [new Tile('A' as LetterValue, 1), new Tile('B' as LetterValue, 1), new Tile('C' as LetterValue, 1), new Tile('E' as LetterValue, 1)],
//             [new Tile('A' as LetterValue, 1), new Tile('B' as LetterValue, 1), new Tile('C' as LetterValue, 1), new Tile('E' as LetterValue, 1)],
//             [new Tile('C' as LetterValue, 1), new Tile('E' as LetterValue, 1), new Tile('X' as LetterValue, 0)],
//             [new Tile('B' as LetterValue, 1), new Tile('K' as LetterValue, 0), new Tile('C' as LetterValue, 1), new Tile('C' as LetterValue, 1)],
//             [new Tile('C' as LetterValue, 1), new Tile('C' as LetterValue, 1), new Tile('E' as LetterValue, 1), new Tile('E' as LetterValue, 1)],
//         ];

//         for (let i = 0; i < validLetters.length; i++) {
//             expect(service['parsePlaceLettersToTiles'](validLetters[i])).toEqual(expectedTiles[i]);
//         }
//     });

//     it('parsePlaceLettersToTiles should throw error with invalid input', () => {
//         const invalidLetters = ['a&c"e', 'abcdefghiklm', 'lmno', 'ABCD', 'aAB', 'aKL'];
//         const errorMessages: CommandErrorMessages[] = [
//             CommandErrorMessages.IMPOSSIBLE_COMMAND,
//             CommandErrorMessages.IMPOSSIBLE_COMMAND,
//             CommandErrorMessages.IMPOSSIBLE_COMMAND,
//             CommandErrorMessages.IMPOSSIBLE_COMMAND,
//             CommandErrorMessages.IMPOSSIBLE_COMMAND,
//             CommandErrorMessages.IMPOSSIBLE_COMMAND,
//         ];

//         for (let i = 0; i < invalidLetters.length; i++) {
//             expect(() => {
//                 service['parsePlaceLettersToTiles'](invalidLetters[i]);
//             }).toThrow(new CommandError(errorMessages[i]));
//         }
//     });

//     it('createExchangeActionPayload should call parseExchangeLettersToTiles', () => {
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         const exchangeParserSpy = spyOn<any>(service, 'parseExchangeLettersToTiles');
//         service['createExchangeActionPayload'](VALID_LETTERS_INPUT_MULTI);
//         expect(exchangeParserSpy).toHaveBeenCalled();
//     });

//     it('createExchangeActionPayload should return expected payload', () => {
//         expect(service['createExchangeActionPayload'](VALID_LETTERS_INPUT_MULTI)).toEqual(EXPECTED_EXCHANGE_PAYLOAD);
//     });

//     it('createPlaceActionPayloadMultipleLetters should call parsePlaceLettersToTiles', () => {
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         const placeParserSpy = spyOn<any>(service, 'parsePlaceLettersToTiles');
//         service['createPlaceActionPayloadMultipleLetters'](VALID_LOCATION_INPUT, VALID_LETTERS_INPUT_MULTI);
//         expect(placeParserSpy).toHaveBeenCalled();
//     });

//     it('createPlaceActionPayloadMultipleLetters should call getStartPosition', () => {
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         const positionSpy = spyOn<any>(service, 'getStartPosition');
//         service['createPlaceActionPayloadMultipleLetters'](VALID_LOCATION_INPUT, VALID_LETTERS_INPUT_MULTI);
//         expect(positionSpy).toHaveBeenCalled();
//     });

//     it('createPlaceActionPayloadMultipleLetters should call getOrientation', () => {
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         const orientationSpy = spyOn<any>(service, 'getOrientation');
//         service['createPlaceActionPayloadMultipleLetters'](VALID_LOCATION_INPUT, VALID_LETTERS_INPUT_MULTI);
//         expect(orientationSpy).toHaveBeenCalled();
//     });

//     it('createPlaceActionPayloadMultipleLetters should return expected payload', () => {
//         expect(service['createPlaceActionPayloadMultipleLetters'](VALID_LOCATION_INPUT, VALID_LETTERS_INPUT_MULTI)).toEqual(
//             EXPECTED_PLACE_PAYLOAD_MULTI,
//         );
//     });

//     it('createPlaceActionPayloadSingleLetter should call parsePlaceLettersToTiles', () => {
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         const placeParserSpy = spyOn<any>(service, 'parsePlaceLettersToTiles');
//         service['createPlaceActionPayloadSingleLetter'](VALID_LOCATION_INPUT, VALID_LETTERS_INPUT_SINGLE);
//         expect(placeParserSpy).toHaveBeenCalled();
//     });

//     it('createPlaceActionPayloadSingleLetter should call getStartPosition', () => {
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         const positionSpy = spyOn<any>(service, 'getStartPosition');
//         service['createPlaceActionPayloadSingleLetter'](VALID_LOCATION_INPUT, VALID_LETTERS_INPUT_SINGLE);
//         expect(positionSpy).toHaveBeenCalled();
//     });

//     it('createPlaceActionPayloadSingleLetter should NOT call getOrientation', () => {
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         const orientationSpy = spyOn<any>(service, 'getOrientation');
//         service['createPlaceActionPayloadSingleLetter'](VALID_LOCATION_INPUT, VALID_LETTERS_INPUT_SINGLE);
//         expect(orientationSpy).not.toHaveBeenCalled();
//     });

//     it('createPlaceActionPayloadSingleLetter should return expected payload (with orientation)', () => {
//         expect(service['createPlaceActionPayloadSingleLetter'](VALID_LOCATION_INPUT, VALID_LETTERS_INPUT_SINGLE)).toEqual(
//             EXPECTED_PLACE_PAYLOAD_SINGLE,
//         );
//     });

//     it('createPlaceActionPayloadSingleLetter should return expected payload (without orientation)', () => {
//         expect(service['createPlaceActionPayloadSingleLetter'](VALID_LOCATION_INPUT_SINGLE, VALID_LETTERS_INPUT_SINGLE)).toEqual(
//             EXPECTED_PLACE_PAYLOAD_SINGLE,
//         );
//     });

//     it('parseInput should call sendMessage if input doesnt start with !', () => {
//         service.parseInput(VALID_MESSAGE);
//         expect(inputControllerSpy.sendMessage).toHaveBeenCalledWith(VALID_MESSAGE);
//     });

//     it('parseInput should call sendPlaceAction if input is a valid place command (single letter)', () => {
//         service.parseInput(VALID_PLACE_INPUT_SINGLE);
//         expect(inputControllerSpy.sendPlaceAction).toHaveBeenCalledWith(EXPECTED_PLACE_PAYLOAD_SINGLE);
//     });

//     it('parseInput should call sendPlaceAction if input is a valid place command (multiple letters)', () => {
//         service.parseInput(VALID_PLACE_INPUT);
//         expect(inputControllerSpy.sendPlaceAction).toHaveBeenCalledWith(EXPECTED_PLACE_PAYLOAD_MULTI);
//     });

//     it('parseInput should call sendExchangeAction if input is a valid exchange command', () => {
//         service.parseInput(VALID_EXCHANGE_INPUT);
//         expect(inputControllerSpy.sendExchangeAction).toHaveBeenCalledWith(EXPECTED_EXCHANGE_PAYLOAD);
//     });

//     it('parseInput should call sendPassAction if input is a valid pass command', () => {
//         service.parseInput(VALID_PASS_INPUT);
//         expect(inputControllerSpy.sendPassAction).toHaveBeenCalled();
//     });

//     it('parseInput should call sendReserveAction if input is a valid reserve command', () => {
//         service.parseInput(VALID_RESERVE_INPUT);
//         expect(inputControllerSpy.sendReserveAction).toHaveBeenCalled();
//     });

//     it('parseInput should call sendHintAction if input is a valid hint command', () => {
//         service.parseInput(VALID_HINT_INPUT);
//         expect(inputControllerSpy.sendHintAction).toHaveBeenCalled();
//     });

//     it('parseInput should call sendHelpAction if input is a valid help command', () => {
//         service.parseInput(VALID_HELP_INPUT);
//         expect(inputControllerSpy.sendHelpAction).toHaveBeenCalled();
//     });

//     it('parseInput should throw error if commands have incorrect lengths', () => {
//         const invalidCommands = [
//             '!placer abc',
//             '!échanger one two three',
//             '!passer thing',
//             '!réserve second word',
//             '!indice not length of two',
//             '!aide help',
//         ];

//         for (const invalidCommand of invalidCommands) {
//             expect(() => {
//                 service.parseInput(invalidCommand);
//             }).toThrow(new CommandError(CommandErrorMessages.BAD_SYNTAX));
//         }
//     });

//     it('parseInput should throw error if command does not exist', () => {
//         expect(() => {
//             service.parseInput('!trouver un ami');
//         }).toThrow(new CommandError(CommandErrorMessages.INVALID_ENTRY));
//     });
// });
