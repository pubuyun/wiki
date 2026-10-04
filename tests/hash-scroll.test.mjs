import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import { waitForHashTarget } from "../app/utils/hash-scroll-target.ts";

function mockDom() {
    const elements = new Map();
    const observers = new Set();
    const globals = {
        MutationObserver: class {
            constructor(callback) {
                this.callback = callback;
            }
            observe() {
                observers.add(this);
            }
            disconnect() {
                observers.delete(this);
            }
        },
        document: {
            documentElement: {},
            getElementById: (id) => elements.get(id) ?? null,
        },
        window: {
            setTimeout,
            clearTimeout,
            scrollY: 120,
            dispatchEvent: () => {},
        },
        requestAnimationFrame: (callback) => callback(),
        getComputedStyle: (element) =>
            element === globals.document.documentElement
                ? { scrollPaddingTop: "192px" }
                : { scrollMarginTop: "96px" },
    };
    const originals = Object.fromEntries(
        Object.keys(globals).map((key) => [key, globalThis[key]]),
    );
    Object.assign(globalThis, globals);
    return {
        elements,
        observers,
        mutate: () => {
            for (const observer of [...observers]) observer.callback();
        },
        restore: () => {
            for (const [key, value] of Object.entries(originals)) {
                if (value === undefined) delete globalThis[key];
                else globalThis[key] = value;
            }
        },
    };
}

test("waits for an async reference anchor instead of returning a missing selector", async () => {
    const dom = mockDom();
    try {
        const target = { id: "fnref-1" };
        const result = waitForHashTarget("#fnref-1", () => true);
        assert.equal(dom.observers.size, 1);
        dom.mutate();
        assert.equal(dom.observers.size, 1);
        dom.elements.set(target.id, target);
        dom.mutate();
        assert.equal(await result, target);
        assert.equal(dom.observers.size, 0);
    } finally {
        dom.restore();
    }
});

test("ignores a pending anchor when a newer navigation replaces it", async () => {
    const dom = mockDom();
    let current = true;
    try {
        const result = waitForHashTarget("#ref-1", () => current);
        current = false;
        dom.elements.set("ref-1", { id: "ref-1" });
        dom.mutate();
        assert.equal(await result, null);
        assert.equal(dom.observers.size, 0);
    } finally {
        dom.restore();
    }
});

test("missing anchors time out and disconnect their observer", async () => {
    const dom = mockDom();
    try {
        assert.equal(await waitForHashTarget("#missing", () => true, 10), null);
        assert.equal(dom.observers.size, 0);
    } finally {
        dom.restore();
    }
});

test("existing and encoded anchors resolve immediately", async () => {
    const dom = mockDom();
    try {
        const target = { id: "引用" };
        dom.elements.set(target.id, target);
        assert.equal(
            await waitForHashTarget("#%E5%BC%95%E7%94%A8", () => true),
            target,
        );
        assert.equal(dom.observers.size, 0);
    } finally {
        dom.restore();
    }
});

test("cross-document scrolling waits past page loading for the anchor and uses its final position", async () => {
    const source = readFileSync(
        new URL("../app/router.options.ts", import.meta.url),
        "utf8",
    )
        .replace(
            'from "./utils/hash-scroll-target"',
            `from ${JSON.stringify(new URL("../app/utils/hash-scroll-target.ts", import.meta.url).href)}`,
        )
        .replaceAll("import.meta.client", "true");
    const { outputText } = ts.transpileModule(source, {
        compilerOptions: {
            target: ts.ScriptTarget.ESNext,
            module: ts.ModuleKind.ESNext,
        },
    });
    const { default: options } = await import(
        `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
    );
    const dom = mockDom();
    const to = {
        path: "/software/reference",
        hash: "#fnref-1",
        fullPath: "/software/reference#fnref-1",
    };
    let finish;
    const focused = [];
    const events = [];
    const extraGlobals = {
        useNuxtApp: () => ({
            hooks: {
                hookOnce: (name, callback) => {
                    assert.equal(name, "page:loading:end");
                    finish = callback;
                },
            },
        }),
        useRouter: () => ({ currentRoute: { value: to } }),
        CustomEvent: class {
            constructor(type, options) {
                this.type = type;
                this.detail = options.detail;
            }
        },
    };
    const originals = Object.fromEntries(
        Object.keys(extraGlobals).map((key) => [key, globalThis[key]]),
    );
    Object.assign(globalThis, extraGlobals);
    window.dispatchEvent = (event) => events.push(event);
    try {
        const scroll = options.scrollBehavior(to, {
            path: "/software/foundryui",
            matched: [{}],
        });
        const loadingComplete = finish();
        assert.equal(dom.observers.size, 1);
        assert.deepEqual(focused, []);
        dom.elements.set("fnref-1", {
            id: "fnref-1",
            isConnected: true,
            getBoundingClientRect: () => ({ top: 500 }),
            focus: (options) => focused.push(options),
        });
        dom.mutate();
        await loadingComplete;
        assert.deepEqual(await scroll, { top: 332, behavior: "instant" });
        assert.deepEqual(focused, [{ preventScroll: true }]);
        assert.equal(events[0].type, "wiki:hash-scroll");
        assert.deepEqual(events[0].detail, { id: "fnref-1" });
        assert.equal(dom.observers.size, 0);
        const saved = { top: 90 };
        assert.equal(options.scrollBehavior(to, {}, saved), saved);
    } finally {
        for (const [key, value] of Object.entries(originals)) {
            if (value === undefined) delete globalThis[key];
            else globalThis[key] = value;
        }
        dom.restore();
    }
});
