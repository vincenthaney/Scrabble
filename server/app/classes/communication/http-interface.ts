import { RequestInfo, RequestInit } from 'node-fetch';

const fetchRequest = async (url: RequestInfo, init?: RequestInit) => import('node-fetch').then(async ({ default: fetch }) => fetch(url, init));

export const SERVER_URL = 'http://localhost:3000/api';
export class HttpRequest {
    static async get(endpoint: string): Promise<unknown> {
        const response = await fetchRequest(`server/${endpoint}`);
        return await response.json();
    }

    static async post(endpoint: string, data: unknown): Promise<unknown> {
        // eslint-disable-next-line no-console
        console.log(endpoint);
        // eslint-disable-next-line no-console
        console.log(data);
        const response = await fetchRequest(`${SERVER_URL}/${endpoint}`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'content-type': 'application/json',
            },
        });

        return await response.json();
    }

    static async delete(endpoint: string): Promise<number> {
        const response = await fetchRequest(`${SERVER_URL}/${endpoint}`, {
            method: 'DELETE',
            headers: {
                'content-type': 'application/json',
            },
        });
        return await response.status;
    }

    static async patch(endpoint: string): Promise<number> {
        const response = await fetchRequest(`${SERVER_URL}/${endpoint}`, {
            method: 'PATCH',
        });
        return response.status;
    }
}
