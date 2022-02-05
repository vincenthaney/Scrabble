import { Request } from 'express';

export interface GameRequestParams {
    gameId: string;
    playerId: string;
}

export type GameRequest = Request & { params: GameRequestParams };

export type CreateGameRequest = Request & { params: { playerId: string } };