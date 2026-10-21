export function focusHashTarget(target: HTMLElement) {
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

export function waitForHashTarget(
    hash: string,
    isCurrent: () => boolean,
    timeout = 5000,
): Promise<HTMLElement | null> {
    let id: string;
    try {
        id = decodeURIComponent(hash.slice(1));
    } catch {
        id = hash.slice(1);
    }

    return new Promise((resolve) => {
        const observer = new MutationObserver(check);
        const timer = window.setTimeout(() => finish(null), timeout);

        function finish(target: HTMLElement | null) {
            observer.disconnect();
            window.clearTimeout(timer);
            resolve(target);
        }

        function check() {
            if (!isCurrent()) {
                finish(null);
                return;
            }
            const target = document.getElementById(id);
            if (target) finish(target);
        }

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["id"],
        });
        check();
    });
}
