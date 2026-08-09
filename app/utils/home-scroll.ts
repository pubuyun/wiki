import { ScrollTrigger } from "gsap/ScrollTrigger";

export const HOME_SCROLL_REFRESH_START = "home-scroll-refresh-start";
export const HOME_SCROLL_REFRESH_END = "home-scroll-refresh-end";

const HOME_SCROLL_STORAGE_KEY = "greatbay-scie:home-scroll:v1";

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

export function restoreHomeScroll(
    snapshot: HomeScrollSnapshot,
    scrollTo: (position: number) => void,
) {
    const trigger = snapshot.triggerId
        ? ScrollTrigger.getById(snapshot.triggerId)
        : undefined;
    const hasTriggerProgress = trigger && typeof snapshot.progress === "number";
    const position = hasTriggerProgress
        ? trigger.start + snapshot.progress! * (trigger.end - trigger.start)
        : snapshot.scrollY;

    scrollTo(position);

    if (hasTriggerProgress) {
        trigger.animation?.progress(snapshot.progress!);
    }

    ScrollTrigger.update();
}
