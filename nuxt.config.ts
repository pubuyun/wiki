// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import githubLight from "@shikijs/themes/github-light";
import { markdownDocumentsPlugin } from "./app/utils/build/markdown-documents";
import { katexFontsPlugin } from "./app/utils/build/katex-fonts";

const isDevServer = process.env.NODE_ENV === "development";
const contentGraphDirectory = fileURLToPath(
    new URL("./content/model", import.meta.url),
);

export default defineNuxtConfig({
    features: {
        inlineStyles: false,
    },
    app: {
        head: {
            title: "Expelliodor",
            htmlAttrs: {
                lang: "en",
            },
            link: [
                { rel: "preconnect", href: "https://static.igem.wiki" },
                {
                    rel: "icon",
                    type: "image/x-icon",
                    href: "https://2026.igem.wiki/greatbay-scie/favicon.ico",
                },
            ],
        },
    },
    modules: [
        "@nuxt/content",
        "~~/modules/static-content",
        "~~/modules/content-graph",
        "nuxt-echarts",
        ...(isDevServer ? ["@nuxt/a11y"] : []),
    ],
    vite: {
        define: {
            "import.meta.env.WIKI_STATIC_CONTENT": !isDevServer,
        },
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
        plugins: [tailwindcss(), markdownDocumentsPlugin(), katexFontsPlugin()],
    },
    echarts: {
        // Keep the VChart component, with features registered by each consumer.
        renderer: [],
        charts: [],
        components: [],
    },
    runtimeConfig: {
        public: {
            molstarBaseUrl:
                "https://static.igem.wiki/teams/6133/wiki/molstar/4-0-1",
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
            transformers: [
                "~~/app/utils/transformer",
                "~~/app/utils/build/caption-transformer",
            ],
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
                        default: {
                            ...githubLight,
                            name: "github-light-accessible",
                            // Keep the palette; darken orange text to reach 4.5:1 on white.
                            colorReplacements: { "#e36209": "#a74400" },
                        },
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
            routes: [
                "/api/search-index.json",
                "/api/interview-metadata.json",
                "/api/interview-scripts.json",
            ],
            // Query variants cannot be written to static files; keep query handling client-side.
            ignore: [(route) => route.includes("?")],
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
