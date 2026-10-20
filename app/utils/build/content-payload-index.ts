import { parse } from "devalue";
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
