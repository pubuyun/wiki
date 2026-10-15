export interface GlossaryTerm {
    term: string | string[];
    detail: string;
    link?: string;
}

export function normalizeGlossaryTerm(term: string) {
    return term
        .replace(/<\/?sub>/gi, "")
        .trim()
        .toLocaleLowerCase();
}

export function createGlossaryIndex(terms: readonly GlossaryTerm[]) {
    const index = new Map<string, GlossaryTerm>();

    for (const term of terms) {
        const aliases = Array.isArray(term.term) ? term.term : [term.term];
        for (const alias of aliases) {
            const key = normalizeGlossaryTerm(alias);
            // Match the existing first-match behavior for duplicate aliases.
            if (key && !index.has(key)) index.set(key, term);
        }
    }

    return index;
}
