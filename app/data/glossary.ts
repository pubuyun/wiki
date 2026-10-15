import { createGlossaryIndex, type GlossaryTerm } from "~/utils/glossary";

const modules = import.meta.glob<GlossaryTerm>("~~/content/glossary/*.json", {
    eager: true,
    import: "default",
});

export const glossaryIndex = createGlossaryIndex(
    Object.entries(modules)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([, term]) => term),
);
