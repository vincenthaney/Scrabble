import { Injectable } from '@angular/core';
import { SECONDS_TO_MILLISECONDS } from '@app/constants/game';

@Injectable({
    providedIn: 'root',
})
export class CookieService {
    setCookie(username: string, value: string, expiry: number) {
        const date = new Date();
        date.setTime(date.getTime() + expiry * SECONDS_TO_MILLISECONDS);
        const expires = 'expires=' + date.toUTCString();
        document.cookie = username + '=' + value + ';' + expires + ';path=/';
    }

    getCookie(name: string): string {
        const nameEQ = name + '=';
        const ca = document.cookie.split(';');
        for (let c of ca) {
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return '';
    }

    eraseCookie(name: string) {
        document.cookie = name + '=; Max-Age=-99999999;';
    }
}
