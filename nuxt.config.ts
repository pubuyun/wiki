// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

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
        "@nuxt/a11y",
        "@vercel/speed-insights",
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
    devtools: { enabled: process.env.NODE_ENV !== "production" },
    compatibilityDate: "2024-04-03",
    content: {
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
        buildCache: true,
    },
});
