import { addVitePlugin, defineNuxtModule } from "@nuxt/kit";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join, relative, sep } from "node:path";
import {
    compactContentPayloads,
    createContentPayloadIndex,
} from "../app/utils/build/content-payload-index";

export default defineNuxtModule({
    meta: { name: "wiki-static-content" },
    setup(_options, nuxt) {
        if (nuxt.options.dev) return;

        nuxt.hook("nitro:config", (config) => {
            config.prerender ||= {};
            config.prerender.ignore ||= [];
            config.prerender.ignore.push("/__nuxt_content/");
        });

        addVitePlugin(
            {
                name: "assert-no-content-client-database",
                generateBundle(_options, bundle) {
                    for (const output of Object.values(bundle)) {
                        if (output.type !== "chunk") continue;
                        const database = Object.keys(output.modules).find(
                            (id) =>
                                /(?:@sqlite\.org[/\\]sqlite-wasm|@nuxt[/\\]content[/\\]dist[/\\]runtime[/\\]internal[/\\]database\.client)/.test(
                                    id,
                                ),
                        );
                        if (database)
                            this.error(
                                `Production content still imports browser SQLite: ${database}`,
                            );
                    }
                    for (const [filename, output] of Object.entries(bundle)) {
                        if (
                            output.type !== "asset" ||
                            !/(?:^|\/)sqlite[^/]*\.(?:wasm|js)$/i.test(filename)
                        )
                            continue;
                        const referenced = Object.values(bundle).some(
                            (entry) =>
                                entry.type === "chunk" &&
                                entry.code.includes(
                                    filename.split("/").at(-1)!,
                                ),
                        );
                        if (referenced)
                            this.error(
                                `Production still references SQLite asset: ${filename}`,
                            );
                        // Vite emits imported assets before tree shaking. Remove only
                        // SQLite assets proven to have no remaining client consumer.
                        delete bundle[filename];
                    }
                },
            },
            { client: true, server: false },
        );

        nuxt.hook("nitro:init", (nitro) => {
            nitro.hooks.hook("prerender:done", async () => {
                const root = nitro.options.output.publicDir;
                const entries = await readdir(root, {
                    recursive: true,
                    withFileTypes: true,
                });
                const databaseAsset = entries.find(
                    (entry) =>
                        entry.isFile() &&
                        (entry.name === "sql_dump.txt" ||
                            /^sqlite.*\.(?:wasm|js)$/i.test(entry.name)),
                );
                if (databaseAsset) {
                    throw new Error(
                        `Static output still contains a content database: ${databaseAsset.name}`,
                    );
                }
                const files = entries.filter(
                    (entry) => entry.isFile() && entry.name === "_payload.json",
                );
                const payloads = await Promise.all(
                    files.map(async (entry) => {
                        const file = join(entry.parentPath, entry.name);
                        const route =
                            "/" +
                            relative(root, dirname(file)).split(sep).join("/");
                        return {
                            route,
                            file,
                            contents: await readFile(file, "utf8"),
                        };
                    }),
                );
                const compacted = compactContentPayloads(payloads);
                await Promise.all(
                    compacted.map((payload) =>
                        writeFile(payload.file!, payload.contents),
                    ),
                );
                const index = createContentPayloadIndex(compacted);
                if (!Object.keys(index).length)
                    throw new Error("No content payloads were prerendered");
                const target = join(root, "content/payload-index.json");
                await mkdir(dirname(target), { recursive: true });
                await writeFile(target, JSON.stringify(index));
            });
        });
    },
});
