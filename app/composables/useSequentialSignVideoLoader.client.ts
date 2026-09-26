import { SIGN_VIDEO_BASE_URL } from "~/data/sign-language-challenge";

type SignVideoModule = {
    default: string;
};

const cache = new Map<string, Promise<string>>();
let loadChain: Promise<void> = Promise.resolve();

function preloadImage(source: string) {
    return new Promise<void>((resolve, reject) => {
        const image = new Image();
        image.decoding = "async";
        image.onload = () => resolve();
        image.onerror = () =>
            reject(new Error("The animation could not be decoded."));
        image.src = source;
    });
}

async function loadModuleSource(url: string) {
    try {
        const module = (await import(
            /* @vite-ignore */ url
        )) as SignVideoModule;
        return module.default;
    } catch {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(
                `Animation request failed with ${response.status}.`,
            );
        }

        const moduleText = (await response.text()).trim();
        const prefix = "export default ";
        if (!moduleText.startsWith(prefix)) {
            throw new Error("The animation module has an unexpected format.");
        }

        const stringLiteral = moduleText
            .slice(prefix.length)
            .replace(/;\s*$/, "");
        return JSON.parse(stringLiteral) as string;
    }
}

async function importVideo(id: string) {
    const remoteFileName = id.replaceAll("_", "-");
    const url = `${SIGN_VIDEO_BASE_URL}/${remoteFileName}.js`;
    const source = await loadModuleSource(url);

    if (!source.startsWith("data:image/avif;base64,")) {
        throw new Error("The animation source has an unexpected format.");
    }

    await preloadImage(source);
    return source;
}

export function loadSignVideo(id: string) {
    const cached = cache.get(id);
    if (cached) return cached;

    const request = loadChain.then(() => importVideo(id));
    loadChain = request.then(
        () => undefined,
        () => undefined,
    );
    cache.set(id, request);
    request.catch(() => cache.delete(id));

    return request;
}
