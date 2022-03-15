import { SingleHighScore } from '@app/classes/admin/high-score';
import { GameType } from '@app/classes/game-type';
import { IconName } from '@app/components/icon/icon.component.type';

export const LOCAL_PLAYER_ICON: IconName[] = ['user-astronaut', 'user-cowboy', 'user-ninja', 'user-crown'];

export const BACKSPACE = 'Backspace';
export const ESCAPE = 'Escape';
export const ENTER = 'Enter';
export const KEYDOWN = 'keydown';
export const DEFAULT_HIGH_SCORE: SingleHighScore = { name: 'player1', gameType: GameType.Classic, score: 0 };

export const NOT_FOUND = -1;
