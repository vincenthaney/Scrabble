import { ActiveGameService } from '@app/services/active-game-service/active-game.service';
import { Service } from 'typedi';

@Service()
export class GamePlayService {
    constructor(private readonly activeGameService: ActiveGameService) {}
}
