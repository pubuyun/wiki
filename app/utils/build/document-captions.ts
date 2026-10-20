import { parseMarkdown } from "@nuxtjs/mdc/runtime";
import type { MDCElement, MDCRoot } from "@nuxtjs/mdc";
import { fromHast } from "minimark/hast";
import type { MinimarkTree } from "minimark";

const captionComponents = new Set([
    "lightboximage",
    "lightboxpanels",
    "bilingualimagepanels",
    "captionedtable",
    "videopanels",
]);

/** Compile caption strings while parsing content, never in the browser. */
export async function compileDocumentCaptions(tree: MDCRoot) {
    const cache = new Map<string, Promise<MinimarkTree>>();

    function compile(text: string) {
        if (!cache.has(text)) {
            cache.set(
                text,
                parseMarkdown(text, {
                    highlight: false,
                    toc: false,
                    contentHeading: false,
                }).then(({ body }) => fromHast(body)),
            );
        }
        return cache.get(text)!;
    }

    async function visit(node: MDCRoot | MDCElement) {
        if (node.type === "element") {
            const tag = node.tag
                .replaceAll("-", "")
                .toLowerCase()
                .replace(/^contentcomponents/, "");
            const key = tag === "img" ? "title" : "caption";
            if (tag === "img" || captionComponents.has(tag)) {
                const props = (node.props ??= {});
                let caption = props[key];
                if (
                    caption === undefined &&
                    typeof props[`:${key}`] === "string"
                ) {
                    try {
                        caption = JSON.parse(props[`:${key}`]);
                    } catch {
                        // Expressions are not static content and remain plain text.
                    }
                }
                if (typeof caption === "string" || Array.isArray(caption)) {
                    const body = Array.isArray(caption)
                        ? await Promise.all(
                              caption.map((text) =>
                                  typeof text === "string"
                                      ? compile(text)
                                      : null,
                              ),
                          )
                        : await compile(caption);
                    props[":captionBody"] = JSON.stringify(body);
                }
            }
        }
        await Promise.all(
            node.children
                .filter(
                    (child): child is MDCElement => child.type === "element",
                )
                .map(visit),
        );
    }

    await visit(tree);
}
