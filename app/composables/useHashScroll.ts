export function useHashScroll() {
    const router = useRouter();

    function scrollToHash(event: MouseEvent, hashOrId?: string | null) {
        if (
            event.button !== 0 ||
            event.ctrlKey ||
            event.metaKey ||
            event.shiftKey ||
            event.altKey
        )
            return false;
        const destination = resolveHashLocation(hashOrId);
        if (!destination) return false;

        const target = document.getElementById(destination.hash.slice(1));
        if (!target) return false;

        // NuxtLink/RouterLink runs its own navigation handler before fallthrough
        // click listeners. Do not start a second, competing navigation.
        if (event.defaultPrevented) return true;
        event.preventDefault();

        // Plain anchors use the same destination and scrollBehavior as NuxtLink.
        // Keep the destination's query, including a reference's citation source.
        void router.push(destination.fullPath);

        return true;
    }

    function resolveHashLocation(hashOrId?: string | null) {
        const value = hashOrId?.trim();
        if (!value) return undefined;

        if (!value.includes("#") || value.startsWith("#")) {
            const id = decodeHash(value.replace(/^#/, ""));
            if (!id) return undefined;
            return router.resolve({
                hash: `#${id}`,
                query: router.currentRoute.value.query,
            });
        }

        let url: URL;
        try {
            url = new URL(value, window.location.href);
        } catch {
            return undefined;
        }
        if (
            url.origin !== window.location.origin ||
            url.pathname !== window.location.pathname ||
            !url.hash
        )
            return undefined;

        return router.resolve(
            `${router.currentRoute.value.path}${url.search}${url.hash}`,
        );
    }

    return { scrollToHash };
}

function decodeHash(value: string) {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}
