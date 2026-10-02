import type { RouterConfig } from "@nuxt/schema";

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
                return new Promise((resolve) => {
                    nuxtApp.hooks.hookOnce("page:loading:end", () => {
                        requestAnimationFrame(() => {
                            if (
                                router.currentRoute.value.fullPath !==
                                to.fullPath
                            ) {
                                resolve(false);
                                return;
                            }
                            const target = document.getElementById(
                                decodeURIComponent(to.hash.slice(1)),
                            );
                            target?.focus({ preventScroll: true });
                            resolve({
                                el: to.hash,
                                top:
                                    getScrollPaddingTop() +
                                    (target
                                        ? Number.parseFloat(
                                              getComputedStyle(target)
                                                  .scrollMarginTop,
                                          ) || 0
                                        : 0),
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
