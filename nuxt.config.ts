// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
    modules: [
        "@nuxt/content",
        ...(process.env.NUXT_STUDIO !== "false" ? ["nuxt-studio"] : []),
    ],
    vite: {
        optimizeDeps: {
            include: [
                "@iconify/vue",
                "@vue/devtools-core",
                "@vue/devtools-kit",
                "radix-vue",
            ],
        },
        plugins: [tailwindcss()],
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
});
