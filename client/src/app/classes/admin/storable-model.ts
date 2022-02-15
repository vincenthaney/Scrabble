export default abstract class StorableModel {
    toJSON(): string {
        return JSON.stringify(this);
    }
}
