export function useHashScroll() {
    function scrollToHash(
        event: MouseEvent,
        hashOrId?: string | null,
        options: { focus?: boolean } = { focus: true },
    ) {
        const id = normalizeHashId(hashOrId);
        if (!id) return false;

        const target = document.getElementById(id);
        if (!target) return false;

        event.preventDefault();

        const oldUrl = window.location.href;
        const hash = `#${encodeURIComponent(id)}`;
        const newUrl = `${window.location.pathname}${window.location.search}${hash}`;
        window.history.pushState(null, "", newUrl);
        window.dispatchEvent(
            new CustomEvent("wiki:hash-scroll", { detail: { id } }),
        );
        scrollToTarget(target);
        if (options.focus) {
            focusTarget(target);
        }
        window.dispatchEvent(
            new HashChangeEvent("hashchange", {
                oldURL: oldUrl,
                newURL: window.location.href,
            }),
        );

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

function scrollToTarget(target: HTMLElement) {
    const scrollPaddingTop =
        Number.parseFloat(
            getComputedStyle(document.documentElement).scrollPaddingTop,
        ) || 0;
    const scrollMarginTop =
        Number.parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
    const top =
        target.getBoundingClientRect().top +
        window.scrollY -
        scrollPaddingTop -
        scrollMarginTop;

    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)")
        .matches
        ? "auto"
        : "smooth";

    window.scrollTo({ top, behavior });
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
