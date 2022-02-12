/* eslint-disable @typescript-eslint/naming-convention */
import { Position } from '@app/classes/board';

export const boardErrors = {
    NO_MULTIPLIER_MAPPED_TO_INPUT: (data: string): string => {
        return `There is no multiplier mapped for the board configuration ${data}`;
    },
    BOARD_CONFIG_UNDEFINED_AT: (position: Position): string => {
        return `The board multiplier configuration is undefined at row: ${position.row}, column: ${position.column}`;
    },
};

export const gameDispatcherErrors = {
    PLAYER_ALREADY_TRYING_TO_JOIN: 'A player is already trying to join the game',
    NO_OPPONENT_IN_WAITING_GAME: 'No opponent is waiting for the game',
    OPPONENT_NAME_DOES_NOT_MATCH: 'Opponent name does not match. Cannot accept game',
    CANNOT_HAVE_SAME_NAME: 'Cannot join a game with a player with the same name',
};

export const gamePlayErrors = {
    INVALID_COMMAND: 'The command is not one of the recognised commands. type !help for a list of possible commands',
    INVALID_PAYLOAD: 'Invalid payload for command type',
    NOT_PLAYER_TURN: 'It is not the turn of requesting player',
};

export const socketErrors = {
    SOCKET_SERVICE_NOT_INITIALIZED: 'SocketService not initialized',
    INVALID_ID_FOR_SOCKET: 'Invalid ID for socket',
};
