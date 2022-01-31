export const delay = async (time: number) =>
    new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve();
        }, time);
    });
