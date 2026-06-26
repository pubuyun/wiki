import type { RouterConfig } from "@nuxt/schema";

export default <RouterConfig>{
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        }

        if (to.hash) {
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
