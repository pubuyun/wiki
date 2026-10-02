import { defineContentConfig, defineCollection } from "@nuxt/content";
import { z } from "zod";

export default defineContentConfig({
    collections: {
        content: defineCollection({
            type: "page",
            source: "**/*.md",
            schema: z.object({
                order: z.number().default(999),
                hasReference: z.boolean().default(false),
                referenceIds: z.array(z.string()).default([]),
                citationIds: z.array(z.string()).default([]),
            }),
        }),
        glossary: defineCollection({
            type: "data",
            source: "glossary/*.json",
            schema: z.object({
                term: z.union([z.string(), z.array(z.string()).nonempty()]),
                detail: z.string(),
                link: z.string().optional(),
            }),
        }),
    },
});
