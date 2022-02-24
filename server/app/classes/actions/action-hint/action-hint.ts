import ActionInfo from '@app/classes/actions/action-info';
import { GameUpdateData } from '@app/classes/communication/game-update-data';
import Game from '@app/classes/game/game';
import Player from '@app/classes/player/player';
import { WordPlacement } from '@app/classes/word-finding';
import { HINT_ACTION_NUMBER_OF_WORDS } from '@app/constants/classes-constants';
import WordFindingService from '@app/services/word-finding/word-finding';
import { WordPlacementUtils } from '@app/utils/word-placement';
import { Container } from 'typedi';

export default class ActionHint extends ActionInfo {
    private wordFindingService: WordFindingService;
    private wordsPlacement: WordPlacement[];

    constructor(player: Player, game: Game) {
        super(player, game);
        this.wordFindingService = Container.get(WordFindingService);
    }

    execute(): GameUpdateData | void {
        this.wordsPlacement = this.wordFindingService.findWords(this.game.board, this.player.tiles, {
            numberOfWordsToFind: HINT_ACTION_NUMBER_OF_WORDS,
        });
    }

    getMessage(): string | undefined {
        let message = '**Mots trouvés** :<br>';

        message += this.wordsPlacement.map((placement) => `\`${WordPlacementUtils.wordPlacementToCommandString(placement)}\``).join('<br>');

        return message;
    }

    getOpponentMessage(): string | undefined {
        return undefined;
    }
}
