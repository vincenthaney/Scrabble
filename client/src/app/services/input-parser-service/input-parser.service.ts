import { Injectable } from '@angular/core';
import { ActionData, ActionType, ACTION_COMMAND_INDICATOR, ExchangeActionPayload, PlaceActionPayload } from '@app/classes/actions/action-data';
import CommandException from '@app/classes/command-exception';
import { Location } from '@app/classes/location';
import { Orientation } from '@app/classes/orientation';
import { AbstractPlayer } from '@app/classes/player';
import { Position } from '@app/classes/position';
import { LetterValue, Tile } from '@app/classes/tile';
import { CommandExceptionMessages, PLAYER_NOT_FOUND } from '@app/constants/command-exception-messages';
import {
    BLANK_TILE_LETTER_VALUE,
    BOARD_SIZE,
    DEFAULT_ORIENTATION,
    ExpectedCommandWordCount,
    LETTER_VALUES,
    ON_YOUR_TURN_ACTIONS,
    SYSTEM_ERROR_ID,
} from '@app/constants/game';
import { GamePlayController } from '@app/controllers/game-play-controller/game-play.controller';
import { GameService } from '@app/services';
import { GameViewEventManagerService } from '@app/services/game-view-event-manager-service/game-view-event-manager.service';
import { isNumber } from '@app/utils/is-number';
import { removeAccents } from '@app/utils/remove-accents';

const ASCII_VALUE_OF_LOWERCASE_A = 97;

@Injectable({
    providedIn: 'root',
})
export default class InputParserService {
    constructor(
        private controller: GamePlayController,
        private gameService: GameService,
        private gameViewEventManagerService: GameViewEventManagerService,
    ) {}

    handleInput(input: string): void {
        const playerId = this.getLocalPlayer().id;
        const gameId = this.gameService.getGameId();

        if (this.isAction(input)) {
            this.handleCommand(input, gameId, playerId);
        } else {
            this.controller.sendMessage(gameId, playerId, {
                content: input,
                senderId: playerId,
                gameId,
            });
        }
    }

    private handleCommand(input: string, gameId: string, playerId: string): void {
        try {
            this.controller.sendAction(gameId, playerId, this.createActionData(input));
        } catch (exception) {
            if (exception instanceof CommandException) {
                const errorMessageContent =
                    exception.message === CommandExceptionMessages.NotYourTurn
                        ? exception.message
                        : `La commande **${input}** est invalide :<br />${exception.message}`;

                this.controller.sendError(gameId, playerId, {
                    content: errorMessageContent,
                    senderId: SYSTEM_ERROR_ID,
                    gameId,
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
                if (inputWords.length !== ExpectedCommandWordCount.Place) throw new CommandException(CommandExceptionMessages.PlaceBadSyntax);
                actionData = {
                    type: ActionType.PLACE,
                    input,
                    payload: this.createPlaceActionPayload(inputWords[1], inputWords[2]),
                };
                break;
            case ActionType.EXCHANGE:
                if (inputWords.length !== ExpectedCommandWordCount.Exchange) throw new CommandException(CommandExceptionMessages.ExchangeBadSyntax);
                actionData = {
                    type: ActionType.EXCHANGE,
                    input,
                    payload: this.createExchangeActionPayload(inputWords[1]),
                };
                break;
            case ActionType.PASS:
                if (inputWords.length !== ExpectedCommandWordCount.Pass) throw new CommandException(CommandExceptionMessages.PassBadSyntax);
                actionData = {
                    type: ActionType.PASS,
                    input,
                    payload: {},
                };
                break;
            case ActionType.RESERVE:
                if (inputWords.length !== ExpectedCommandWordCount.Reserve) throw new CommandException(CommandExceptionMessages.BadSyntax);
                actionData = {
                    type: ActionType.RESERVE,
                    input,
                    payload: {},
                };
                break;
            case ActionType.HINT:
                if (inputWords.length !== ExpectedCommandWordCount.Hint) throw new CommandException(CommandExceptionMessages.BadSyntax);
                actionData = {
                    type: ActionType.HINT,
                    input,
                    payload: {},
                };
                break;
            case ActionType.HELP:
                if (inputWords.length !== ExpectedCommandWordCount.Help) throw new CommandException(CommandExceptionMessages.BadSyntax);
                actionData = {
                    type: ActionType.HELP,
                    input,
                    payload: {},
                };
                break;
            default:
                throw new CommandException(CommandExceptionMessages.InvalidEntry);
        }
        return actionData;
    }

    private createLocation(locationString: string, nLettersToPlace: number): Location {
        const locationLastChar = locationString.charAt(locationString.length - 1);
        const rowNumber: number = this.getRowNumberFromChar(locationString[0]);
        const colNumber = parseInt(locationString.substring(1), 10) - 1;
        let orientation: Orientation;

        if (isNumber(locationLastChar)) {
            if (nLettersToPlace !== 1) throw new CommandException(CommandExceptionMessages.PlaceBadSyntax);
            orientation = DEFAULT_ORIENTATION;
        } else {
            if (locationLastChar === 'h') orientation = Orientation.Horizontal;
            else if (locationLastChar === 'v') orientation = Orientation.Vertical;
            else throw new CommandException(CommandExceptionMessages.BadSyntax);
        }

        return {
            row: rowNumber,
            col: colNumber,
            orientation,
        };
    }

    private createPlaceActionPayload(locationString: string, lettersToPlace: string): PlaceActionPayload {
        const location: Location = this.createLocation(locationString, lettersToPlace.length);

        const placeActionPayload: PlaceActionPayload = {
            tiles: this.parseLettersToTiles(removeAccents(lettersToPlace), ActionType.PLACE),
            startPosition: this.getStartPosition(location),
            orientation: location.orientation,
        };

        this.gameViewEventManagerService.emitGameViewEvent('usedTiles', placeActionPayload);

        return placeActionPayload;
    }

    private createExchangeActionPayload(lettersToExchange: string): ExchangeActionPayload {
        return {
            tiles: this.parseLettersToTiles(removeAccents(lettersToExchange), ActionType.EXCHANGE),
        };
    }

    private parseLettersToTiles(lettersToParse: string, actionType: ActionType.PLACE | ActionType.EXCHANGE): Tile[] {
        if (actionType === ActionType.EXCHANGE) {
            if (lettersToParse !== lettersToParse.toLowerCase()) throw new CommandException(CommandExceptionMessages.ExchangeRequireLowercaseLetters);
        }

        const player: AbstractPlayer = this.getLocalPlayer();
        const playerTiles: Tile[] = [];
        player.getTiles().forEach((tile: Tile) => {
            playerTiles.push(new Tile(tile.letter, tile.value));
        });
        const parsedTiles: Tile[] = [];

        for (const letter of lettersToParse) {
            for (let i = Object.values(playerTiles).length - 1; i >= 0; i--) {
                if (playerTiles[i].letter.toLowerCase() === letter) {
                    parsedTiles.push(playerTiles.splice(i, 1)[0]);
                    break;
                } else if (actionType === ActionType.PLACE && this.isValidBlankTileCombination(playerTiles[i].letter, letter)) {
                    const tile = playerTiles.splice(i, 1)[0];
                    parsedTiles.push(new Tile(letter as LetterValue, tile.value, true));
                    break;
                }
            }
        }

        if (parsedTiles.length !== lettersToParse.length) throw new CommandException(CommandExceptionMessages.DontHaveTiles);

        return parsedTiles;
    }

    private isValidBlankTileCombination(playerLetter: string, placeLetter: string): boolean {
        return (
            playerLetter === BLANK_TILE_LETTER_VALUE &&
            LETTER_VALUES.includes(placeLetter as LetterValue) &&
            placeLetter === placeLetter.toUpperCase()
        );
    }

    private isPositionWithinBounds(position: Position): boolean {
        return position.row >= 0 && position.column >= 0 && position.row < BOARD_SIZE && position.column < BOARD_SIZE;
    }

    private isAction(input: string): boolean {
        return input[0] === ACTION_COMMAND_INDICATOR;
    }

    private separateCommandWords(input: string): string[] {
        return input.substring(1).split(' ');
    }

    private verifyActionValidity(actionName: ActionType): void {
        if (!actionName) throw new CommandException(CommandExceptionMessages.InvalidEntry);
        if (this.gameService.isGameOver) throw new CommandException(CommandExceptionMessages.GameOver);
        if (!this.gameService.isLocalPlayerPlaying() && ON_YOUR_TURN_ACTIONS.includes(actionName))
            throw new CommandException(CommandExceptionMessages.NotYourTurn);
    }

    private getStartPosition(location: Location): Position {
        const inputStartPosition: Position = {
            row: location.row,
            column: location.col,
        };

        if (!this.isPositionWithinBounds(inputStartPosition)) throw new CommandException(CommandExceptionMessages.PositionFormat);
        return inputStartPosition;
    }

    private getLocalPlayer(): AbstractPlayer {
        const localPlayer: AbstractPlayer | undefined = this.gameService.getLocalPlayer();
        if (localPlayer) {
            return localPlayer;
        }
        throw new Error(PLAYER_NOT_FOUND);
    }

    private getRowNumberFromChar(char: string): number {
        return char.charCodeAt(0) - ASCII_VALUE_OF_LOWERCASE_A;
    }
}
