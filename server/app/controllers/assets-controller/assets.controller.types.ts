import { Request } from 'express';

export type AssetsRequest = Request & {
    params: {
        fileName: string;
    };
};
