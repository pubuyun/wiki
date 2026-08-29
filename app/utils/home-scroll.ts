import { ScrollTrigger } from "gsap/ScrollTrigger";

export const HOME_SCROLL_REFRESH_START = "home-scroll-refresh-start";
export const HOME_SCROLL_REFRESH_END = "home-scroll-refresh-end";
export const HOME_SCROLL_RESTORE_START = "home-scroll-restore-start";
export const HOME_SCROLL_RESTORE_END = "home-scroll-restore-end";
export const HOME_SCROLL_LOCK_CHANGE = "home-scroll-lock-change";

export type HomeScrollLockChange = {
    locked: boolean;
    direction?: "up" | "down";
};

const HOME_SCROLL_STORAGE_KEY = "greatbay-scie:home-scroll:v1";
const RESTORE_SCROLL_KEYS = new Set([
    "ArrowDown",
    "ArrowUp",
    "End",
    "Home",
    "PageDown",
    "PageUp",
    " ",
]);
let restoreGeneration = 0;
let restoringHomeScroll = false;
let restoreInputLocked = false;
let restoreLockedScrollY = 0;

export type HomeScrollSnapshot = {
    path: string;
    sceneId?: string;
    triggerId?: string;
    progress?: number;
    scrollY: number;
};

function currentSceneId() {
    const viewportMiddle = window.innerHeight / 2;
    const scenes = Array.from(
        document.querySelectorAll<HTMLElement>("section[id]"),
    );

    return [...scenes]
        .reverse()
        .find((scene) => scene.getBoundingClientRect().top <= viewportMiddle)
        ?.id;
}

export function captureHomeScroll(): HomeScrollSnapshot {
    const scrollY = window.scrollY;
    const activeTrigger = ScrollTrigger.getAll()
        .filter(
            (trigger) =>
                typeof trigger.vars.id === "string" &&
                scrollY >= trigger.start - 1 &&
                scrollY <= trigger.end + 1,
        )
        .sort(
            (first, second) =>
                first.end - first.start - (second.end - second.start),
        )[0];

    const triggerScene = (activeTrigger?.trigger as Element | undefined)
        ?.closest<HTMLElement>("section[id]")
        ?.getAttribute("id");

    return {
        path: window.location.pathname,
        sceneId: triggerScene ?? currentSceneId(),
        triggerId: activeTrigger?.vars.id as string | undefined,
        progress: activeTrigger?.progress,
        scrollY,
    };
}

export function saveHomeScroll() {
    try {
        window.sessionStorage.setItem(
            HOME_SCROLL_STORAGE_KEY,
            JSON.stringify(captureHomeScroll()),
        );
    } catch {
        // Browsing can continue without restoration when storage is unavailable.
    }
}

export function readHomeScroll() {
    try {
        const value = window.sessionStorage.getItem(HOME_SCROLL_STORAGE_KEY);
        if (!value) return;

        const snapshot = JSON.parse(value) as HomeScrollSnapshot;
        if (snapshot.path === window.location.pathname) return snapshot;
    } catch {
        return;
    }
}

export function isHomeScrollRestoring() {
    return restoringHomeScroll;
}

function preventRestoreScroll(event: Event) {
    event.preventDefault();
    event.stopImmediatePropagation();
}

function preventRestoreScrollKey(event: KeyboardEvent) {
    if (!RESTORE_SCROLL_KEYS.has(event.key)) return;

    const target = event.target as HTMLElement | null;
    if (target?.closest("input, textarea, select, [contenteditable='true']")) {
        return;
    }

    preventRestoreScroll(event);
}

function clampRestoreScroll() {
    if (
        restoreInputLocked &&
        Math.abs(window.scrollY - restoreLockedScrollY) > 1
    ) {
        window.scrollTo(0, restoreLockedScrollY);
    }
}

function lockRestoreInput() {
    if (restoreInputLocked) return;

    restoreInputLocked = true;
    restoreLockedScrollY = window.scrollY;
    window.addEventListener("wheel", preventRestoreScroll, {
        passive: false,
        capture: true,
    });
    window.addEventListener("touchmove", preventRestoreScroll, {
        passive: false,
        capture: true,
    });
    window.addEventListener("keydown", preventRestoreScrollKey, true);
    window.addEventListener("scroll", clampRestoreScroll, { passive: true });
    window.dispatchEvent(
        new CustomEvent<HomeScrollLockChange>(HOME_SCROLL_LOCK_CHANGE, {
            detail: { locked: true },
        }),
    );
}

function unlockRestoreInput() {
    if (!restoreInputLocked) return;

    restoreInputLocked = false;
    window.removeEventListener("wheel", preventRestoreScroll, true);
    window.removeEventListener("touchmove", preventRestoreScroll, true);
    window.removeEventListener("keydown", preventRestoreScrollKey, true);
    window.removeEventListener("scroll", clampRestoreScroll);
    window.dispatchEvent(
        new CustomEvent<HomeScrollLockChange>(HOME_SCROLL_LOCK_CHANGE, {
            detail: { locked: false },
        }),
    );
}

export function beginHomeScrollRestore() {
    if (restoringHomeScroll) return restoreGeneration;

    restoreGeneration += 1;
    restoringHomeScroll = true;
    lockRestoreInput();
    window.dispatchEvent(new Event(HOME_SCROLL_RESTORE_START));
    return restoreGeneration;
}

export function cancelHomeScrollRestore(generation?: number) {
    if (
        !restoringHomeScroll ||
        (generation !== undefined && generation !== restoreGeneration)
    ) {
        return;
    }

    restoreGeneration += 1;
    restoringHomeScroll = false;
    unlockRestoreInput();
    window.dispatchEvent(new Event(HOME_SCROLL_RESTORE_END));
}

export function restoreHomeScroll(
    snapshot: HomeScrollSnapshot,
    scrollTo: (position: number) => void,
    generation = beginHomeScrollRestore(),
) {
    if (generation !== restoreGeneration || !restoringHomeScroll) return;

    try {
        const trigger = snapshot.triggerId
            ? ScrollTrigger.getById(snapshot.triggerId)
            : undefined;
        const hasTriggerProgress =
            trigger && typeof snapshot.progress === "number";
        const position = hasTriggerProgress
            ? trigger.start + snapshot.progress! * (trigger.end - trigger.start)
            : snapshot.scrollY;

        restoreLockedScrollY = position;
        scrollTo(position);

        if (hasTriggerProgress) {
            trigger.animation?.progress(snapshot.progress!);
        }

        ScrollTrigger.update();
    } finally {
        // Keep programmatic restoration distinguishable from user scrolling
        // until ScrollTrigger has rendered the restored frame.
        window.requestAnimationFrame(() => {
            if (generation !== restoreGeneration) return;
            restoringHomeScroll = false;
            unlockRestoreInput();
            window.dispatchEvent(new Event(HOME_SCROLL_RESTORE_END));
        });
    }
}
