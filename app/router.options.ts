import type { RouterConfig } from "@nuxt/schema";

function getHashTarget(hash: string) {
    if (!import.meta.client || !hash) return null;

    try {
        return document.getElementById(decodeURIComponent(hash.slice(1)));
    } catch {
        return document.getElementById(hash.slice(1));
    }
}

function waitForHashTarget(hash: string) {
    return new Promise<Element | null>((resolve) => {
        let attempts = 0;

        function findTarget() {
            const target = getHashTarget(hash);

            if (target || attempts >= 30) {
                resolve(target);
                return;
            }

            attempts += 1;
            requestAnimationFrame(findTarget);
        }

        findTarget();
    });
}

export default <RouterConfig>{
    scrollBehavior: async (to, _from, savedPosition) => {
        if (savedPosition) return savedPosition;

        if (to.hash) {
            const target = await waitForHashTarget(to.hash);

            if (target) {
                return {
                    el: target,
                    top: 96,
                    behavior: "smooth",
                };
            }
        }

        return { top: 0 };
    },
};
