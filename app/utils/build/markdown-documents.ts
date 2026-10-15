import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { parseMarkdown } from "@nuxtjs/mdc/runtime";
import { fromHast } from "minimark/hast";
import type { Plugin } from "vite";
import type { MarkdownDocument } from "../../types/markdown-document";

export async function compileMarkdownDocument(
    markdown: string,
    filename: string,
): Promise<MarkdownDocument> {
    const parsed = await parseMarkdown(markdown, { highlight: false });
    const id = basename(filename, ".md");

    return {
        id,
        title:
            parsed.data?.title ||
            id
                .split("-")
                .filter(Boolean)
                .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                .join(" "),
        body: {
            ...fromHast(parsed.body),
            toc: parsed.toc,
        },
    };
}

/** Convert fixed Markdown imports to data; the parser stays in the tooling process. */
export function markdownDocumentsPlugin(): Plugin {
    return {
        name: "wiki-markdown-documents",
        enforce: "pre",
        async load(id) {
            const [filename, query = ""] = id.split("?");
            if (
                !filename.endsWith(".md") ||
                !new URLSearchParams(query).has("compiled-markdown")
            ) {
                return null;
            }

            this.addWatchFile(filename);
            const document = await compileMarkdownDocument(
                await readFile(filename, "utf8"),
                filename,
            );
            return `export default ${JSON.stringify(document)};`;
        },
    };
}
