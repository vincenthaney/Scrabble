import { Injectable, OnDestroy } from '@angular/core';
import { ActionData, ActionExchangePayload, ActionPlacePayload, ActionType } from '@app/classes/actions/action-data';
import { Message } from '@app/classes/communication/message';
import { Orientation } from '@app/classes/orientation';
import { AbstractPlayer } from '@app/classes/player';
import { Position } from '@app/classes/position';
import { LetterValue, Tile } from '@app/classes/tile';
import {
    EXPECTED_WORD_COUNT_EXCHANGE,
    EXPECTED_WORD_COUNT_HELP,
    EXPECTED_WORD_COUNT_PASS,
    EXPECTED_WORD_COUNT_PLACE,
    EXPECTED_WORD_COUNT_RESERVE,
    MAX_COL_NUMBER,
    MAX_LOCATION_COMMAND_LENGTH,
    MAX_ROW_NUMBER,
    MIN_COL_NUMBER,
    MIN_LOCATION_COMMAND_LENGTH,
    MIN_ROW_NUMBER,
    ON_YOUR_TURN_ACTIONS,
    SYSTEM_ID,
} from '@app/constants/game';
import { GamePlayController } from '@app/controllers/game-play-controller/game-play.controller';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GameService } from '..';
import { CommandErrorMessages, PLAYER_NOT_FOUND } from './command-error-messages';
import CommandError from './command-errors';

const ASCII_VALUE_OF_LOWERCASE_A = 97;

@Injectable({
    providedIn: 'root',
})
export default class InputParserService implements OnDestroy {
    serviceDestroyed$: Subject<boolean> = new Subject();

    private newMessageValue = new BehaviorSubject<Message>({
        content: 'Début de la partie',
        senderId: SYSTEM_ID,
    });

    constructor(private controller: GamePlayController, private gameService: GameService) {
        this.gameService.newMessageValue.pipe(takeUntil(this.serviceDestroyed$)).subscribe((newMessage) => {
            this.emitNewMessage(newMessage);
        });
    }

    ngOnDestroy(): void {
        this.serviceDestroyed$.next(true);
        this.serviceDestroyed$.complete();
    }

    emitNewMessage(newMessage: Message): void {
        this.newMessageValue.next(newMessage);
    }

    parseInput(input: string): void {
        const playerId = this.getLocalPlayerId();
        const gameId: string = this.gameService.getGameId();

        if (input[0] === '!') {
            // it is an action
            const inputWords: string[] = input.substring(1).split(' ');
            const actionName: string = inputWords[0];

            try {
                const actionData: ActionData = this.parseCommand(actionName, inputWords);
                this.controller.sendMessage(this.gameService.getGameId(), playerId, {
                    content: input,
                    senderId: this.getLocalPlayer().id,
                });
                this.controller.sendAction(gameId, playerId, actionData);
            } catch (e) {
                if (e instanceof CommandError) {
                    if (e.message === CommandErrorMessages.NotYourTurn) {
                        this.controller.sendError(this.gameService.getGameId(), playerId, {
                            content: e.message,
                            senderId: SYSTEM_ID,
                        });
                    } else {
                        this.controller.sendError(this.gameService.getGameId(), playerId, {
                            content: `La commande ${input} est invalide`,
                            senderId: SYSTEM_ID,
                        });
                    }
                }
            }
        } else {
            this.controller.sendMessage(this.gameService.getGameId(), playerId, {
                content: input,
                senderId: this.getLocalPlayer().id,
            });
        }
    }

    private parseCommand(actionName: string, inputWords: string[]): ActionData {
        const playerId = this.getLocalPlayerId();
        // eslint-disable-next-line dot-notation
        const currentPlayerId = this.gameService['roundManager'].currentRound.player.id;

        let actionData: ActionData;
        if (ON_YOUR_TURN_ACTIONS.includes(actionName) && currentPlayerId !== playerId) throw new CommandError(CommandErrorMessages.NotYourTurn);

        switch (actionName) {
            case 'placer': {
                if (inputWords.length !== EXPECTED_WORD_COUNT_PLACE) throw new CommandError(CommandErrorMessages.BadSyntax);

                const nLettersToPlace = inputWords[2].length;
                if (nLettersToPlace === 1) {
                    actionData = {
                        type: ActionType.PLACE,
                        payload: this.createPlaceActionPayloadSingleLetter(inputWords[1], inputWords[2]),
                    };
                } else {
                    actionData = {
                        type: ActionType.PLACE,
                        payload: this.createPlaceActionPayloadMultipleLetters(inputWords[1], inputWords[2]),
                    };
                }
                break;
            }
            case 'échanger':
                if (inputWords.length !== EXPECTED_WORD_COUNT_EXCHANGE) throw new CommandError(CommandErrorMessages.BadSyntax);
                actionData = {
                    type: ActionType.EXCHANGE,
                    payload: this.createExchangeActionPayload(inputWords[1]),
                };
                break;
            case 'passer':
                if (inputWords.length !== EXPECTED_WORD_COUNT_PASS) throw new CommandError(CommandErrorMessages.BadSyntax);
                actionData = {
                    type: ActionType.PASS,
                    payload: {},
                };
                break;
            case 'réserve':
                if (inputWords.length !== EXPECTED_WORD_COUNT_RESERVE) throw new CommandError(CommandErrorMessages.BadSyntax);
                actionData = {
                    type: ActionType.RESERVE,
                    payload: {},
                };
                break;
            // case 'indice':
            //     if (inputWords.length !== EXPECTED_WORD_COUNT_HINT) throw new CommandError(CommandErrorMessages.BadSyntax);
            //     // this.controller.sendHintAction();
            //     break;
            case 'aide':
                if (inputWords.length !== EXPECTED_WORD_COUNT_HELP) throw new CommandError(CommandErrorMessages.BadSyntax);
                actionData = {
                    type: ActionType.HELP,
                    payload: {},
                };
                break;
            default:
                throw new CommandError(CommandErrorMessages.InvalidEntry);
        }
        return actionData;
    }

    private createPlaceActionPayloadSingleLetter(location: string, lettersToPlace: string): ActionPlacePayload {
        const lastLocationChar = location.charAt(location.length - 1);
        let positionString = '';
        if (lastLocationChar.toLowerCase() === lastLocationChar.toUpperCase()) {
            positionString = location;
        } else {
            positionString = location.substring(0, location.length - 1);
        }

        const placeActionPayload: ActionPlacePayload = {
            tiles: this.parsePlaceLettersToTiles(lettersToPlace),
            startPosition: this.getStartPosition(positionString),
            orientation: Orientation.Horizontal,
        };

        return placeActionPayload;
    }

    private createPlaceActionPayloadMultipleLetters(location: string, lettersToPlace: string): ActionPlacePayload {
        const placeActionPayload: ActionPlacePayload = {
            tiles: this.parsePlaceLettersToTiles(lettersToPlace),
            startPosition: this.getStartPosition(location.substring(0, location.length - 1)),
            orientation: this.getOrientation(location.charAt(location.length - 1)),
        };

        return placeActionPayload;
    }

    private createExchangeActionPayload(lettersToExchange: string): ActionExchangePayload {
        const exchangeActionPayload: ActionExchangePayload = {
            tiles: this.parseExchangeLettersToTiles(lettersToExchange),
        };

        return exchangeActionPayload;
    }

    private parsePlaceLettersToTiles(lettersToPlace: string): Tile[] {
        const player: AbstractPlayer = this.getLocalPlayer();
        const playerTiles: Tile[] = [];
        player.getTiles().forEach((tile) => {
            playerTiles.push(new Tile(tile.letter, tile.value));
        });
        const tilesToPlace: Tile[] = [];

        for (const letter of lettersToPlace) {
            for (let i = Object.values(playerTiles).length - 1; i >= 0; i--) {
                if (playerTiles[i].letter.toLowerCase() === letter) {
                    tilesToPlace.push(playerTiles.splice(i, 1)[0]);
                    break;
                } else if (playerTiles[i].letter === '*' && (letter as LetterValue) && letter === letter.toUpperCase()) {
                    const tile = playerTiles.splice(i, 1)[0];
                    tilesToPlace.push(new Tile(letter as LetterValue, tile.value));
                    break;
                }
            }
        }

        if (tilesToPlace.length !== lettersToPlace.length) throw new CommandError(CommandErrorMessages.ImpossibleCommand);

        return tilesToPlace;
    }

    private parseExchangeLettersToTiles(lettersToExchange: string): Tile[] {
        // user must type exchange letters in lower case
        if (lettersToExchange !== lettersToExchange.toLowerCase()) throw new CommandError(CommandErrorMessages.BadSyntax);

        const player: AbstractPlayer = this.getLocalPlayer();
        const playerTiles: Tile[] = [];
        player.getTiles().forEach((tile) => {
            playerTiles.push(new Tile(tile.letter, tile.value));
        });
        const tilesToExchange: Tile[] = [];

        for (const letter of lettersToExchange) {
            for (let i = Object.values(playerTiles).length - 1; i >= 0; i--) {
                if (playerTiles[i].letter.toLowerCase() === letter) {
                    const tile = playerTiles.splice(i, 1)[0];
                    tilesToExchange.push(tile);
                    break;
                }
            }
        }

        if (tilesToExchange.length !== lettersToExchange.length) throw new CommandError(CommandErrorMessages.ImpossibleCommand);

        return tilesToExchange;
    }

    private getStartPosition(location: string): Position {
        if (location.length > MAX_LOCATION_COMMAND_LENGTH || location.length < MIN_LOCATION_COMMAND_LENGTH) {
            throw new CommandError(CommandErrorMessages.BadSyntax);
        }

        const inputRow: number = location[0].charCodeAt(0) - ASCII_VALUE_OF_LOWERCASE_A;
        if (inputRow < MIN_ROW_NUMBER || inputRow > MAX_ROW_NUMBER) {
            throw new CommandError(CommandErrorMessages.ImpossibleCommand);
        }

        const inputCol: number = +location.substring(1) - 1;
        if (inputCol < MIN_COL_NUMBER || inputCol > MAX_COL_NUMBER) {
            throw new CommandError(CommandErrorMessages.ImpossibleCommand);
        }

        const inputStartPosition: Position = {
            row: inputRow,
            column: inputCol,
        };
        return inputStartPosition;
    }

    private getOrientation(orientationString: string): Orientation {
        if (orientationString.length !== 1) throw new CommandError(CommandErrorMessages.BadSyntax);

        if (orientationString === 'h') return Orientation.Horizontal;
        else if (orientationString === 'v') return Orientation.Vertical;
        else throw new CommandError(CommandErrorMessages.BadSyntax);
    }

    private getLocalPlayerId(): string {
        return this.getLocalPlayer().id;
    }

    private getLocalPlayer(): AbstractPlayer {
        let player: AbstractPlayer;
        const localPlayer: AbstractPlayer | undefined = this.gameService.getLocalPlayer();
        if (localPlayer instanceof AbstractPlayer) {
            player = localPlayer;
        } else {
            throw new Error(PLAYER_NOT_FOUND);
        }

        return player;
    }
}
