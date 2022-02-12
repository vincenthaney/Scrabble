/* eslint-disable @typescript-eslint/naming-convention */
import { Position } from '@app/classes/board';

export const NO_MULTIPLIER_MAPPED_TO_INPUT = (data: string): string => {
    return `There is no multiplier mapped for the board configuration ${data}`;
};

export const BOARD_CONFIG_UNDEFINED_AT = (position: Position): string => {
    return `The board multiplier configuration is undefined at row: ${position.row}, column: ${position.column}`;
};

export const PLAYER_ALREADY_TRYING_TO_JOIN = 'A player is already trying to join the game';
export const NO_OPPONENT_IN_WAITING_GAME = 'No opponent is waiting for the game';
export const OPPONENT_NAME_DOES_NOT_MATCH = 'Opponent name does not match. Cannot accept game';
export const CANNOT_HAVE_SAME_NAME = 'Cannot join a game with a player with the same name';
export const INVALID_COMMAND = 'The command is not one of the recognised commands. type !help for a list of possible commands';
export const INVALID_PAYLOAD = 'Invalid payload for command type';
export const NOT_PLAYER_TURN = 'It is not the turn of requesting player';
export const SOCKET_SERVICE_NOT_INITIALIZED = 'SocketService not initialized';
export const INVALID_ID_FOR_SOCKET = 'Invalid ID for socket';
