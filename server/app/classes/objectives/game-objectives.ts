import { AbstractObjective } from './abstract-objective';

export interface GameObjectives {
    readonly publicObjectives: Set<AbstractObjective>;
    readonly player1Objective: AbstractObjective;
    readonly player2Objective: AbstractObjective;
}
