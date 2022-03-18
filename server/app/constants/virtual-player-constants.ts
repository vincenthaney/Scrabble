import { PointRange } from '@app/classes/word-finding';

export const VIRTUAL_PLAYER_ID_PREFIX = 'virtual-player-';
export const GAME_SHOULD_CONTAIN_ROUND = 'Game object should contain round to enable virtual player to play.';
export const PRELIMINARY_WAIT_TIMEOUT = 3000;
export const FINAL_WAIT_TIMEOUT = 20000;
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

export const IS_ID_VIRTUAL_PLAYER = (id: string): boolean => {
    return id.includes(VIRTUAL_PLAYER_ID_PREFIX);
};
