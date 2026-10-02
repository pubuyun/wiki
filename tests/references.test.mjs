import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import { parse, compileScript, compileTemplate } from "@vue/compiler-sfc";
import { parseMarkdown } from "@nuxtjs/mdc/runtime";
import { computed, reactive, ref } from "vue";
import {
    transformReferenceTree,
    referenceDestination,
    citationDestination,
} from "../app/utils/content-references.ts";

async function loadTypeScript(relativePath, client = false) {
    const url = new URL(relativePath, import.meta.url);
    const source = readFileSync(url, "utf8").replace(
        /from "([^"]+)"/g,
        (_match, specifier) => {
            const resolved = specifier.startsWith("~/")
                ? new URL(`../app/${specifier.slice(2)}.ts`, import.meta.url)
                      .href
                : specifier.startsWith(".")
                  ? new URL(`${specifier}.ts`, url).href
                  : import.meta.resolve(specifier);
            return `from ${JSON.stringify(resolved)}`;
        },
    );
    const { outputText } = ts.transpileModule(
        client ? source.replaceAll("import.meta.client", "true") : source,
        {
            compilerOptions: {
                target: ts.ScriptTarget.ESNext,
                module: ts.ModuleKind.ESNext,
            },
        },
    );
    return import(
        `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
    );
}

const { default: transformer, transformReferenceMarkdown } =
    await loadTypeScript("../app/utils/transformer.ts");
const parseDocument = (body, compress = false) =>
    transformer.parse({ id: "test.md", body }, { compress });

test("two documents link to the shared Reference list and back to their own citations", async () => {
    const first = await parseDocument("First document ^1");
    const second = await parseDocument("Second document ^2.");
    const references = await parseDocument(
        "## Reference\n\n1. [First source](https://example.com/first)\n2. Second source",
    );
    const pages = [
        { path: "/model/first", ...first },
        { path: "/model/second", ...second },
        { path: "/model/reference", ...references },
    ];
    assert.deepEqual(first.citationIds, ["1"]);
    assert.deepEqual(second.citationIds, ["2"]);
    assert.deepEqual(references.referenceIds, ["1", "2"]);
    assert.equal(referenceDestination(pages, "1"), "/model/reference#fnref-1");
    assert.equal(referenceDestination(pages, "2"), "/model/reference#fnref-2");
    assert.equal(citationDestination(pages, "1"), "/model/first#ref-1");
    assert.equal(citationDestination(pages, "2"), "/model/second#ref-2");
    assert.equal(
        references.body.children[1].children[0].children[0].tag,
        "ref-fn",
    );
    assert.equal(
        references.body.children[1].children[0].children[0].children[0].tag,
        "a",
    );
});

test("reference anchors survive compressed content, existing MDC, and non-one list starts", async () => {
    for (const compress of [false, true]) {
        const result = await parseDocument(
            "## Reference\n\n3. Third source\n4. :ref-fn[Fourth source]{#4}",
            compress,
        );
        assert.deepEqual(result.referenceIds, ["3", "4"]);
        const serialized = JSON.stringify(result.body);
        assert.equal(serialized.match(/ref-fn/g).length, 2);
        assert.match(serialized, /"id":"3"/);
        assert.match(serialized, /"id":"4"/);
    }
});

test("only ordered lists in the exact Reference section become reference anchors", async () => {
    const parsed = await parseMarkdown(
        "## Reference cofolding\n\n1. Other\n\n## Reference\n\n- Unordered\n\n1. Source\n\n## Next\n\n1. Other\n\n# End\n\n1. Other",
    );
    assert.deepEqual(transformReferenceTree(parsed.body), {
        hasReference: true,
        referenceIds: ["1"],
        citationIds: [],
    });
    assert.equal(JSON.stringify(parsed.body).match(/ref-fn/g).length, 1);
});

test("reference wrapping preserves additional paragraphs and nested lists", async () => {
    const markdown =
        "## Reference\n\n1. First source\n\n   Additional details.\n\n   - Nested detail\n\n2. Second source";
    const original = await parseMarkdown(markdown);
    const parsed = await parseDocument(markdown);
    const item = parsed.body.children[1].children[0];
    const originalChildren = original.body.children[1].children[0].children;
    assert.equal(item.children[0].tag, "ref-fn");
    assert.deepEqual(item.children[0].children, originalChildren.slice(0, -1));
    assert.deepEqual(item.children[1], originalChildren.at(-1));
    assert.equal(item.children[1].tag, "ul");
    assert.deepEqual(parsed.referenceIds, ["1", "2"]);
});

test("legacy Foot Notes and heading references retain their destinations", async () => {
    const parsed = await parseDocument(
        "Text ^1 and ^[Heading].\n\n## Foot Notes\n\n1. Legacy source",
    );
    assert.equal(parsed.hasReference, false);
    assert.deepEqual(parsed.citationIds, ["1"]);
    assert.match(JSON.stringify(parsed.body), /ref-fn/);
    assert.match(
        transformReferenceMarkdown("See ^[Heading]."),
        /destination="#heading"/,
    );
    assert.equal(referenceDestination([], "1"), "#fnref-1");
    assert.equal(citationDestination([], "1"), "#ref-1");
});

test("category lookup includes nested documents and preserves the last clicked citation", async () => {
    const route = reactive({ path: "/model/nested/first" });
    const conditions = [];
    const states = new Map();
    const pages = ref([
        {
            path: "/model/nested/first",
            hasReference: false,
            referenceIds: [],
            citationIds: ["1"],
        },
        {
            path: "/model/second",
            hasReference: false,
            referenceIds: [],
            citationIds: ["1"],
        },
        {
            path: "/model/reference",
            hasReference: true,
            referenceIds: ["1"],
            citationIds: [],
        },
    ]);
    const globals = {
        computed,
        useRoute: () => route,
        useState: (key, initial) => {
            if (!states.has(key)) states.set(key, ref(initial()));
            return states.get(key);
        },
        useAsyncData: async (_key, handler) => {
            await handler();
            return { data: pages };
        },
        queryCollection: () => {
            const query = {
                orWhere: (group) => {
                    group(query);
                    return query;
                },
                where: (...args) => {
                    conditions.push(args);
                    return query;
                },
                select: () => query,
                order: () => query,
                all: async () => pages.value,
            };
            return query;
        },
    };
    const originals = Object.fromEntries(
        Object.keys(globals).map((key) => [key, globalThis[key]]),
    );
    Object.assign(globalThis, globals);
    try {
        const { useCategoryReferences } = await loadTypeScript(
            "../app/composables/useCategoryReferences.ts",
        );
        const links = await useCategoryReferences();
        assert.deepEqual(conditions, [
            ["path", "=", "/model"],
            ["path", "LIKE", "/model/%"],
        ]);
        assert.equal(links.referenceLink("1"), "/model/reference#fnref-1");
        route.path = "/model/second";
        links.rememberCitation("1", { button: 0 });
        route.path = "/model/reference";
        assert.equal(links.citationLink("1"), "/model/second#ref-1");
        route.path = "/model/nested/first";
        links.rememberCitation("1", { button: 0, ctrlKey: true });
        assert.equal(links.citationLink("1"), "/model/second#ref-1");
        route.path = "/design/reference";
        pages.value = [];
        assert.equal(links.citationLink("1"), "#ref-1");
    } finally {
        for (const [key, value] of Object.entries(originals)) {
            if (value === undefined) delete globalThis[key];
            else globalThis[key] = value;
        }
    }
});

test("reference components compile with async category lookup and routed links", () => {
    for (const name of ["FnRef", "RefFn", "Reference"]) {
        const filename = `../app/components/${name}.vue`;
        const { descriptor, errors } = parse(
            readFileSync(new URL(filename, import.meta.url), "utf8"),
        );
        assert.deepEqual(errors, []);
        const script = compileScript(descriptor, { id: name });
        const template = compileTemplate({
            source: descriptor.template.content,
            filename,
            id: name,
            compilerOptions: { bindingMetadata: script.bindings },
        });
        assert.deepEqual(template.errors, []);
    }
});

test("cross-document anchor scrolling waits for the page and focuses the reference", async () => {
    let finish;
    const focused = [];
    const target = { focus: (options) => focused.push(options) };
    const to = {
        path: "/model/reference",
        hash: "#fnref-2",
        fullPath: "/model/reference#fnref-2",
    };
    const currentRoute = ref(to);
    const globals = {
        useNuxtApp: () => ({
            hooks: {
                hookOnce: (name, callback) => {
                    assert.equal(name, "page:loading:end");
                    finish = callback;
                },
            },
        }),
        useRouter: () => ({ currentRoute }),
        requestAnimationFrame: (callback) => callback(),
        document: {
            documentElement: {},
            getElementById: (id) => {
                assert.equal(id, "fnref-2");
                return target;
            },
        },
        getComputedStyle: () => ({
            scrollPaddingTop: "20px",
            scrollMarginTop: "96px",
        }),
    };
    const originals = Object.fromEntries(
        Object.keys(globals).map((key) => [key, globalThis[key]]),
    );
    Object.assign(globalThis, globals);
    try {
        const { default: options } = await loadTypeScript(
            "../app/router.options.ts",
            true,
        );
        const position = options.scrollBehavior(to, {
            path: "/model/second",
            matched: [{}],
        });
        assert.deepEqual(focused, []);
        finish();
        assert.deepEqual(await position, { el: "#fnref-2", top: 116 });
        assert.deepEqual(focused, [{ preventScroll: true }]);
        const cancelled = options.scrollBehavior(to, {
            path: "/model/second",
            matched: [{}],
        });
        currentRoute.value = { fullPath: "/design/overview" };
        finish();
        assert.equal(await cancelled, false);
        const saved = { top: 42 };
        assert.equal(options.scrollBehavior(to, {}, saved), saved);
    } finally {
        for (const [key, value] of Object.entries(originals)) {
            if (value === undefined) delete globalThis[key];
            else globalThis[key] = value;
        }
    }
});
