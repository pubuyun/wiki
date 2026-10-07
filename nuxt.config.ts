// https://nuxt.com/docs/api/configuration/nuxt-config
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";

const isDevServer = process.env.NODE_ENV === "development";
const contentGraphDirectory = fileURLToPath(
    new URL("./content/model", import.meta.url),
);
const contentGraphRegistry = JSON.parse(
    readFileSync(
        new URL("./content/model/graphs.json", import.meta.url),
        "utf8",
    ),
);
const contentGraphViews = Object.keys(contentGraphRegistry.graphs);

export default defineNuxtConfig({
    app: {
        head: {
            title: "Expelliodor",
            htmlAttrs: {
                lang: "en",
            },
            link: [{ rel: "preconnect", href: "https://static.igem.wiki" }],
        },
    },
    modules: [
        "@nuxt/content",
        ...(process.env.NUXT_STUDIO !== "false" ? ["nuxt-studio"] : []),
        "nuxt-echarts",
        ...(isDevServer ? ["@nuxt/a11y"] : []),
    ],
    vite: {
        resolve: {
            // Use local icon storage with no API fallback across all components.
            alias: [
                {
                    find: /^@iconify\/vue$/,
                    replacement: fileURLToPath(
                        import.meta.resolve("@iconify/vue/offline"),
                    ),
                },
            ],
        },
        optimizeDeps: {
            include: [
                "@iconify/vue/offline",
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
        plugins: [
            tailwindcss(),
            {
                name: "katex-fonts",
                enforce: "pre",
                transform(code, id) {
                    if (
                        !/[/\\]katex[/\\]dist[/\\]katex(?:\.min)?\.css(?:\?|$)/.test(
                            id,
                        )
                    ) {
                        return;
                    }

                    // Keep math visible while loading only modern WOFF2 fonts.
                    return {
                        code: code
                            .replace(
                                /font-display\s*:\s*\w+/g,
                                "font-display: swap",
                            )
                            .replace(
                                /src\s*:\s*([^;}]+)/g,
                                (declaration, sources: string) => {
                                    const woff2 = sources
                                        .split(",")
                                        .filter((source) =>
                                            /format\(\s*["']?woff2["']?\s*\)/.test(
                                                source,
                                            ),
                                        )
                                        .join(",");

                                    return woff2
                                        ? `src: ${woff2}`
                                        : declaration;
                                },
                            ),
                        map: null,
                    };
                },
            },
        ],
    },
    echarts: {
        renderer: ["svg", "canvas"],
        charts: ["LineChart", "BarChart", "HeatmapChart", "CustomChart"],
        components: [
            "TitleComponent",
            "TooltipComponent",
            "GridComponent",
            "LegendComponent",
            "VisualMapComponent",
            "AriaComponent",
            "DataZoomComponent",
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
            contentGraphViews,
        },
    },
    css: ["~/styles/main.css", "katex/dist/katex.min.css"],
    devtools: { enabled: isDevServer },
    compatibilityDate: "2024-04-03",
    content: {
        experimental: {
            sqliteConnector: "native",
        },
        build: {
            transformers: ["~~/app/utils/transformer"],
            markdown: {
                remarkPlugins: {
                    "remark-math": {
                        options: {
                            singleDollarTextMath: true,
                        },
                    },
                },
                rehypePlugins: {
                    "rehype-katex": {},
                },
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
        prerender: {
            routes: ["/api/search-index.json"],
        },
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
        buildCache: false,
    },
});
