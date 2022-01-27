import { Service } from 'typedi';

@Service()
export class GameDispatcherService {
    async createNewGame(): Promise<string> {
        return `New game at ${new Date()}`;
    }
}
