// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
    modules: [
        "@nuxt/content",
        ...(process.env.NUXT_STUDIO !== "false" ? ["nuxt-studio"] : []),
        "nuxt-echarts",
    ],
    vite: {
        optimizeDeps: {
            include: [
                "@iconify/vue",
                "@vue/devtools-core",
                "@vue/devtools-kit",
                "molstar/build/viewer/molstar", // CJS
                "radix-vue",
                "vue-echarts",
            ],
        },
        plugins: [tailwindcss()],
    },
    echarts: {
        renderer: "canvas",
        charts: ["BarChart"],
        components: ["TitleComponent", "TooltipComponent", "GridComponent"],
    },
    studio: {
        repository: {
            provider: "github", // 'github' or 'gitlab'
            owner: "pubuyun",
            repo: "wiki",
            branch: "main",
        },
    },
    css: ["./app/styles/main.css"],
    devtools: { enabled: true },
    compatibilityDate: "2024-04-03",
    content: {
        build: {
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
