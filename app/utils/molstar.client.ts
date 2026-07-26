type MolstarApi = {
    ExtensionMap: Record<string, unknown>;
    Viewer: {
        create: (
            elementOrId: string | HTMLElement,
            options?: Record<string, unknown>,
        ) => Promise<any>;
    };
    setDebugMode: (enabled: boolean) => void;
    setTimingMode: (enabled: boolean) => void;
};

declare global {
    interface Window {
        molstar?: MolstarApi;
        __MOLSTAR_ASSET_BASE_URL__?: string;
    }
}

let loading: Promise<MolstarApi> | undefined;
let loadedBaseUrl: string | undefined;

function normalizeBaseUrl(baseUrl: string) {
    return baseUrl.trim().replace(/\/+$/, "");
}

function loadStylesheet(href: string) {
    const absoluteHref = new URL(href, document.baseURI).href;
    const existing = document.querySelector<HTMLLinkElement>(
        'link[data-molstar-stylesheet="true"]',
    );

    if (existing) {
        if (
            existing.href === absoluteHref &&
            existing.dataset.loaded === "true"
        ) {
            return Promise.resolve();
        }

        return new Promise<void>((resolve, reject) => {
            existing.dataset.loaded = "false";
            existing.addEventListener(
                "load",
                () => {
                    existing.dataset.loaded = "true";
                    resolve();
                },
                { once: true },
            );
            existing.addEventListener(
                "error",
                () =>
                    reject(
                        new Error(
                            `Unable to load Mol* CSS from ${absoluteHref}`,
                        ),
                    ),
                { once: true },
            );

            if (existing.href !== absoluteHref) {
                existing.href = absoluteHref;
            }
        });
    }

    return new Promise<void>((resolve, reject) => {
        const stylesheet = document.createElement("link");
        stylesheet.rel = "stylesheet";
        stylesheet.href = href;
        stylesheet.dataset.molstarStylesheet = "true";
        stylesheet.addEventListener(
            "load",
            () => {
                stylesheet.dataset.loaded = "true";
                resolve();
            },
            { once: true },
        );
        stylesheet.addEventListener(
            "error",
            () => reject(new Error(`Unable to load Mol* CSS from ${href}`)),
            { once: true },
        );
        document.head.appendChild(stylesheet);
    });
}

export function setMolstarTheme(baseUrl: string, darkMode: boolean) {
    const normalizedBaseUrl = normalizeBaseUrl(baseUrl);

    if (!normalizedBaseUrl) {
        return Promise.reject(
            new Error("NUXT_PUBLIC_MOLSTAR_BASE_URL is not configured."),
        );
    }

    const theme = darkMode ? "dark" : "light";
    return loadStylesheet(`${normalizedBaseUrl}/theme/${theme}.css`);
}

function loadScript(src: string) {
    if (window.molstar) return Promise.resolve(window.molstar);

    return new Promise<MolstarApi>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.dataset.molstarScript = "true";
        script.addEventListener(
            "load",
            () => {
                if (window.molstar) {
                    resolve(window.molstar);
                } else {
                    reject(
                        new Error(
                            "Mol* loaded without creating window.molstar.",
                        ),
                    );
                }
            },
            { once: true },
        );
        script.addEventListener(
            "error",
            () => reject(new Error(`Unable to load Mol* JS from ${src}`)),
            { once: true },
        );
        document.head.appendChild(script);
    });
}

export function loadMolstar(baseUrl: string, darkMode = false) {
    const normalizedBaseUrl = normalizeBaseUrl(baseUrl);

    if (!normalizedBaseUrl) {
        return Promise.reject(
            new Error(
                "NUXT_PUBLIC_MOLSTAR_BASE_URL is not configured. Upload cdn-upload/molstar/4.0.1 and set the variable to that directory's public URL.",
            ),
        );
    }

    const stylesheet = setMolstarTheme(normalizedBaseUrl, darkMode);

    if (window.molstar) {
        return stylesheet.then(() => window.molstar!);
    }

    if (loading) {
        if (loadedBaseUrl !== normalizedBaseUrl) {
            return Promise.reject(
                new Error(
                    `Mol* is already loading from ${loadedBaseUrl}; it cannot also load from ${normalizedBaseUrl}.`,
                ),
            );
        }

        return Promise.all([stylesheet, loading]).then(
            ([, molstar]) => molstar,
        );
    }

    loadedBaseUrl = normalizedBaseUrl;
    window.__MOLSTAR_ASSET_BASE_URL__ = `${normalizedBaseUrl}/`;

    loading = Promise.all([
        stylesheet,
        loadScript(`${normalizedBaseUrl}/molstar.js`),
    ])
        .then(([, molstar]) => molstar)
        .catch((error) => {
            loading = undefined;
            loadedBaseUrl = undefined;
            throw error;
        });

    return loading;
}
