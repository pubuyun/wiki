import type { InjectionKey } from "vue";

export type HomeScrollOptions = {
    duration?: number;
    onComplete?: () => void;
};

export type HomeScrollController = {
    scrollTo: (position: number, options?: HomeScrollOptions) => void;
    cancel: () => void;
};

export const HOME_SCROLL_CONTROLLER: InjectionKey<HomeScrollController> =
    Symbol("home-scroll-controller");
