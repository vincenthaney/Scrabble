import { AbstractObjective } from './abstract-objective';

export class GameObjectives {
    constructor(
        readonly publicObjectives: Set<AbstractObjective>,
        readonly player1Objective: AbstractObjective,
        readonly player2Objective: AbstractObjective,
    ) {}

    getAllObjectives(): Set<AbstractObjective> {
        const allObjectives: Set<AbstractObjective> = new Set(this.publicObjectives);
        [this.player1Objective, this.player2Objective].forEach((objective: AbstractObjective) => allObjectives.add(objective));
        return allObjectives;
    }
}
