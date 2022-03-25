import { AbstractObjective } from './abstract-objective';

export class GameObjectives {
    constructor(
        private readonly publicObjectives: Set<AbstractObjective>,
        private readonly player1Objective: AbstractObjective,
        private readonly player2Objective: AbstractObjective,
    ) {}

    getPublicObjectives(): Set<AbstractObjective> {
        return this.publicObjectives;
    }

    getPlayer1Objectives(): AbstractObjective {
        return this.player1Objective;
    }

    getPlayer2Objectives(): AbstractObjective {
        return this.player2Objective;
    }
}
