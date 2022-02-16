import { Injectable } from '@angular/core';
import { SECONDS_TO_MILLISECONDS } from '@app/constants/game';
import { EXPIRED_COOKIE_AGE } from '@app/constants/services-errors';

@Injectable({
    providedIn: 'root',
})
export class CookieService {
    setCookie(username: string, value: string, expiry: number) {
        const date = new Date();
        date.setTime(date.getTime() + expiry * SECONDS_TO_MILLISECONDS);
        const expires = 'expires=' + date.toUTCString();
        document.cookie = username + '=' + value + '; ' + expires + ';path=/ ;SameSite=strict';
    }

    getCookie(name: string): string {
        const nameEQ = name + '=';
        const keyValPairs = document.cookie.split(';');
        for (let keyPair of keyValPairs) {
            keyPair = keyPair.trim();
            if (keyPair.includes(nameEQ)) return keyPair.substring(nameEQ.length);
        }
        return '';
    }

    eraseCookie(name: string) {
        document.cookie = `${name}=; Max-Age=${EXPIRED_COOKIE_AGE}; SameSite=strict`;
    }
}
