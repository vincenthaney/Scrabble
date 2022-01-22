export abstract class IStorableModel {
    toJSON(): string {
        return JSON.stringify(this);
    }
}
