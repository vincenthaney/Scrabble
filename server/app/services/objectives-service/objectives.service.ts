import { GameObjectivesData, ObjectiveData } from '@app/classes/communication/objective-data';
import Game from '@app/classes/game/game';
import { AbstractObjective } from '@app/classes/objectives/abstract-objective';
import { GameObjectives, ObjectiveState, ObjectiveUpdate } from '@app/classes/objectives/objective';
import { ObjectiveValidationParameters } from '@app/classes/objectives/validation-parameters';
import Player from '@app/classes/player/player';
import { LIST_OF_ALL_OBJECTIVES, NUMBER_OF_OBJECTIVES_IN_GAME, OBJECTIVE_COMPLETE_MESSAGE } from '@app/constants/services-constants/objective.const';
import { INVALID_PLAYER_ID_FOR_GAME, NO_OBJECTIVE_LEFT_IN_POOL, OPPONENT_HAS_NOT_OBJECTIVE } from '@app/constants/services-errors';
import { Random } from '@app/utils/random';
import { Service } from 'typedi';

@Service()
export default class ObjectivesService {
    createObjectivesForGame(): GameObjectives {
        const objectivesPool: AbstractObjective[] = this.createObjectivesPool();
        const publicObjectives: Set<AbstractObjective> = new Set([
            this.popObjectiveFromPool(objectivesPool),
            this.popObjectiveFromPool(objectivesPool),
        ]);
        publicObjectives.forEach((objective: AbstractObjective) => {
            objective.isPublic = true;
        });

        const player1Objective: AbstractObjective = this.popObjectiveFromPool(objectivesPool);
        const player2Objective: AbstractObjective = this.popObjectiveFromPool(objectivesPool);

        return { publicObjectives, player1Objective, player2Objective };
    }

    validatePlayerObjectives(player: Player, game: Game, validationParameters: ObjectiveValidationParameters): ObjectiveUpdate | undefined {
        let noObjectivesWereUpdated = true;
        const objectiveUpdate: ObjectiveUpdate = {
            updateData: {},
            completionMessages: [],
        };
        player.getObjectives().forEach((objective: AbstractObjective) => {
            const hasBeenUpdated: boolean = objective.updateObjective(validationParameters);
            if (!hasBeenUpdated) return;

            noObjectivesWereUpdated = false;
            if (objective.isCompleted()) {
                objectiveUpdate.completionMessages.push(this.handleObjectiveCompletion(objective, player, game));
            }
        });
        if (noObjectivesWereUpdated) return undefined;

        objectiveUpdate.updateData = this.addPlayerObjectivesToUpdateData(game, player, objectiveUpdate.updateData);
        objectiveUpdate.updateData = this.addPlayerObjectivesToUpdateData(game, this.findOpponent(game, player), objectiveUpdate.updateData);

        return objectiveUpdate;
    }

    resetPlayerObjectiveProgression(game: Game, player: Player): GameObjectivesData {
        player.resetObjectivesProgression();
        return this.addPlayerObjectivesToUpdateData(game, player, {});
    }

    private handleObjectiveCompletion(objective: AbstractObjective, player: Player, game: Game): string {
        if (objective.isPublic) {
            const opponentPlayer = this.findOpponent(game, player);
            this.completeOpponentObjective(opponentPlayer, objective);
        }
        return OBJECTIVE_COMPLETE_MESSAGE(objective.name, objective.bonusPoints);
    }

    private completeOpponentObjective(opponentPlayer: Player, playerObjective: AbstractObjective): void {
        const opponentObjective: AbstractObjective | undefined = opponentPlayer
            .getObjectives()
            .find((objective: AbstractObjective) => objective.isPublic && objective.name === playerObjective.name);
        if (!opponentObjective) throw new Error(OPPONENT_HAS_NOT_OBJECTIVE);
        opponentObjective.state = ObjectiveState.CompletedByOpponent;
    }

    private findOpponent(game: Game, originalPlayer: Player): Player {
        const opponentPlayer: Player | undefined = [game.player1, game.player2].find((player: Player) => player.id !== originalPlayer.id);
        if (!opponentPlayer) throw new Error(INVALID_PLAYER_ID_FOR_GAME);
        return opponentPlayer;
    }

    private addPlayerObjectivesToUpdateData(game: Game, player: Player, updateData: GameObjectivesData): GameObjectivesData {
        const playerObjectivesData: ObjectiveData[] = player.getObjectives().map((objective: AbstractObjective) => objective.convertToData());
        return game.isPlayer1(player)
            ? { ...updateData, player1Objectives: playerObjectivesData }
            : { ...updateData, player2Objectives: playerObjectivesData };
    }

    private createObjectivesPool(): AbstractObjective[] {
        return Random.getRandomElementsFromArray(LIST_OF_ALL_OBJECTIVES, NUMBER_OF_OBJECTIVES_IN_GAME);
    }

    private popObjectiveFromPool(objectivePool: AbstractObjective[]): AbstractObjective {
        const objective: AbstractObjective | undefined = objectivePool.pop();
        if (!objective) throw new Error(NO_OBJECTIVE_LEFT_IN_POOL);
        return objective;
    }
}
