import { defineTransformer } from "@nuxt/content";
import { parseMarkdown } from "@nuxtjs/mdc/runtime";
import { fromHast } from "minimark/hast";

export function transformReferenceMarkdown(markdown: string) {
    return transformFootNotes(markdown).replace(
        /(\S?)\^(\d+)(\s)/g,
        (_match, previous, id, trailingSpace) =>
            `${previous}${previous ? " " : ""}:reference{#${id}}${trailingSpace}`,
    );
}

function transformFootNotes(markdown: string) {
    const lines = markdown.split("\n");
    let inFootNotes = false;

    return lines
        .map((line) => {
            if (/^##\s+Foot Notes\s*$/.test(line)) {
                inFootNotes = true;
                return line;
            }

            if (inFootNotes && /^##\s+/.test(line)) {
                inFootNotes = false;
            }

            if (!inFootNotes) {
                return line;
            }

            return line.replace(
                /^(\s*)(\d+)\.\s+(?!:ref-fn)(.+?)\s*$/,
                (_match, indent, id, text) => {
                    return `${indent}${id}. :ref-fn[${text.trim()}]{#${id}}`;
                },
            );
        })
        .join("\n");
}

export default defineTransformer({
    name: "markdown",
    extensions: [".md"],
    async parse(file, options = {}) {
        const parsed = await parseMarkdown(
            transformReferenceMarkdown(file.body),
            options,
            {
                fileOptions: file,
            },
        );

        if (options.compress) {
            return {
                ...parsed.data,
                excerpt: parsed.excerpt ? fromHast(parsed.excerpt) : undefined,
                body: {
                    ...fromHast(parsed.body),
                    toc: parsed.toc,
                },
                id: file.id,
                title: parsed.data?.title || undefined,
            };
        }

        return {
            ...parsed.data,
            excerpt: parsed.excerpt,
            body: {
                ...parsed.body,
                toc: parsed.toc,
            },
            id: file.id,
            title: parsed.data?.title || undefined,
        };
    },
});
