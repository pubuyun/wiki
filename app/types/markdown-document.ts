import type { Toc } from "@nuxtjs/mdc";
import type { MinimarkTree } from "minimark";

export interface MarkdownDocument {
    id: string;
    title: string;
    body: MinimarkTree & { toc?: Toc };
}
