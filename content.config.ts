import { defineContentConfig, defineCollection } from "@nuxt/content";
import { z } from "zod";

export default defineContentConfig({
    collections: {
        content: defineCollection({
            type: "page",
            source: "**/*.md",
            schema: z.object({
                order: z.number().default(999),
            }),
        }),
        glossary: defineCollection({
            type: "data",
            source: "glossary/*.json",
            schema: z.object({
                term: z.string(),
                detail: z.string(),
                link: z.string().optional(),
            }),
        }),
    },
});
