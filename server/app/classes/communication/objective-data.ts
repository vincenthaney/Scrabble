import { ObjectiveState } from '@app/classes/objectives/objective-state';

export interface ObjectiveData {
    state: ObjectiveState;
    progress: number;
    maxProgress: number;
}
