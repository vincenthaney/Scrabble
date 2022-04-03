import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class DictionariesService {
    async updateDictionary(id: string, name: string, description: string): Promise<void> {
        // envoyer requête au serveur pour modifier les informations du dictionaire spécifié
        return;
    }
    async downloadDictionary(id: string): Promise<void> {
        // const data2 = this.getDictionary(id);
        const data = { test: 'test' };
        // Initialize Blob
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        const name = 'testDictionary.json';
        // Make the download process
        const a = window.document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
    }
    async deleteDictionary(id: string): Promise<void> {
        // envoyer requete au service du serveur pour supprimer le dictionaire spécifié
        return;
    }

    // private async getDictionary(id: string): Promise<void> {
    //     // envoyer ewuqtes au server pour obtenir une copie du dictionaire spécifié
    //     return;
    // }
}
