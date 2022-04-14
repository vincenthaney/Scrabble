import { BasicDictionaryData, DictionarySummary, DictionaryUpdateInfo } from '@app/classes/communication/dictionary-data';
import { HttpException } from '@app/classes/http-exception/http-exception';
import { NOT_FOUND } from '@app/constants/game';
import { existsSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import { StatusCodes } from 'http-status-codes';
import { join } from 'path';
import { Service } from 'typedi';
import { v4 as uuidv4 } from 'uuid';

export const DICTIONARY_DIRECTORY = '../../../assets/dictionaries';
export const DICTIONARY_INDEX_FILENAME = 'index.json';
export const DEFAULT_DICTIONARY_FILENAME = 'dictionary.json';

export const NO_DICTIONARY_WITH_NAME = (filename: string) => `Le dictionnaire "${filename}" n'existe pas.`;
export const NO_DICTIONARY_WITH_ID = (id: string) => `Le dictionnaire avec le id "${id}" n'existe pas.`;
export const DEFAULT_DICTIONARY_NOT_FOUND = 'Le fichier dictionnaire par default est introuvable.';
export const CANNOT_UPDATE_DEFAULT_DICTIONARY = 'Impossible de modifier le dictionnaire par défaut';

export interface DictionaryEntry extends DictionarySummary {
    filename: string;
}

export interface DictionaryIndexes {
    entries: DictionaryEntry[];
}

@Service()
export default class DictionarySavingService {
    private dictionaryIndexes: DictionaryIndexes;

    constructor() {
        this.dictionaryIndexes = this.readDictionaryIndexes();
    }

    getDictionarySummaries(): DictionarySummary[] {
        return this.dictionaryIndexes.entries.map(this.entryToDictionarySummary);
    }

    getDictionaryById(id: string): BasicDictionaryData {
        const [entry] = this.getEntryFromId(id);

        return this.getDictionaryByFilename(entry.filename);
    }

    addDictionary(dictionary: BasicDictionaryData): DictionarySummary {
        const id = uuidv4();
        const filename = `${dictionary.title}-${id}.json`;

        const entry: DictionaryEntry = {
            title: dictionary.title,
            description: dictionary.description,
            id,
            filename,
            isDefault: false,
        };

        this.writeFile(filename, dictionary);

        this.dictionaryIndexes.entries.push(entry);

        this.updateDictionaryIndex();

        return this.entryToDictionarySummary(entry);
    }

    updateDictionary(info: DictionaryUpdateInfo): DictionarySummary {
        const [entry, entryIndex] = this.getEntryFromId(info.id, false);

        const dictionary = this.getDictionaryByFilename(entry.filename);
        this.patchDictionary(entry, dictionary, info);

        this.writeFile(entry.filename, dictionary);

        this.dictionaryIndexes.entries.splice(entryIndex, 1, entry);
        this.updateDictionaryIndex();

        return this.entryToDictionarySummary(entry);
    }

    deleteDictionaryById(id: string): void {
        const [entry, entryIndex] = this.getEntryFromId(id, false);

        this.dictionaryIndexes.entries.splice(entryIndex, 1);
        this.updateDictionaryIndex();

        this.deleteFile(entry.filename);
    }

    restore(): void {
        const files = this.readDir();

        files.forEach((file) => {
            if (file === DEFAULT_DICTIONARY_FILENAME) return;
            this.deleteFile(file);
        });

        this.dictionaryIndexes = this.getDefaultDictionaryIndexFile();

        this.writeFile(DICTIONARY_INDEX_FILENAME, this.dictionaryIndexes);
    }

    private getDictionaryByFilename(filename: string): BasicDictionaryData {
        if (!this.existsFile(filename)) throw new HttpException(NO_DICTIONARY_WITH_NAME(filename), StatusCodes.NOT_FOUND);

        return this.readFile(filename);
    }

    private getEntryFromId(id: string, allowDefault = true): [entry: DictionaryEntry, index: number] {
        const entryIndex = this.dictionaryIndexes.entries.findIndex((index) => index.id === id);

        if (entryIndex === NOT_FOUND) throw new HttpException(NO_DICTIONARY_WITH_ID(id), StatusCodes.NOT_FOUND);

        const entry = this.dictionaryIndexes.entries[entryIndex];

        if (entry.isDefault && !allowDefault) throw new HttpException(CANNOT_UPDATE_DEFAULT_DICTIONARY, StatusCodes.BAD_REQUEST);

        return [entry, entryIndex];
    }

    private patchDictionary(entry: DictionaryEntry, dictionary: BasicDictionaryData, updateInfo: DictionaryUpdateInfo): void {
        if (updateInfo.title) {
            entry.title = updateInfo.title;
            dictionary.title = updateInfo.title;
        }
        if (updateInfo.description) {
            entry.description = updateInfo.description;
            dictionary.description = updateInfo.description;
        }
    }

    private readDictionaryIndexes(): DictionaryIndexes {
        if (!this.existsFile(DICTIONARY_INDEX_FILENAME)) {
            this.restore();
        }

        return this.readFile(DICTIONARY_INDEX_FILENAME);
    }

    private updateDictionaryIndex(): void {
        this.writeFile(DICTIONARY_INDEX_FILENAME, this.dictionaryIndexes);
    }

    private getDefaultDictionaryIndexFile(): DictionaryIndexes {
        try {
            const dictionary = this.getDictionaryByFilename(DEFAULT_DICTIONARY_FILENAME);
            return {
                entries: [
                    {
                        title: dictionary.title,
                        description: dictionary.description,
                        id: uuidv4(),
                        isDefault: true,
                        filename: DEFAULT_DICTIONARY_FILENAME,
                    },
                ],
            };
        } catch (e) {
            throw new HttpException(DEFAULT_DICTIONARY_NOT_FOUND, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    private entryToDictionarySummary(entry: DictionaryEntry): DictionarySummary {
        return {
            title: entry.title,
            description: entry.description,
            id: entry.id,
            isDefault: entry.isDefault,
        };
    }

    private readFile<T>(filename: string): T {
        return JSON.parse(readFileSync(this.getAbsolutePath(filename), 'utf-8'));
    }

    private readDir(): string[] {
        return readdirSync(this.getAbsolutePath('/'));
    }

    private writeFile<T>(filename: string, content: T): void {
        writeFileSync(this.getAbsolutePath(filename), JSON.stringify(content));
    }

    private deleteFile(filename: string): void {
        unlinkSync(this.getAbsolutePath(filename));
    }

    private existsFile(filename: string): boolean {
        return existsSync(this.getAbsolutePath(filename));
    }

    private getAbsolutePath(filename: string): string {
        return join(__dirname, DICTIONARY_DIRECTORY, filename);
    }
}
