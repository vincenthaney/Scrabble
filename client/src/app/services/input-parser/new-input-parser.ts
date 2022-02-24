/* eslint-disable dot-notation */
import { Injectable } from '@angular/core';
import { ActionData, ActionExchangePayload, ActionPlacePayload, ActionType, ACTION_COMMAND_INDICATOR } from '@app/classes/actions/action-data';
import CommandError from '@app/classes/command-error';
import { Location } from '@app/classes/location';
import { Orientation } from '@app/classes/orientation';
import { AbstractPlayer } from '@app/classes/player';
import { Position } from '@app/classes/position';
import { LetterValue, Tile } from '@app/classes/tile';
import { CommandErrorMessages, PLAYER_NOT_FOUND } from '@app/constants/command-error-messages';
import { BOARD_SIZE, ExpectedCommandWordCount, ON_YOUR_TURN_ACTIONS, SYSTEM_ERROR_ID } from '@app/constants/game';
import { GamePlayController } from '@app/controllers/game-play-controller/game-play.controller';
import { GameService } from '..';

const ASCII_VALUE_OF_LOWERCASE_A = 97;

@Injectable({
    providedIn: 'root',
})
export default class InputParserService {
    constructor(private controller: GamePlayController, private gameService: GameService) {}

    parseInput(input: string): void {
        const playerId = this.getLocalPlayer().id;
        const gameId = this.gameService.getGameId();

        if (this.isAction(input)) {
            this.parseCommand(input, gameId, playerId);
        } else {
            this.controller.sendMessage(gameId, playerId, {
                content: input,
                senderId: playerId,
            });
        }
    }

    private separateCommandWords(input: string): string[] {
        return input.substring(1).split(' ');
    }

    private isAction(input: string) {
        return input[0] === ACTION_COMMAND_INDICATOR;
    }

    private verifyActionValidity(actionName: ActionType) {
        if (!actionName) throw new CommandError(CommandErrorMessages.InvalidEntry);
        if (this.gameService.isGameOver) throw new CommandError(CommandErrorMessages.GameOver);
        if (!this.gameService.isLocalPlayerPlaying() && ON_YOUR_TURN_ACTIONS.includes(actionName))
            throw new CommandError(CommandErrorMessages.NotYourTurn);
    }

    private parseCommand(input: string, gameId: string, playerId: string): void {
        try {
            this.controller.sendAction(gameId, playerId, this.createActionData(input));
        } catch (e) {
            if (e instanceof CommandError) {
                const errorMessageContent =
                    e.message === CommandErrorMessages.NotYourTurn ? e.message : `La commande **${input}** est invalide :<br />${e.message}`;

                this.controller.sendError(gameId, playerId, {
                    content: errorMessageContent,
                    senderId: SYSTEM_ERROR_ID,
                });
            }
        }
    }

    private createActionData(input: string): ActionData {
        const inputWords: string[] = this.separateCommandWords(input);
        const actionName: string = inputWords[0];
        let actionData: ActionData;

        this.verifyActionValidity(actionName as ActionType);

        switch (actionName) {
            case ActionType.PLACE:
                {
                    if (inputWords.length !== ExpectedCommandWordCount.Place) throw new CommandError(CommandErrorMessages.PlaceBadSyntax);
                    actionData = {
                        type: ActionType.PLACE,
                        input,
                        payload: this.createPlaceActionPayload(inputWords[1], inputWords[2]),
                    };
                }
                break;
            case ActionType.EXCHANGE:
                if (inputWords.length !== ExpectedCommandWordCount.Exchange) throw new CommandError(CommandErrorMessages.ExchangeBadSyntax);
                actionData = {
                    type: ActionType.EXCHANGE,
                    input,
                    payload: this.createExchangeActionPayload(inputWords[1]),
                };
                break;
            case ActionType.PASS:
                if (inputWords.length !== ExpectedCommandWordCount.Pass) throw new CommandError(CommandErrorMessages.PassBadSyntax);
                actionData = {
                    type: ActionType.PASS,
                    input,
                    payload: {},
                };
                break;
            case ActionType.RESERVE:
                if (inputWords.length !== ExpectedCommandWordCount.Reserve) throw new CommandError(CommandErrorMessages.BadSyntax);
                actionData = {
                    type: ActionType.RESERVE,
                    input,
                    payload: {},
                };
                break;
            // case ActionType.Hint:
            //     if (inputWords.length !== ExpectedCommandWordCount.Hint) throw new CommandError(CommandErrorMessages.BadSyntax);
            //     // this.controller.sendHintAction();
            //     break;
            case ActionType.HELP:
                if (inputWords.length !== ExpectedCommandWordCount.Help) throw new CommandError(CommandErrorMessages.BadSyntax);
                actionData = {
                    type: ActionType.HELP,
                    input,
                    payload: {},
                };
                break;
            default:
                throw new CommandError(CommandErrorMessages.InvalidEntry);
        }
        return actionData;
    }

    private createPlaceActionPayload(locationString: string, lettersToPlace: string): ActionPlacePayload {
        const location: Location = this.createLocation(locationString, lettersToPlace.length);

        const placeActionPayload: ActionPlacePayload = {
            tiles: this.parsePlaceLettersToTiles(lettersToPlace),
            startPosition: this.getStartPosition(location),
            orientation: Orientation.Horizontal,
        };

        this.gameService.playingTiles.emit(placeActionPayload);
        return placeActionPayload;
    }

    // private createPlaceActionPayloadMultipleLetters(location: string, lettersToPlace: string): ActionPlacePayload {
    //     const placeActionPayload: ActionPlacePayload = {
    //         tiles: this.parsePlaceLettersToTiles(lettersToPlace),
    //         startPosition: this.getStartPosition(location.substring(0, location.length - 1)),
    //         orientation: this.getOrientation(location.charAt(location.length - 1)),
    //     };

    //     this.gameService.playingTiles.emit(placeActionPayload);

    //     return placeActionPayload;
    // }

    private createExchangeActionPayload(lettersToExchange: string): ActionExchangePayload {
        return {
            tiles: this.parseExchangeLettersToTiles(lettersToExchange),
        };
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

    private isNumber(char: string): boolean {
        return !isNaN(parseInt(char, 10));
    }

    private createLocation(locationString: string, nLettersToPlace: number): Location {
        const locationLastChar = locationString.charAt(locationString.length - 1);
        const rowNumber: number = locationString.charCodeAt(0) - ASCII_VALUE_OF_LOWERCASE_A;
        const colNumber = parseInt(locationString.substring(1), 10) - 1;
        let orientation: Orientation;

        if (this.isNumber(locationLastChar)) {
            if (locationLastChar === 'h') orientation = Orientation.Horizontal;
            else if (locationLastChar === 'v') orientation = Orientation.Vertical;
            else throw new CommandError(CommandErrorMessages.BadSyntax);
        } else {
            if (nLettersToPlace !== 1) throw new CommandError(CommandErrorMessages.PlaceBadSyntax);
            orientation = Orientation.Horizontal;
        }

        return {
            row: rowNumber,
            col: colNumber,
            orientation,
        };
    }

    private getStartPosition(location: Location): Position {
        const inputStartPosition: Position = {
            row: location.row,
            column: location.col,
        };

        if (!this.isPositionWithinBounds(inputStartPosition)) throw new CommandError(CommandErrorMessages.PositionFormat);
        return inputStartPosition;
    }

    private isPositionWithinBounds(position: Position) {
        return position.row >= 0 && position.column >= 0 && position.row < BOARD_SIZE && position.column < BOARD_SIZE;
    }

    private getLocalPlayer(): AbstractPlayer {
        const localPlayer: AbstractPlayer | undefined = this.gameService.getLocalPlayer();
        if (localPlayer) {
            return localPlayer;
        }
        throw new Error(PLAYER_NOT_FOUND);
    }
}
