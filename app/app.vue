<template>
    <div>
        <NuxtAnnouncer />
        <!-- 
            NuxtAnnouncer can announce messages to screen readers.
            const { polite, assertive } = useAnnouncer()

            async function submitForm () {
                try {
                    await $fetch('/api/contact', { method: 'POST', body: formData })
                    polite('Message sent successfully')
                } catch (error) {
                    assertive('Error: Failed to send message')
                }
            }
        -->
        <NuxtRouteAnnouncer />
        <!-- automatically announces route changes -->
        <Loading />
        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import "./styles/opendyslexic.css";
import { fontAssetUrl } from "~/utils/font-assets";

const DARK_MODE_COOKIE = "wiki-dark-mode";
const HIGH_CONTRAST_MODE_COOKIE = "wiki-high-contrast-mode";

const savedHighContrastMode = useCookie<boolean>(HIGH_CONTRAST_MODE_COOKIE, {
    default: () => false,
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
});
const highContrastMode = useState<boolean>(
    "high-contrast-mode",
    () => savedHighContrastMode.value,
);
const savedDarkMode = useCookie<boolean>(DARK_MODE_COOKIE, {
    default: () => false,
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
});
const darkMode = useState<boolean>("dark-mode", () => savedDarkMode.value);
const dyslexiaMode = useState<boolean>("dyslexia-mode", () => false);
const faviconHref = `${useRuntimeConfig().app.baseURL.replace(/\/?$/, "/")}favicon.ico`;

watch(highContrastMode, (enabled) => {
    savedHighContrastMode.value = enabled;
});

watch(darkMode, (enabled) => {
    savedDarkMode.value = enabled;
});

const themeClass = computed(() =>
    [
        highContrastMode.value && "high-contrast",
        darkMode.value && "dark",
        dyslexiaMode.value && "dyslexia",
    ]
        .filter(Boolean)
        .join(" "),
);

useHead({
    title: "GreatBay-SCIE - iGEM 2026",
    titleTemplate: "%s | GreatBay-SCIE - iGEM 2026",
    link: [
        {
            rel: "icon",
            type: "image/x-icon",
            href: faviconHref,
        },
        ...[
            "momo-trust-display-latin-400-normal.woff2",
            "righteous-latin-400-normal.woff2",
            "belanosima-latin-400-normal.woff2",
        ].map(
            (filename) =>
                ({
                    rel: "preload",
                    as: "font",
                    type: "font/woff2",
                    crossorigin: "anonymous",
                    href: fontAssetUrl(filename),
                }) as const,
        ),
    ],
    bodyAttrs: {
        class: themeClass,
    },
});
</script>
