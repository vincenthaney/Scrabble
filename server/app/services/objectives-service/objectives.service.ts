import { GameObjectivesData } from '@app/classes/communication/game-objectives-data';
import { ObjectiveData } from '@app/classes/communication/objective-data';
import Game from '@app/classes/game/game';
import { AbstractObjective } from '@app/classes/objectives/abstract-objective';
import { GameObjectives } from '@app/classes/objectives/game-objectives';
import { ObjectiveState } from '@app/classes/objectives/objective-state';
import { ValidationParameters } from '@app/classes/objectives/validation-parameters';
import Player from '@app/classes/player/player';
import { INVALID_PLAYER_ID_FOR_GAME, OPPONENT_HAS_NOT_OBJECTIVE } from '@app/constants/services-errors';
import { Service } from 'typedi';

// Laisser les commentaires pour pouvoir se repérer lors de l'utilisation des objectifs
@Service()
export default class ObjectivesService {
    // Actually créer les objectifs
    async createObjectivesForGame(): Promise<GameObjectives> {
        const publicObjectives: Set<AbstractObjective> = new Set();
        const player1Objective: AbstractObjective = undefined as unknown as AbstractObjective;
        const player2Objective: AbstractObjective = undefined as unknown as AbstractObjective;
        return { publicObjectives, player1Objective, player2Objective };
    }

    // Voir comment envoyer du feedback lors de la complétion

    validatePlayerObjectives(player: Player, game: Game, validationParameters: ValidationParameters): GameObjectivesData {
        let updateData: GameObjectivesData = {};
        player.getObjectives().forEach((objective: AbstractObjective) => {
            if (objective.isCompleted()) return;

            const isCompleted: boolean = objective.updateProgress(validationParameters);

            if (isCompleted) {
                this.handleObjectiveComplete(objective, player, game);
            }
        });
        updateData = this.addPlayerObjectivesToUpdateData(game, player, updateData);
        updateData = this.addPlayerObjectivesToUpdateData(game, this.findOpponent(game, player), updateData);
        return updateData;
    }

    private handleObjectiveComplete(objective: AbstractObjective, player: Player, game: Game): void {
        // Envoyer le message de complétion

        objective.state = ObjectiveState.Completed;
        if (objective.isPublic) {
            const opponentPlayer = this.findOpponent(game, player);
            this.setOpponentPublicObjectiveComplete(opponentPlayer, objective);
        }
    }

    private setOpponentPublicObjectiveComplete(opponentPlayer: Player, objective: AbstractObjective): void {
        const opponentObjective: AbstractObjective | undefined = opponentPlayer
            .getObjectives()
            .find((o: AbstractObjective) => o.isPublic && o.name === objective.name);
        if (!opponentObjective) throw new Error(OPPONENT_HAS_NOT_OBJECTIVE);
        opponentObjective.state = ObjectiveState.CompletedByOpponent;
    }

    private findOpponent(game: Game, player: Player): Player {
        const opponentPlayer: Player | undefined = [game.player1, game.player2].find((p: Player) => p.id !== player.id);
        if (!opponentPlayer) throw new Error(INVALID_PLAYER_ID_FOR_GAME);
        return opponentPlayer;
    }

    private addPlayerObjectivesToUpdateData(game: Game, player: Player, updateData: GameObjectivesData): GameObjectivesData {
        const playerObjectivesData: ObjectiveData[] = player.getObjectives().map((o: AbstractObjective) => o.convertToData());
        return game.isPlayer1(player)
            ? { ...updateData, player1Objectives: playerObjectivesData }
            : { ...updateData, player2Objectives: playerObjectivesData };
    }
}
