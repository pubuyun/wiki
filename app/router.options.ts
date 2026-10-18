import type { RouterConfig } from "@nuxt/schema";
import { nextTick } from "vue";
import { waitForHashTarget } from "./utils/hash-scroll-target";

export default <RouterConfig>{
    async scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        }

        if (to.hash) {
            if (
                import.meta.client &&
                from.matched.length &&
                to.path !== from.path &&
                /^#(?:fnref|ref)-/.test(to.hash)
            ) {
                const router = useRouter();
                const isCurrent = () =>
                    router.currentRoute.value.fullPath === to.fullPath;
                // Wait for the new page to render directly. Registering a
                // `page:loading:end` hook here can miss the hook when Nuxt
                // skips its loading UI for same-category navigation, leaving
                // the browser at the top until the fallback hash scroll runs.
                await nextTick();
                const target = await waitForHashTarget(to.hash, isCurrent);
                if (!target || !isCurrent() || !target.isConnected) {
                    return false;
                }
                window.dispatchEvent(
                    new CustomEvent("wiki:hash-scroll", {
                        detail: { id: target.id },
                    }),
                );
                target.focus({ preventScroll: true });
                return {
                    top: Math.max(
                        0,
                        target.getBoundingClientRect().top +
                            window.scrollY -
                            getScrollPaddingTop() -
                            (Number.parseFloat(
                                getComputedStyle(target).scrollMarginTop,
                            ) || 0),
                    ),
                    behavior: "instant",
                };
            }
            return {
                el: to.hash,
                top: getScrollPaddingTop(),
            };
        }

        if (import.meta.client && !from.matched.length && window.scrollY > 0) {
            return false;
        }

        return { top: 0 };
    },
};

function getScrollPaddingTop() {
    if (!import.meta.client) {
        return 0;
    }

    const value = getComputedStyle(document.documentElement).scrollPaddingTop;
    return Number.parseFloat(value) || 0;
}
