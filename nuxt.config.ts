// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

const isDevServer = process.env.NODE_ENV === "development";

export default defineNuxtConfig({
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
        "@formkit/auto-animate/nuxt",
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
            ],
        },
        plugins: [tailwindcss()],
    },
    echarts: {
        renderer: "canvas",
        charts: ["BarChart", "LineChart"],
        components: [
            "TitleComponent",
            "TooltipComponent",
            "GridComponent",
            "LegendComponent",
            "ToolboxComponent",
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
        },
    },
    css: ["./app/styles/main.css"],
    devtools: { enabled: isDevServer },
    nitro: {
        prerender: {
            routes: ["/search-index.json"],
        },
    },
    compatibilityDate: "2024-04-03",
    content: {
        experimental: {
            sqliteConnector: "native",
        },
        build: {
            transformers: ["~~/app/utils/transformer"],
            markdown: {
                toc: {
                    depth: 3,
                },
            },
        },
    },

    experimental: {
        buildCache: false,
    },
});
