export const convertTime = (time: number): string => {
    const SECONDS_IN_MINUTE = 60;
    const minutes = Math.floor(time / SECONDS_IN_MINUTE);
    const seconds = Math.floor(time % SECONDS_IN_MINUTE);
    const minuteDisplay = minutes > 0 ? minutes + (minutes === 1 ? ' minute' : ' minutes') : '';
    const textBetween = minutes > 0 && seconds > 0 ? ' et ' : '';
    const secondsDisplay = seconds > 0 ? seconds + (seconds === 1 ? ' seconde' : ' secondes') : '';
    return minuteDisplay + textBetween + secondsDisplay;
};
