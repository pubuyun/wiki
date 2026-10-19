export function useHashScroll() {
    const router = useRouter();

    function scrollToHash(
        event: MouseEvent,
        hashOrId?: string | null,
        options: { focus?: boolean } = { focus: true },
    ) {
        if (
            event.button !== 0 ||
            event.ctrlKey ||
            event.metaKey ||
            event.shiftKey ||
            event.altKey
        )
            return false;
        const id = normalizeHashId(hashOrId);
        if (!id) return false;

        const target = document.getElementById(id);
        if (!target) return false;

        event.preventDefault();

        // Let the router preserve the current entry's scroll position and
        // perform the anchor scroll once through scrollBehavior.
        void router
            .push({ hash: `#${id}`, query: router.currentRoute.value.query })
            .then(() => {
                if (options.focus && target.isConnected) focusTarget(target);
            });

        return true;
    }

    return { scrollToHash };
}

function normalizeHashId(hashOrId?: string | null) {
    if (!hashOrId) return undefined;

    const value = hashOrId.trim();
    if (!value) return undefined;

    if (value.startsWith("#")) {
        return decodeHash(value.slice(1));
    }

    try {
        const url = new URL(value, window.location.href);
        if (
            url.origin === window.location.origin &&
            url.pathname === window.location.pathname &&
            url.search === window.location.search &&
            url.hash
        ) {
            return decodeHash(url.hash.slice(1));
        }
    } catch {
        return value;
    }

    return value.includes("#") ? undefined : value;
}

function decodeHash(value: string) {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

function focusTarget(target: HTMLElement) {
    const needsTemporaryTabIndex = !target.matches(
        "a[href], button, input, select, textarea, [tabindex]",
    );

    if (needsTemporaryTabIndex) {
        target.setAttribute("tabindex", "-1");
        target.addEventListener(
            "blur",
            () => target.removeAttribute("tabindex"),
            { once: true },
        );
    }

    target.focus({ preventScroll: true });
}
