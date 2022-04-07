import { AbstractObjective } from '@app/classes/objectives/abstract-objective';
import { ObjectiveUpdate } from '@app/classes/objectives/objective';
import { ObjectiveValidationParameters } from '@app/classes/objectives/validation-parameters';
import { Tile } from '@app/classes/tile';
import ObjectivesService from '@app/services/objectives-service/objectives.service';
import { Container } from 'typedi';

export default class Player {
    name: string;
    score: number;
    tiles: Tile[];
    id: string;
    isConnected: boolean;
    private objectives: AbstractObjective[];
    private readonly objectiveService: ObjectivesService;

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
        this.score = 0;
        this.tiles = [];
        this.isConnected = true;
        this.objectiveService = Container.get(ObjectivesService);
    }

    getTileRackPoints(): number {
        return this.tiles.reduce((prev, next) => prev + next.value, 0);
    }

    hasTilesLeft(): boolean {
        return this.tiles.length > 0;
    }

    endGameMessage(): string {
        return `${this.name} : ${this.tilesToString()}`;
    }

    tilesToString(): string {
        return this.tiles.reduce((prev, next) => prev + next.letter.toLocaleLowerCase(), '');
    }

    getObjectives(): AbstractObjective[] {
        return [...this.objectives.values()];
    }

    resetObjectivesProgression(): void {
        this.getObjectives()
            .filter((objective: AbstractObjective) => !objective.isCompleted() && objective.shouldResetOnInvalidWord)
            .forEach((objective: AbstractObjective) => {
                objective.progress = 0;
            });
    }

    initializeObjectives(publicObjectives: Set<AbstractObjective>, privateObjective: AbstractObjective): void {
        const publicObjectiveClones: AbstractObjective[] = [...publicObjectives.values()].map((objective: AbstractObjective) => objective.clone());
        this.objectives = [...publicObjectiveClones, privateObjective];
    }

    validateObjectives(validationParameters: ObjectiveValidationParameters): ObjectiveUpdate | undefined {
        return this.objectiveService.validatePlayerObjectives(this, validationParameters.game, validationParameters);
    }
}
