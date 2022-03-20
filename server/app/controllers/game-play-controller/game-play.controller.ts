import { ActionData, ActionType } from '@app/classes/communication/action-data';
import { GameUpdateData } from '@app/classes/communication/game-update-data';
import { Message } from '@app/classes/communication/message';
import { GameRequest } from '@app/classes/communication/request';
import { HttpException } from '@app/classes/http-exception/http.exception';
import { INVALID_WORD_TIMEOUT, IS_OPPONENT, SYSTEM_ERROR_ID, SYSTEM_ID } from '@app/constants/game';
import { COMMAND_IS_INVALID, OPPONENT_PLAYED_INVALID_WORD } from '@app/constants/services-errors';
import { ActiveGameService } from '@app/services/active-game-service/active-game.service';
import { GamePlayService } from '@app/services/game-play-service/game-play.service';
import { SocketService } from '@app/services/socket-service/socket.service';
import { Delay } from '@app/utils/delay';
import { Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';
import { CONTENT_REQUIRED, SENDER_REQUIRED } from './game-play-controller-errors';

@Service()
export class GamePlayController {
    router: Router;

    constructor(
        private readonly gamePlayService: GamePlayService,
        private readonly socketService: SocketService,
        private readonly activeGameService: ActiveGameService,
    ) {
        this.configureRouter();
    }

    gameUpdate(gameId: string, data: GameUpdateData): void {
        this.socketService.emitToRoom(gameId, 'gameUpdate', data);
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.post('/games/:gameId/players/:playerId/action', async (req: GameRequest, res: Response) => {
            const { gameId, playerId } = req.params;
            const data: ActionData = req.body;

            try {
                await this.handlePlayAction(gameId, playerId, data);
                res.status(StatusCodes.NO_CONTENT).send();
            } catch (exception) {
                HttpException.sendError(exception, res);
            }
        });

        this.router.post('/games/:gameId/players/:playerId/message', (req: GameRequest, res: Response) => {
            const gameId = req.params.gameId;
            const message: Message = req.body;

            try {
                this.handleNewMessage(gameId, message);
                res.status(StatusCodes.NO_CONTENT).send();
            } catch (exception) {
                HttpException.sendError(exception, res);
            }
        });

        this.router.post('/games/:gameId/players/:playerId/error', (req: GameRequest, res: Response) => {
            const { playerId, gameId } = req.params;
            const message: Message = req.body;

            try {
                this.handleNewError(playerId, gameId, message);
                res.status(StatusCodes.NO_CONTENT).send();
            } catch (exception) {
                HttpException.sendError(exception, res);
            }
        });
    }

    private async handlePlayAction(gameId: string, playerId: string, data: ActionData): Promise<void> {
        if (data.type === undefined) throw new HttpException('type is required', StatusCodes.BAD_REQUEST);
        if (data.payload === undefined) throw new HttpException('payload is required', StatusCodes.BAD_REQUEST);

        try {
            const [updateData, feedback] = await this.gamePlayService.playAction(gameId, playerId, data);
            if (data.input.length > 0) {
                this.socketService.emitToSocket(playerId, 'newMessage', {
                    content: data.input,
                    senderId: playerId,
                    gameId,
                });
            }
            if (updateData) {
                this.gameUpdate(gameId, updateData);
            }
            if (feedback) {
                if (feedback.localPlayerFeedback) {
                    this.socketService.emitToSocket(playerId, 'newMessage', {
                        content: feedback.localPlayerFeedback,
                        senderId: SYSTEM_ID,
                        gameId,
                    });
                }
                if (feedback.opponentFeedback) {
                    const opponentId = this.activeGameService.getGame(gameId, playerId).getPlayer(playerId, IS_OPPONENT).id;
                    this.socketService.emitToSocket(opponentId, 'newMessage', {
                        content: feedback.opponentFeedback,
                        senderId: SYSTEM_ID,
                        gameId,
                    });
                }
                if (feedback.endGameFeedback) {
                    for (const message of feedback.endGameFeedback) {
                        this.socketService.emitToRoom(gameId, 'newMessage', {
                            content: message,
                            senderId: SYSTEM_ID,
                            gameId,
                        });
                    }
                }
            }
        } catch (exception) {
            await this.handleError(exception, data.input, playerId, gameId);

            if (this.isWordNotInDictionaryError(exception)) {
                await this.handlePlayAction(gameId, playerId, { type: ActionType.PASS, payload: {}, input: '' });
            }
        }
    }

    private handleNewMessage(gameId: string, message: Message): void {
        if (message.senderId === undefined) throw new HttpException(SENDER_REQUIRED, StatusCodes.BAD_REQUEST);
        if (message.content === undefined) throw new HttpException(CONTENT_REQUIRED, StatusCodes.BAD_REQUEST);

        this.socketService.emitToRoom(gameId, 'newMessage', message);
    }

    private handleNewError(playerId: string, gameId: string, message: Message): void {
        if (message.senderId === undefined) throw new HttpException(SENDER_REQUIRED, StatusCodes.BAD_REQUEST);
        if (message.content === undefined) throw new HttpException(CONTENT_REQUIRED, StatusCodes.BAD_REQUEST);

        this.socketService.emitToSocket(playerId, 'newMessage', {
            content: message.content,
            senderId: SYSTEM_ERROR_ID,
            gameId,
        });
    }

    private async handleError(exception: Error, input: string, playerId: string, gameId: string): Promise<void> {
        if (this.isWordNotInDictionaryError(exception)) {
            await Delay.for(INVALID_WORD_TIMEOUT);

            const opponentId = this.activeGameService.getGame(gameId, playerId).getPlayer(playerId, IS_OPPONENT).id;
            this.socketService.emitToSocket(opponentId, 'newMessage', {
                content: OPPONENT_PLAYED_INVALID_WORD,
                senderId: SYSTEM_ID,
                gameId,
            });
        }

        this.socketService.emitToSocket(playerId, 'newMessage', {
            content: COMMAND_IS_INVALID(input) + exception.message,
            senderId: SYSTEM_ERROR_ID,
            gameId,
        });
    }

    private isWordNotInDictionaryError(exception: Error): boolean {
        return exception.message.includes(" n'est pas dans le dictionnaire choisi.");
    }
}
