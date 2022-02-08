import { Timer } from './timer';

export const convertTime = (time: number): Timer => {
    const SECONDS_IN_MINUTE = 60;
    const minutes = Math.floor(time / SECONDS_IN_MINUTE);
    const seconds = Math.floor(time % SECONDS_IN_MINUTE);
    return { minutes, seconds };
};
