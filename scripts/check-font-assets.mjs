import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createJiti } from "jiti";

// Check the CSS transformation without starting Vite or building Nuxt.
const jiti = createJiti(import.meta.url);
const { externalizeKatexFonts, katexFontsPlugin } = await jiti.import(
    resolve("app/utils/build/katex-fonts.ts"),
);
const { fontAssetUrl } = await jiti.import(resolve("app/utils/font-assets.ts"));
const source = await readFile("node_modules/katex/dist/katex.min.css", "utf8");
const transformed = externalizeKatexFonts(source);
const fontNames = [...source.matchAll(/fonts\/([^\s)"']+\.woff2)/g)].map(
    (match) => match[1],
);
const urls = [
    ...transformed.matchAll(
        /url\(["']?(https:\/\/static\.igem\.wiki\/teams\/6133\/wiki\/fonts\/[^"')]+\.woff2)["']?\)/g,
    ),
].map((match) => match[1]);

assert.deepEqual(urls, fontNames.map(fontAssetUrl));
assert.equal(
    (transformed.match(/@font-face/g) ?? []).length,
    (source.match(/@font-face/g) ?? []).length,
    "Font faces were lost",
);
assert.ok(!/\.(?:ttf|woff)["')]/.test(transformed), "Legacy fonts remain");
assert.ok(
    !/url\(["']?(?:\.?\/)?fonts\/[^"')]+\.woff2/.test(transformed),
    "Local font URL remains",
);
assert.equal(externalizeKatexFonts(transformed), transformed);
assert.equal(
    fontAssetUrl("KaTeX_Main-BoldItalic.woff2"),
    "https://static.igem.wiki/teams/6133/wiki/fonts/katex-main-bolditalic.woff2",
);

const plugin = katexFontsPlugin();
for (const id of [
    "C:\\wiki\\node_modules\\katex\\dist\\katex.min.css",
    "/wiki/node_modules/katex/dist/katex.css?direct",
]) {
    assert.equal(plugin.transform(source, id).code, transformed);
}
assert.equal(plugin.transform(source, "/wiki/app/styles/main.css"), undefined);

let customFonts = 0;
for (const filename of ["app/styles/main.css", "app/styles/opendyslexic.css"]) {
    const css = await readFile(filename, "utf8");
    const fonts = [...css.matchAll(/url\("([^"\n]+\.woff2)"\)/g)];
    customFonts += fonts.length;
    for (const [, url] of fonts) {
        assert.ok(
            url.startsWith("https://static.igem.wiki/teams/6133/wiki/fonts/"),
        );
        assert.match(url.split("/").at(-1), /^[a-z0-9-]+\.woff2$/);
    }
}
assert.equal(customFonts, 4);
for (const filename of ["app/app.vue", "app/components/ContentDocument.vue"]) {
    const component = await readFile(filename, "utf8");
    assert.ok(!/\.woff2\?url|@fontsource|katex\/dist\/fonts/.test(component));
    assert.ok(component.includes("href: fontAssetUrl(filename)"));
}
console.log(
    `PASS: ${urls.length} KaTeX fonts, ${customFonts} custom fonts, external preloads.`,
);
