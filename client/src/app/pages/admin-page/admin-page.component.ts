import { Component } from '@angular/core';

@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent {
    dictionaries = this.getDictionaries();

    constructor(private dictionaryService: DictionaryService) {}

    getDictionaries(): DictionarySummary[] {
        return this.dictionaryService.getDictionaries();
    }

    getDictionariesNames(): string[] {
        const dictionariesNames: string[];
        for (const dictionary of this.dictionaries) {
            dictionariesNames.push(dictionary.name);
        }
        return dictionariesNames;
    }
}
