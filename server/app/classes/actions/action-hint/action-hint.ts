import ActionInfo from '@app/classes/actions/action-info';
import { GameUpdateData } from '@app/classes/communication/game-update-data';
import Game from '@app/classes/game/game';
import Player from '@app/classes/player/player';
import { WordPlacement } from '@app/classes/word-finding';
import { FOUND_WORDS, HINT_ACTION_NUMBER_OF_WORDS, NO_WORDS_FOUND } from '@app/constants/classes-constants';
import WordFindingService from '@app/services/word-finding/word-finding';
import { WordPlacementUtils } from '@app/utils/word-placement';
import { Container } from 'typedi';

export default class ActionHint extends ActionInfo {
    private wordFindingService: WordFindingService;
    private hintResult: WordPlacement[];

    constructor(player: Player, game: Game) {
        super(player, game);
        this.wordFindingService = Container.get(WordFindingService);
        this.hintResult = [];
    }

    execute(): GameUpdateData | void {
        this.hintResult = this.wordFindingService.findWords(this.game.board, this.player.tiles, {
            numberOfWordsToFind: HINT_ACTION_NUMBER_OF_WORDS,
        });
    }

    getMessage(): string | undefined {
        if (this.hintResult.length === 0) {
            return NO_WORDS_FOUND;
        } else {
            let message = `${FOUND_WORDS} :<br>`;
            if (this.hintResult.length < HINT_ACTION_NUMBER_OF_WORDS) message += `*Seulement ${this.hintResult.length} mot(s) ont été trouvé(s)*<br>`;
            message += this.hintResult.map((placement) => `\`${WordPlacementUtils.wordPlacementToCommandString(placement)}\``).join('<br>');
            return message;
        }
    }

    getOpponentMessage(): string | undefined {
        return undefined;
    }
}
