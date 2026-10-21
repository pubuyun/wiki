import { addTemplate, defineNuxtModule, updateTemplates } from "@nuxt/kit";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { contentGraphLayouts } from "../app/utils/content-graph-layout";

export default defineNuxtModule({
    meta: { name: "wiki-content-graph" },
    setup(_options, nuxt) {
        const registryPath = resolve(
            nuxt.options.rootDir,
            "content/model/graphs.json",
        );
        const template = addTemplate({
            filename: "content-graph-layouts.ts",
            write: true,
            getContents() {
                const registry = JSON.parse(readFileSync(registryPath, "utf8"));
                // Shared by SSR and client chunks, never serialized per page.
                return `export default ${JSON.stringify(contentGraphLayouts(registry.graphs))} as Record<string, { maxHeight: number; aspectRatio: number }>;\n`;
            },
        });

        nuxt.options.watch.push(registryPath);
        nuxt.hook("builder:watch", async (_event, path) => {
            if (
                path.replace(/\\/g, "/").endsWith("content/model/graphs.json")
            ) {
                await updateTemplates({
                    filter: (entry) => entry.dst === template.dst,
                });
            }
        });
    },
});
