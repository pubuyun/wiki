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
            provider: "github", // 'github' or 'gitlab'
            owner: "pubuyun",
            repo: "wiki",
            branch: "main",
        },
        auth: {
            github: {
                clientId: "Iv23liELgNti4Mb54i9u",
                clientSecret: process.env.STUDIO_GITHUB_CLIENT_SECRET,
            },
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
