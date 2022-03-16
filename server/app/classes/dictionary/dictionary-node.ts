export default class DictionaryNode {
    private value: string | undefined;
    private nodes: Map<string, DictionaryNode>;

    constructor(value?: string) {
        this.nodes = new Map();
        this.value = value;
    }

    addWord(word: string, value = ''): void {
        const [key, rest] = this.separateWord(word);

        if (rest.length > 0) {
            this.getOrCreateNode(key, undefined).addWord(rest, value + key);
        } else {
            this.getOrCreateNode(key, value + key);
        }
    }

    wordExists(word: string): boolean {
        return this.getNode(word)?.value !== undefined;
    }

    getValue(): string | undefined {
        return this.value;
    }

    getNode(word: string): DictionaryNode | undefined {
        const [key, rest] = this.separateWord(word);
        const node = this.nodes.get(key);

        if (!node) return undefined;
        if (rest.length === 0) return node;
        return node.getNode(rest);
    }

    private getOrCreateNode(key: string, value?: string): DictionaryNode {
        let node = this.nodes.get(key);
        if (!node) {
            node = new DictionaryNode(value);
            this.nodes.set(key, node);
        }
        return node;
    }

    private separateWord(entry: string): [key: string, rest: string] {
        return [entry[0], entry.slice(1)];
    }
}
