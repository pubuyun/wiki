import { defineTransformer } from "@nuxt/content";
import { parseMarkdown } from "@nuxtjs/mdc/runtime";
import { slug } from "github-slugger";
import { fromHast } from "minimark/hast";

export function transformReferenceMarkdown(markdown: string) {
    let headingReferenceIndex = 0;

    return transformFootNotes(markdown)
        .replace(
            /(\S?)\^\[([^\]\r\n]+)\](?=$|[\s.,!?;:，。！？；：])/gm,
            (match, previous: string, text: string) => {
                const label = text.trim();
                const headingId = createHeadingId(label);
                if (!headingId) return match;

                headingReferenceIndex += 1;
                return `${previous}${previous ? " " : ""}:reference{#heading-ref-${headingReferenceIndex} destination=${JSON.stringify(`#${headingId}`)} label=${JSON.stringify(label)}}`;
            },
        )
        .replace(
            /(\S?)\^(\d+)(\s)/g,
            (_match, previous, id, trailingSpace) =>
                `${previous}${previous ? " " : ""}:fn-ref{#${id}}${trailingSpace}`,
        );
}

function createHeadingId(text: string) {
    return slug(text)
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .replace(/^(\d)/, "_$1");
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
            {
                ...options,
                remark: {
                    plugins: options.remarkPlugins,
                },
                rehype: {
                    plugins: options.rehypePlugins,
                },
            },
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
