import { GameObjectivesData } from '@app/classes/communication/game-objectives-data';
import { ObjectiveData } from '@app/classes/communication/objective-data';
import Game from '@app/classes/game/game';
import { AbstractObjective } from '@app/classes/objectives/abstract-objective';
import { GameObjectives } from '@app/classes/objectives/game-objectives';
import { ObjectiveState } from '@app/classes/objectives/objective-state';
import { ObjectiveUpdate } from '@app/classes/objectives/objective-update';
import { ValidationParameters } from '@app/classes/objectives/validation-parameters';
import Player from '@app/classes/player/player';
import {
    NUMBER_OF_OBJECTIVES_PER_PLAYER,
    NUMBER_OF_PUBLIC_OBJECTIVES,
    OBJECTIVE_COMPLETE_MESSAGE,
} from '@app/constants/services-constants/objective.const';
import { INVALID_PLAYER_ID_FOR_GAME, OPPONENT_HAS_NOT_OBJECTIVE } from '@app/constants/services-errors';
import { Random } from '@app/utils/random';
import { Service } from 'typedi';

@Service()
export default class ObjectivesService {
    createObjectivesForGame(): GameObjectives {
        const objectivesPool: Set<AbstractObjective> = this.createObjectivesPool();
        const publicObjectives: Set<AbstractObjective> = new Set(this.popRandomObjectiveFromPool(objectivesPool, NUMBER_OF_PUBLIC_OBJECTIVES));
        const player1Objective: AbstractObjective = this.popRandomObjectiveFromPool(objectivesPool, NUMBER_OF_OBJECTIVES_PER_PLAYER)[0];
        const player2Objective: AbstractObjective = this.popRandomObjectiveFromPool(objectivesPool, NUMBER_OF_OBJECTIVES_PER_PLAYER)[0];
        publicObjectives.forEach((objective: AbstractObjective) => {
            objective.isPublic = true;
        });
        return { publicObjectives, player1Objective, player2Objective };
    }

    validatePlayerObjectives(player: Player, game: Game, validationParameters: ValidationParameters): ObjectiveUpdate {
        const objectiveUpdate: ObjectiveUpdate = {
            updateData: {},
            completionMessages: [],
        };
        player.getObjectives().forEach((objective: AbstractObjective) => {
            if (objective.isCompleted()) return;

            objective.updateObjective(validationParameters);

            if (objective.isCompleted()) {
                objectiveUpdate.completionMessages.push(this.handleObjectiveComplete(objective, player, game));
            }
        });
        objectiveUpdate.updateData = this.addPlayerObjectivesToUpdateData(game, player, objectiveUpdate.updateData);
        objectiveUpdate.updateData = this.addPlayerObjectivesToUpdateData(game, this.findOpponent(game, player), objectiveUpdate.updateData);
        return objectiveUpdate;
    }

    resetPlayerObjectiveProgression(game: Game, player: Player): GameObjectivesData {
        player.resetObjectivesProgression();
        return this.addPlayerObjectivesToUpdateData(game, player, {});
    }

    private handleObjectiveComplete(objective: AbstractObjective, player: Player, game: Game): string {
        if (objective.isPublic) {
            const opponentPlayer = this.findOpponent(game, player);
            this.setOpponentPublicObjectiveComplete(opponentPlayer, objective);
        }
        return OBJECTIVE_COMPLETE_MESSAGE(objective.name, objective.bonusPoints);
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

    private createObjectivesPool(): Set<AbstractObjective> {
        return new Set();
    }

    private popRandomObjectiveFromPool(pool: Set<AbstractObjective>, numberOfObjectives: number = 1): AbstractObjective[] {
        const objectives: AbstractObjective[] = Random.getRandomElementsFromArray([...pool.values()], numberOfObjectives);
        objectives.forEach((o: AbstractObjective) => pool.delete(o));
        return objectives;
    }
}
