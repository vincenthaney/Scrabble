import { Injectable } from '@angular/core';
import { ActionExchangePayload } from '@app/classes/actions/action-exchange';
import { ActionPlacePayload } from '@app/classes/actions/action-place';
import { Orientation } from '@app/classes/orientation';
import { IPlayer } from '@app/classes/player';
import { Position } from '@app/classes/position';
import { LetterValue, Tile } from '@app/classes/tile';
import {
    MAX_COL_NUMBER,
    MAX_LOCATION_COMMAND_LENGTH,
    MAX_ROW_NUMBER,
    MIN_COL_NUMBER,
    MIN_LOCATION_COMMAND_LENGTH,
    MIN_ROW_NUMBER
} from '@app/constants/game';
import { InputControllerService } from '@app/controllers/input-controller/input-controller.service';
import { GameService } from '..';
import { INVALID_COMMAND } from './command-errors';

const ASCII_VALUE_OF_LOWERCASE_A = 97;

@Injectable({
    providedIn: 'root',
})
export default class InputParserService {
    constructor(private controller: InputControllerService, private gameService: GameService) {}

    parseInput(input: string): void {
        if (input[0] === '!') {
            // it is an action
            const inputWords: string[] = input.substring(1).split(' ');
            const actionName: string = inputWords[0];

            switch (actionName) {
                case 'placer':
                    if (inputWords.length !== 3) throw new Error(INVALID_COMMAND);

                    if (inputWords[2].length === 1) {
                        this.controller.sendPlaceAction(this.createPlaceActionPayloadSingleLetter(inputWords[1], inputWords[2]));
                    } else {
                        this.controller.sendPlaceAction(this.createPlaceActionPayloadMultipleLetters(inputWords[1], inputWords[2]));
                    }
                    break;
                case 'échanger':
                    if (inputWords.length !== 2) throw new Error(INVALID_COMMAND);
                    this.controller.sendExchangeAction(this.createExchangeActionPayload(inputWords[1]));
                    break;
                case 'passer':
                    if (inputWords.length !== 1) throw new Error(INVALID_COMMAND);
                    this.controller.sendPassAction();
                    break;
                case 'réserve':
                    if (inputWords.length !== 1) throw new Error(INVALID_COMMAND);
                    this.controller.sendReserveAction();
                    break;
                case 'indice':
                    if (inputWords.length !== 1) throw new Error(INVALID_COMMAND);
                    this.controller.sendHintAction();
                    break;
                case 'aide':
                    if (inputWords.length !== 1) throw new Error(INVALID_COMMAND);
                    this.controller.sendHelpAction();
                    break;
                default:
            }
        } else {
            this.controller.sendMessage(input);
        }
    }

    private createPlaceActionPayloadSingleLetter(location: string, lettersToPlace: string) {
        // try catch invalid command
        const placeActionPayload: ActionPlacePayload = {
            tiles: this.parsePlaceLettersToTiles(lettersToPlace),
            startPosition: this.getStartPosition(location),
            orientation: Orientation.Horizontal,
        };

        return placeActionPayload;
    }

    private createPlaceActionPayloadMultipleLetters(location: string, lettersToPlace: string) {
        // try catch invalid command
        const placeActionPayload: ActionPlacePayload = {
            tiles: this.parsePlaceLettersToTiles(lettersToPlace),
            startPosition: this.getStartPosition(location.substring(0, location.length - 1)),
            orientation: this.getOrientation(location.charAt(location.length - 1)),
        };

        return placeActionPayload;
    }

    private createExchangeActionPayload(lettersToExchange: string) {
        const exchangeActionPayload: ActionExchangePayload = {
            tiles: this.parseExchangeLettersToTiles(lettersToExchange),
        };

        return exchangeActionPayload;
    }

    private parsePlaceLettersToTiles(lettersToPlace: string): Tile[] {
        const player: IPlayer = this.gameService.getLocalPlayer();
        const playerTiles: Tile[] = [];
        player.tiles.forEach((tile) => {
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

        if (tilesToPlace.length !== lettersToPlace.length) throw new Error(INVALID_COMMAND);

        return tilesToPlace;
    }

    private parseExchangeLettersToTiles(lettersToExchange: string): Tile[] {
        // user must type exchange letters in lower case
        if (lettersToExchange !== lettersToExchange.toLowerCase()) throw new Error(INVALID_COMMAND);

        const player: IPlayer = this.gameService.getLocalPlayer();
        const playerTiles: Tile[] = [];
        player.tiles.forEach((tile) => {
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

        if (tilesToExchange.length !== lettersToExchange.length) throw new Error(INVALID_COMMAND);

        return tilesToExchange;
    }

    private getStartPosition(location: string): Position {
        if (location.length > MAX_LOCATION_COMMAND_LENGTH || location.length < MIN_LOCATION_COMMAND_LENGTH) throw new Error(INVALID_COMMAND);

        const inputRow: number = location[0].charCodeAt(0) - ASCII_VALUE_OF_LOWERCASE_A;
        if (inputRow < MIN_ROW_NUMBER || inputRow > MAX_ROW_NUMBER) throw new Error(INVALID_COMMAND);

        const inputCol: number = +location.substring(1) - 1;
        if (inputCol < MIN_COL_NUMBER || inputCol > MAX_COL_NUMBER) throw new Error(INVALID_COMMAND);

        const inputStartPosition: Position = {
            row: inputRow,
            column: inputCol,
        };
        return inputStartPosition;
    }

    private getOrientation(orientationString: string): Orientation {
        if (orientationString.length !== 1) throw new Error(INVALID_COMMAND);

        if (orientationString === 'h') return Orientation.Horizontal;
        else if (orientationString === 'v') return Orientation.Vertical;
        else throw new Error(INVALID_COMMAND);
    }
}
