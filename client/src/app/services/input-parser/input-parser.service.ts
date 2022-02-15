/* eslint-disable dot-notation */
import { Injectable } from '@angular/core';
import { ActionData, ActionExchangePayload, ActionPlacePayload, ActionType } from '@app/classes/actions/action-data';
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
    SYSTEM_ERROR_ID,
} from '@app/constants/game';
import { GamePlayController } from '@app/controllers/game-play-controller/game-play.controller';
import { GameService } from '..';
import { CommandErrorMessages, PLAYER_NOT_FOUND } from './command-error-messages';
import CommandError from './command-errors';

const ASCII_VALUE_OF_LOWERCASE_A = 97;

@Injectable({
    providedIn: 'root',
})
export default class InputParserService {
    constructor(private controller: GamePlayController, private gameService: GameService) {}

    parseInput(input: string): void {
        const playerId = this.getLocalPlayer().id;
        const gameId: string = this.gameService.getGameId();

        if (input[0] === '!') {
            // it is an action
            const inputWords: string[] = input.substring(1).split(' ');

            try {
                const actionData: ActionData = this.parseCommand(inputWords);
                this.controller.sendAction(gameId, playerId, actionData, input);
            } catch (e) {
                if (e instanceof CommandError) {
                    const errorMessageContent =
                        e.message === CommandErrorMessages.NotYourTurn ? e.message : `La commande **${input}** est invalide :<br />${e.message}`;

                    this.controller.sendError(this.gameService.getGameId(), playerId, {
                        content: errorMessageContent,
                        senderId: SYSTEM_ERROR_ID,
                    });
                }
            }
        } else {
            this.controller.sendMessage(this.gameService.getGameId(), playerId, {
                content: input,
                senderId: playerId,
            });
        }
    }

    private parseCommand(inputWords: string[]): ActionData {
        if (this.gameService.isGameOver) throw new CommandError(CommandErrorMessages.ImpossibleCommand);

        const actionName: string = inputWords[0];

        let actionData: ActionData;
        if (ON_YOUR_TURN_ACTIONS.includes(actionName) && !this.gameService.isLocalPlayerPlaying())
            throw new CommandError(CommandErrorMessages.NotYourTurn);

        switch (actionName) {
            case 'placer': {
                if (inputWords.length !== EXPECTED_WORD_COUNT_PLACE) throw new CommandError(CommandErrorMessages.PlaceBadSyntax);

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
                if (inputWords.length !== EXPECTED_WORD_COUNT_EXCHANGE) throw new CommandError(CommandErrorMessages.ExchangeBadSyntax);
                actionData = {
                    type: ActionType.EXCHANGE,
                    payload: this.createExchangeActionPayload(inputWords[1]),
                };
                break;
            case 'passer':
                if (inputWords.length !== EXPECTED_WORD_COUNT_PASS) throw new CommandError(CommandErrorMessages.PassBadSyntax);
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

        this.gameService.playingTiles.emit(placeActionPayload);

        return placeActionPayload;
    }

    private createPlaceActionPayloadMultipleLetters(location: string, lettersToPlace: string): ActionPlacePayload {
        const placeActionPayload: ActionPlacePayload = {
            tiles: this.parsePlaceLettersToTiles(lettersToPlace),
            startPosition: this.getStartPosition(location.substring(0, location.length - 1)),
            orientation: this.getOrientation(location.charAt(location.length - 1)),
        };

        this.gameService.playingTiles.emit(placeActionPayload);

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
        player.getTiles().forEach((tile: Tile) => {
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
                    tilesToPlace.push(new Tile(letter as LetterValue, tile.value, true));
                    break;
                }
            }
        }

        if (tilesToPlace.length !== lettersToPlace.length) throw new CommandError(CommandErrorMessages.DontHaveTiles);

        return tilesToPlace;
    }

    private parseExchangeLettersToTiles(lettersToExchange: string): Tile[] {
        // user must type exchange letters in lower case
        if (lettersToExchange !== lettersToExchange.toLowerCase()) throw new CommandError(CommandErrorMessages.ExhangeRequireLowercaseLettes);

        const player: AbstractPlayer = this.getLocalPlayer();
        const playerTiles: Tile[] = [];
        player.getTiles().forEach((tile: Tile) => {
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

        if (tilesToExchange.length !== lettersToExchange.length) throw new CommandError(CommandErrorMessages.DontHaveTiles);

        return tilesToExchange;
    }

    private getStartPosition(location: string): Position {
        if (location.length > MAX_LOCATION_COMMAND_LENGTH || location.length < MIN_LOCATION_COMMAND_LENGTH) {
            throw new CommandError(CommandErrorMessages.BadSyntax);
        }

        const inputRow: number = location[0].charCodeAt(0) - ASCII_VALUE_OF_LOWERCASE_A;
        if (inputRow < MIN_ROW_NUMBER || inputRow > MAX_ROW_NUMBER) {
            throw new CommandError(CommandErrorMessages.PositionFormat);
        }

        const inputCol: number = +location.substring(1) - 1;
        if (inputCol < MIN_COL_NUMBER || inputCol > MAX_COL_NUMBER) {
            throw new CommandError(CommandErrorMessages.PositionFormat);
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

    private getLocalPlayer(): AbstractPlayer {
        const localPlayer: AbstractPlayer | undefined = this.gameService.getLocalPlayer();
        if (localPlayer) {
            return localPlayer;
        }
        throw new Error(PLAYER_NOT_FOUND);
    }
}
