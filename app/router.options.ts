import type { RouterConfig } from "@nuxt/schema";
import { waitForHashTarget } from "./utils/hash-scroll-target";

export default <RouterConfig>{
    scrollBehavior(to, from, savedPosition) {
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
                const nuxtApp = useNuxtApp();
                const router = useRouter();
                const isCurrent = () =>
                    router.currentRoute.value.fullPath === to.fullPath;
                return new Promise((resolve) => {
                    nuxtApp.hooks.hookOnce("page:loading:end", async () => {
                        const target = await waitForHashTarget(
                            to.hash,
                            isCurrent,
                        );
                        if (!target) {
                            resolve(false);
                            return;
                        }
                        requestAnimationFrame(() => {
                            if (!isCurrent() || !target.isConnected) {
                                resolve(false);
                                return;
                            }
                            window.dispatchEvent(
                                new CustomEvent("wiki:hash-scroll", {
                                    detail: { id: target.id },
                                }),
                            );
                            target.focus({ preventScroll: true });
                            resolve({
                                top: Math.max(
                                    0,
                                    target.getBoundingClientRect().top +
                                        window.scrollY -
                                        getScrollPaddingTop() -
                                        (Number.parseFloat(
                                            getComputedStyle(target)
                                                .scrollMarginTop,
                                        ) || 0),
                                ),
                                behavior: "instant",
                            });
                        });
                    });
                });
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
