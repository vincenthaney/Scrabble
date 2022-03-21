import { ActionData, ActionType } from '@app/classes/communication/action-data';
import { GameUpdateData } from '@app/classes/communication/game-update-data';
import { LobbyData } from '@app/classes/communication/lobby-data';
import { Message } from '@app/classes/communication/message';
import { GameRequest } from '@app/classes/communication/request';
import { HttpException } from '@app/classes/http-exception/http-exception';
import { INVALID_WORD_TIMEOUT, IS_OPPONENT, SYSTEM_ERROR_ID, SYSTEM_ID } from '@app/constants/game';
import { COMMAND_IS_INVALID, OPPONENT_PLAYED_INVALID_WORD } from '@app/constants/services-errors';
import { ActiveGameService } from '@app/services/active-game-service/active-game.service';
import { FeedbackMessages } from '@app/services/game-play-service/feedback-messages';
import { GamePlayService } from '@app/services/game-play-service/game-play.service';
import { SocketService } from '@app/services/socket-service/socket.service';
import { VirtualPlayerService } from '@app/services/virtual-player-service/virtual-player.service';
import { Delay } from '@app/utils/delay';
import { isIdVirtualPlayer } from '@app/utils/is-id-virtual-player';
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
        private virtualPlayerService: VirtualPlayerService,
    ) {
        this.configureRouter();
    }

    gameUpdate(lobbyData: LobbyData, data: GameUpdateData): void {
        this.socketService.emitToRoom(lobbyData, 'gameUpdate', data);
        if (data.round && isIdVirtualPlayer(data.round.playerData.id)) {
            this.virtualPlayerService.triggerVirtualPlayerTurn(data, this.activeGameService.getGame(lobbyData.lobbyId, data.round.playerData.id));
        }
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.post('/games/:gameId/players/:playerId/action', async (req: GameRequest, res: Response) => {
            const { lobbyData, playerId } = req.params;
            const data: ActionData = req.body;

            try {
                await this.handlePlayAction(lobbyData, playerId, data);
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

    private async handlePlayAction(lobbyData: LobbyData, playerId: string, data: ActionData): Promise<void> {
        if (data.type === undefined) throw new HttpException('type is required', StatusCodes.BAD_REQUEST);
        if (data.payload === undefined) throw new HttpException('payload is required', StatusCodes.BAD_REQUEST);

        try {
            const [updateData, feedback] = await this.gamePlayService.playAction(lobbyData.lobbyId, playerId, data);
            if (data.input.length > 0) {
                this.socketService.emitToSocket(playerId, 'newMessage', {
                    content: data.input,
                    senderId: playerId,
                    gameId,
                });
            }
            if (updateData) {
                this.gameUpdate(lobbyData.gameId, updateData);
            }
            if (feedback) {
                this.handleFeedback(gameId, playerId, feedback);
            }
        } catch (exception) {
            await this.handleError(exception, data.input, playerId, gameId);

            if (this.isWordNotInDictionaryError(exception)) {
                await this.handlePlayAction(gameId, playerId, { type: ActionType.PASS, payload: {}, input: '' });
            }
        }
    }

    private handleFeedback(gameId: string, playerId: string, feedback: FeedbackMessages): void {
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
