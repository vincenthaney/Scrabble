import { ObjectiveState } from '@app/classes/objectives/objective-state';

export interface ObjectiveData {
    name: string;
    state: ObjectiveState;
    progress: number;
    maxProgress: number;
}
