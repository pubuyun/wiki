import { loadPayload } from "#app";
import {
    resolveContentPayload,
    type ContentPayloadIndex,
} from "~/utils/static-content";

const indexes = new WeakMap<object, Promise<ContentPayloadIndex>>();

export function readStaticContent<T>(key: string): Promise<T> {
    const app = useNuxtApp();
    const config = useRuntimeConfig();
    let index = indexes.get(app);
    if (!index) {
        const url = `${config.app.baseURL.replace(/\/$/, "")}/content/payload-index.json`;
        index = $fetch<ContentPayloadIndex>(url, {
            query: { v: config.app.buildId },
        }).catch((error) => {
            indexes.delete(app);
            throw error;
        });
        indexes.set(app, index);
    }
    return index.then((value) =>
        resolveContentPayload<T>(key, value, (route) =>
            app.runWithContext(() => loadPayload(route)),
        ),
    );
}
