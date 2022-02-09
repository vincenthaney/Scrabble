import Action from './action';

export default abstract class ActionInfo extends Action {
    willEndTurn(): boolean {
        return false;
    }
}
