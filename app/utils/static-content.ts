export type ContentPayloadIndex = Record<string, string>;

/** Resolve through Nuxt payloads without making a second copy of the content. */
export async function resolveContentPayload<T>(
    key: string,
    index: ContentPayloadIndex,
    load: (route: string) => Promise<{ data?: Record<string, unknown> } | null>,
): Promise<T> {
    const route = index[key];
    if (!route) throw new Error(`No prerendered content payload for ${key}`);
    const payload = await load(route);
    if (!payload?.data || !Object.hasOwn(payload.data, key)) {
        throw new Error(`Missing ${key} in prerendered payload ${route}`);
    }
    return payload.data[key] as T;
}
