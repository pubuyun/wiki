// https://nuxt.com/docs/api/configuration/nuxt-config
import { readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";

const isDevServer = process.env.NODE_ENV === "development";
const contentGraphDirectory = fileURLToPath(
    new URL("./content/model", import.meta.url),
);
const contentGraphPaths = readdirSync(contentGraphDirectory, {
    recursive: true,
    withFileTypes: true,
})
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => {
        const filePath = join(entry.parentPath, entry.name);
        const relativePath = relative(contentGraphDirectory, filePath)
            .split(sep)
            .join("/");

        return `/content/model/${relativePath}`;
    });

let viteCompileCount = 0;

function buildMemorySnapshot() {
    return Object.fromEntries(
        Object.entries(process.memoryUsage()).map(([key, bytes]) => [
            key,
            Math.round(bytes / 1024 / 1024),
        ]),
    );
}

export default defineNuxtConfig({
    hooks: {
        async "vite:compiled"() {
            viteCompileCount += 1;
            if (viteCompileCount !== 1) return;

            const collectGarbage = (
                globalThis as typeof globalThis & { gc?: () => void }
            ).gc;
            const before = buildMemorySnapshot();

            if (!collectGarbage) {
                console.warn(
                    "[build-gc] GC is unavailable; start Nuxt with node --expose-gc",
                    { before },
                );
                return;
            }

            collectGarbage();
            await new Promise<void>((resolve) => setImmediate(resolve));
            collectGarbage();

            console.info("[build-gc] client build collection complete", {
                before,
                after: buildMemorySnapshot(),
            });
        },
    },
    app: {
        head: {
            title: "Expelliodor",
            htmlAttrs: {
                lang: "en",
            },
        },
    },
    modules: [
        "@nuxt/content",
        ...(process.env.NUXT_STUDIO !== "false" ? ["nuxt-studio"] : []),
        "nuxt-echarts",
        ...(isDevServer ? ["@nuxt/a11y"] : []),
    ],
    vite: {
        optimizeDeps: {
            include: [
                "@iconify/vue",
                "@vue/devtools-core",
                "@vue/devtools-kit",
                "reka-ui",
                "vue-echarts",
                "fuse.js",
                "gsap",
                "vue-easy-lightbox",
                "@vue-flow/core",
                "smiles-drawer",
                "gsap/ScrollTrigger",
                "gsap/MorphSVGPlugin",
                "gsap/MotionPathPlugin",
                "gsap/Flip",
                "lenis",
            ],
        },
        plugins: [tailwindcss()],
    },
    echarts: {
        renderer: "svg",
        charts: ["LineChart", "HeatmapChart", "CustomChart"],
        components: [
            "TitleComponent",
            "TooltipComponent",
            "GridComponent",
            "LegendComponent",
            "VisualMapComponent",
            // "ToolboxComponent",
            // "DataZoomComponent",
        ],
    },
    studio: {
        repository: {
            provider: "github", // 'github' or 'gitlab'
            owner: "pubuyun",
            repo: "wiki",
            branch: "main",
        },
    },
    runtimeConfig: {
        public: {
            molstarBaseUrl:
                "https://static.igem.wiki/teams/6133/wiki/molstar/4-0-1",
            contentGraphPaths,
        },
    },
    css: ["./app/styles/main.css"],
    devtools: { enabled: isDevServer },
    compatibilityDate: "2024-04-03",
    content: {
        experimental: {
            sqliteConnector: "native",
        },
        build: {
            transformers: ["~~/app/utils/transformer"],
            markdown: {
                highlight: {
                    langs: [
                        "python",
                        "json",
                        "javascript",
                        "css",
                        "markdown",
                        "yaml",
                    ],
                    theme: {
                        default: "github-light",
                        dark: "github-dark",
                    },
                },
                toc: {
                    depth: 3,
                },
            },
        },
    },
    nitro: {
        publicAssets: [
            {
                dir: contentGraphDirectory,
                baseURL: "/content/model",
                fallthrough: false,
            },
        ],
        ignore: ["**/*.md", "**/*.yml", "**/*.yaml"],
    },

    experimental: {
        buildCache: true,
    },
});
