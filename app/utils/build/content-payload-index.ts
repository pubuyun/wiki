import { parse, stringify } from "devalue";
import type { ContentPayloadIndex } from "../static-content";

const wrappers = [
    "ShallowReactive",
    "Reactive",
    "ShallowRef",
    "Ref",
    "EmptyShallowRef",
    "EmptyRef",
];
const revivers = Object.fromEntries(
    wrappers.map((name) => [name, (value: unknown) => value]),
);
const contentKey = /^(?:content-|category-references-|interview-script-)/;

/** Remove copies of static-content data that Nuxt embeds in every route. */
export function compactContentPayloads(
    payloads: { route: string; contents: string; file?: string }[],
) {
    const parsed = payloads.map((payload) => ({
        ...payload,
        value: parse(payload.contents, revivers) as {
            data?: Record<string, unknown>;
        },
    }));
    const owners = new Map<string, string>();
    for (const payload of [...parsed].sort(
        (a, b) => a.contents.length - b.contents.length,
    )) {
        for (const key of Object.keys(payload.value.data ?? {})) {
            if (contentKey.test(key) && !owners.has(key))
                owners.set(key, payload.route);
        }
    }
    for (const payload of parsed) {
        for (const key of Object.keys(payload.value.data ?? {})) {
            if (contentKey.test(key) && owners.get(key) !== payload.route)
                delete payload.value.data![key];
        }
        if (payload.file) payload.contents = stringify(payload.value);
    }
    return parsed.map(({ value: _value, ...payload }) => payload);
}

export function createContentPayloadIndex(
    payloads: { route: string; contents: string }[],
): ContentPayloadIndex {
    const index: ContentPayloadIndex = {};
    // Prefer the smallest owner when a category's metadata occurs on many pages.
    for (const payload of [...payloads].sort(
        (a, b) => a.contents.length - b.contents.length,
    )) {
        const value = parse(payload.contents, revivers) as {
            data?: Record<string, unknown>;
        };
        for (const key of Object.keys(value.data ?? {})) {
            if (contentKey.test(key) && !Object.hasOwn(index, key))
                index[key] = payload.route;
        }
    }
    return index;
}
