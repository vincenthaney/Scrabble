export default abstract class IPlayer {
    name: string;
    score: number;

    constructor(name: string) {
        this.name = name;
        this.score = 0;
    }
}
