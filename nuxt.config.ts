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
                "minisearch",
                "radix-vue",
            ],
        },
        plugins: [tailwindcss()],
    },
    studio: {
        repository: {
            provider: "gitlab",
            owner: "2026",
            repo: "greatbay-scie",
            branch: "main",
            instanceUrl: "https://gitlab.igem.org",
        },
        auth: {
            gitlab: {
                instanceUrl: "https://gitlab.igem.org",
            },
        },
    },
    css: ["./app/styles/main.css"],
    devtools: { enabled: true },
    compatibilityDate: "2024-04-03",
    nitro: {
        preset: "cloudflare-pages",
    },
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
