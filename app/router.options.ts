import type { RouterConfig } from "@nuxt/schema";
import { nextTick } from "vue";
import { focusHashTarget, waitForHashTarget } from "./utils/hash-scroll-target";

export default <RouterConfig>{
    async scrollBehavior(to, from, savedPosition) {
        // Keep native initial-load restoration, including URL fragments.
        if (!from.matched.length) return savedPosition ?? false;

        const nuxtApp = useNuxtApp();
        const router = useRouter();
        const isCurrent = () =>
            router.currentRoute.value.fullPath === to.fullPath;
        if (!isCurrent()) return false;

        // Reset ordinary navigation immediately, while Suspense prepares the
        // next page. Only history restoration and anchors need the new DOM.
        if (to.path !== from.path && !savedPosition && !to.hash) {
            return { left: 0, top: 0, behavior: "instant" };
        }

        if (to.path !== from.path && useRoute().path !== to.path) {
            await new Promise<void>((resolve) => {
                nuxtApp.hooks.hookOnce("page:finish", () => resolve());
            });
        }
        await nextTick();

        if (!isCurrent()) return false;
        if (savedPosition) return savedPosition;

        if (to.hash) {
            const target = await waitForHashTarget(to.hash, isCurrent);
            if (!target || !isCurrent() || !target.isConnected) return false;

            window.dispatchEvent(
                new CustomEvent("wiki:hash-scroll", {
                    detail: { id: target.id },
                }),
            );
            // Native anchor scrolling respects CSS scroll-padding and
            // scroll-margin without a second coordinate correction.
            target.scrollIntoView({ behavior: "instant", block: "start" });
            focusHashTarget(target);
            return false;
        }

        return false;
    },
};
