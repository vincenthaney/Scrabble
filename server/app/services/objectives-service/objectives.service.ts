import { AbstractObjective } from '@app/classes/objectives/abstract-objective';
import { GameObjectives } from '@app/classes/objectives/game-objectives';
import { ValidationParameters } from '@app/classes/objectives/validation-parameters';
import { Service } from 'typedi';

// Laisser les commentaires pour pouvoir se repérer lors de l'utilisation des objectifs
@Service()
export default class ObjectivesService {
    // Actually créer les objectifs
    async createObjectivesForGame(): Promise<GameObjectives> {
        const publicObjectives: Set<AbstractObjective> = new Set();
        const player1Objective: AbstractObjective = undefined as unknown as AbstractObjective;
        const player2Objective: AbstractObjective = undefined as unknown as AbstractObjective;

        return new GameObjectives(publicObjectives, player1Objective, player2Objective);
    }

    // Le service valide les objectifs
    // Voir comment envoyer du feedback lors de la complétion

    validateGameObjectives(gameObjectives: GameObjectives, validationParameters: ValidationParameters): void {
        gameObjectives.getAllObjectives().forEach((objective: AbstractObjective) => {
            objective.isValid(validationParameters);
        });
        return;
    }
}
