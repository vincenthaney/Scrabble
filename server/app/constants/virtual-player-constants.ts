import { PointRange } from '@app/classes/word-finding';

export const VIRTUAL_PLAYER_ID_PREFIX = 'virtual-player-';

export const PASS_ACTION_THRESHOLD = 0.1;
export const EXCHANGE_ACTION_THRESHOLD = 0.2;
export const LOW_SCORE_THRESHOLD = 0.4;
export const MEDIUM_SCORE_THRESHOLD = 0.7;
export const LOW_SCORE_RANGE: PointRange = {
    minimum: 0,
    maximum: 6,
};
export const MEDIUM_SCORE_RANGE: PointRange = {
    minimum: 7,
    maximum: 12,
};
export const HIGH_SCORE_RANGE: PointRange = {
    minimum: 13,
    maximum: 18,
};
