import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile, readdir, stat } from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";
import { deflateRawSync } from "node:zlib";
import { createJiti } from "jiti";
import { parse } from "devalue";
import { transform } from "esbuild";
import { parse as parseVue, compileScript } from "@vue/compiler-sfc";

const jiti = createJiti(import.meta.url);
const { createContentPayloadIndex } = await jiti.import(
    resolve("app/utils/build/content-payload-index.ts"),
);
const { resolveContentPayload } = await jiti.import(
    resolve("app/utils/static-content.ts"),
);
const wrappers = Object.fromEntries(
    [
        "ShallowReactive",
        "Reactive",
        "ShallowRef",
        "Ref",
        "EmptyShallowRef",
        "EmptyRef",
    ].map((name) => [name, (v) => v]),
);
const archive = process.argv[2] || "assets/artifacts (3).zip";
const isDirectory = (await stat(archive)).isDirectory();
const payloads = isDirectory
    ? await Promise.all(
          (await readdir(archive, { recursive: true, withFileTypes: true }))
              .filter(
                  (entry) => entry.isFile() && entry.name === "_payload.json",
              )
              .map(async (entry) => {
                  const file = join(entry.parentPath, entry.name);
                  return {
                      route:
                          "/" +
                          relative(archive, dirname(file)).split(sep).join("/"),
                      contents: await readFile(file, "utf8"),
                  };
              }),
      )
    : JSON.parse(
          execFileSync(
              "python",
              [
                  "-c",
                  `import zipfile,json,sys
z=zipfile.ZipFile(sys.argv[1])
print(json.dumps([{'route':'/'+n.removeprefix('public/').removesuffix('/_payload.json').removesuffix('_payload.json'),'contents':z.read(n).decode('utf-8')} for n in z.namelist() if n.endswith('_payload.json')]))`,
                  archive,
              ],
              { encoding: "utf8", maxBuffer: 30 * 1024 * 1024 },
          ),
      );
const index = createContentPayloadIndex(payloads);
if (isDirectory) {
    assert.deepEqual(
        JSON.parse(
            await readFile(join(archive, "content/payload-index.json"), "utf8"),
        ),
        index,
    );
    const files = await readdir(archive, { recursive: true });
    assert.ok(
        !files.some((file) =>
            /(?:^|[\\/])sqlite[^\\/]*\.(?:js|wasm)$|sql_dump\.txt$/i.test(file),
        ),
        "Database assets remain",
    );
}
const decoded = new Map(
    payloads.map((p) => [p.route, parse(p.contents, wrappers)]),
);
let checked = 0;
for (const payload of decoded.values()) {
    for (const [key, value] of Object.entries(payload.data ?? {})) {
        if (!/^(?:content-|category-references-|interview-script-)/.test(key))
            continue;
        assert.deepEqual(
            await resolveContentPayload(key, index, async (route) =>
                decoded.get(route),
            ),
            value,
            key,
        );
        checked++;
    }
}
await assert.rejects(
    resolveContentPayload("missing", index, async () => null),
    /No prerendered/,
);
await assert.rejects(
    resolveContentPayload("missing", { missing: "/broken" }, async () => ({
        data: {},
    })),
    /Missing/,
);
assert.equal(
    await resolveContentPayload(
        "null-page",
        { "null-page": "/null" },
        async () => ({ data: { "null-page": null } }),
    ),
    null,
);

// Compile just the changed consumers, without starting Nuxt or a project build.
for (const filename of [
    "app/composables/useContentData.ts",
    "app/composables/useCategoryReferences.ts",
    "app/components/ContentComponents/human-practices/InterviewScript.vue",
    "app/components/content/ProseEm.vue",
]) {
    let source = await readFile(filename, "utf8");
    if (filename.endsWith(".vue"))
        source = compileScript(parseVue(source).descriptor, {
            id: "static-content-check",
        }).content;
    const compile = async (client) =>
        (
            await transform(source, {
                loader: "ts",
                format: "esm",
                minifySyntax: true,
                define: {
                    "import.meta.client": String(client),
                    "import.meta.server": String(!client),
                    "import.meta.dev": "false",
                    "import.meta.env.WIKI_STATIC_CONTENT": "true",
                },
            })
        ).code;
    assert.ok(
        !(await compile(true)).includes("queryCollection("),
        `Client query remains in ${filename}`,
    );
    if (!filename.endsWith("ProseEm.vue"))
        assert.ok(
            (await compile(false)).includes("queryCollection("),
            `Server query missing in ${filename}`,
        );
}
console.log(
    JSON.stringify({
        payloads: payloads.length,
        uniqueKeys: Object.keys(index).length,
        checkedValues: checked,
        indexRaw: Buffer.byteLength(JSON.stringify(index)),
        indexDeflate: deflateRawSync(JSON.stringify(index)).length,
        clientQueries: 0,
    }),
);
