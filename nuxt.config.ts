// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    modules: ["@nuxtjs/tailwindcss", "@nuxt/content", "nuxt-studio"],
    vite: {
        optimizeDeps: {
            include: ["@vue/devtools-core", "@vue/devtools-kit"],
        },
    },
    studio: {
        repository: {
            provider: "github", // 'github' or 'gitlab'
            owner: "pubuyun",
            repo: "wiki",
            branch: "main",
        },
    },
    nitro: {
        preset: "cloudflare-pages",
    },
    devtools: { enabled: true },
    compatibilityDate: "2024-04-03",
});
