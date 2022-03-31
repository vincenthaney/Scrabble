import { GameObjectivesData } from '@app/classes/communication/game-objectives-data';
import { AbstractObjective } from '@app/classes/objectives/abstract-objective';
import { ValidationParameters } from '@app/classes/objectives/validation-parameters';
import { Tile } from '@app/classes/tile';
import ObjectivesService from '@app/services/objectives-service/objectives.service';
import { Container } from 'typedi';

export default class Player {
    name: string;
    score: number;
    tiles: Tile[];
    id: string;
    isConnected: boolean;
    private objectives: Set<AbstractObjective>;
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
        this.getObjectives().forEach((objective: AbstractObjective) => {
            objective.progress = 0;
        });
    }

    initializeObjectives(objectives: Set<AbstractObjective>): void {
        this.objectives = objectives;
    }

    updateObjectives(validationParameters: ValidationParameters): [GameObjectivesData, string[]] {
        return this.objectiveService.validatePlayerObjectives(this, validationParameters.game, validationParameters);
    }
}
