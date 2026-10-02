import { readdir, readFile, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const icons = new Map();
const catalogResponse = await fetch("https://api.iconify.design/collections");
if (!catalogResponse.ok) {
    throw new Error(`Icon catalog: HTTP ${catalogResponse.status}`);
}
const catalog = await catalogResponse.json();

// Collect literal names, including icons selected by conditional expressions.
for (const directory of ["app/", "content/"]) {
    const base = new URL(directory, root);
    for (const path of await readdir(base, { recursive: true })) {
        if (!/\.(vue|ts|md|ya?ml)$/.test(path)) continue;
        const source = await readFile(
            new URL(path.replaceAll("\\", "/"), base),
            "utf8",
        );
        for (const [, prefix, name] of source.matchAll(
            /["'`]([a-z][a-z0-9-]*):([a-z0-9]+(?:-[a-z0-9]+)*)["'`]/g,
        )) {
            // Ignore CSS variants and other strings that are not icon prefixes.
            if (!Object.hasOwn(catalog, prefix)) continue;
            if (!icons.has(prefix)) icons.set(prefix, new Set());
            icons.get(prefix).add(name);
        }
    }
}

const collections = [];
for (const [prefix, names] of [...icons].sort(([a], [b]) =>
    a.localeCompare(b),
)) {
    const requested = [...names].sort();
    const url = new URL(`https://api.iconify.design/${prefix}.json`);
    url.searchParams.set("icons", requested.join(","));
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${prefix}: HTTP ${response.status}`);
    const collection = await response.json();
    const missing = requested.filter(
        (name) => !collection.icons?.[name] && !collection.aliases?.[name],
    );
    if (collection.prefix !== prefix || missing.length) {
        throw new Error(`${prefix}: missing icons ${missing.join(", ")}`);
    }
    collections.push(collection);
}

// Fetch only during maintenance; the website imports this committed local file.
await writeFile(
    new URL("app/data/icons.json", root),
    `${JSON.stringify(collections, null, 4)}\n`,
);
console.log(
    `Saved ${[...icons.values()].reduce((sum, names) => sum + names.size, 0)} icons from ${collections.length} collections.`,
);
