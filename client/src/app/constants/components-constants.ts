import { DisplayGameHistoryColumns, DisplayGameHistoryKeys } from '@app/classes/admin-game-history';
import { SingleHighScore } from '@app/classes/admin/high-score';
import { GameType } from '@app/classes/game-type';
import { IconName } from '@app/components/icon/icon.component.type';

export const LOCAL_PLAYER_ICON: IconName[] = ['user-astronaut', 'user-cowboy', 'user-ninja', 'user-crown'];

export const BACKSPACE = 'Backspace';
export const ESCAPE = 'Escape';
export const ARROW_LEFT = 'ArrowLeft';
export const ARROW_RIGHT = 'ArrowRight';
export const ENTER = 'Enter';
export const KEYDOWN = 'keydown';
export const DEFAULT_HIGH_SCORE: SingleHighScore = { name: 'player1', gameType: GameType.Classic, score: 0 };

export const NOT_FOUND = -1;

export const COLUMNS: DisplayGameHistoryColumns = {
    startDate: 'Date de début',
    startTime: 'Heure de début',
    endDate: 'Date de fin',
    endTime: 'Heure de fin',
    isOver: 'Partie terminée',
    hasBeenAbandoned: 'Partie abandonnée',
    gameType: 'Type de jeu',
    gameMode: 'Mode de jeu',
    player1Data: 'Joueur 1',
    player1Name: 'Nom joueur 1',
    player1Score: 'Points joueur 1',
    player2Data: 'Joueur 2',
    player2Name: 'Nom joueur 2',
    player2Score: 'Points joueur 2',
    playerWinData: 'Joueur gagnant',
    playerWinName: 'Nom joueur gagnant',
    playerWinScore: 'Points joueur gagant',
    replacingPlayer: 'Joueur de remplacement',
};

export const DEFAULT_COLUMNS: DisplayGameHistoryKeys[] = [
    'startDate',
    'startTime',
    'isOver',
    'gameType',
    'gameMode',
    'player1Name',
    'player1Score',
    'player2Name',
    'player2Score',
];
