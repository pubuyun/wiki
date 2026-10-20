import { defineTransformer } from "@nuxt/content";
import type { MDCRoot } from "@nuxtjs/mdc";
import type { MinimarkTree } from "minimark";
import { fromHast, toHast } from "minimark/hast";
import { compileDocumentCaptions } from "./document-captions";

type ContentTree = MDCRoot | MinimarkTree;

async function compile(tree: ContentTree): Promise<ContentTree> {
    if (tree.type === "minimark") {
        const body = toHast(tree) as MDCRoot;
        await compileDocumentCaptions(body);
        return { ...tree, ...fromHast(body) };
    }
    await compileDocumentCaptions(tree);
    return tree;
}

export default defineTransformer({
    name: "document-captions",
    extensions: [".md"],
    async transform(content) {
        if (content.body) {
            content.body = await compile(content.body as ContentTree);
        }
        if (content.excerpt) {
            content.excerpt = await compile(content.excerpt as ContentTree);
        }
        return content;
    },
});
