export const HOME_SCROLL_REFRESH_START = "home-scroll-refresh-start";
export const HOME_SCROLL_REFRESH_END = "home-scroll-refresh-end";
export const HOME_SCROLL_RESTORE_START = "home-scroll-restore-start";
export const HOME_SCROLL_RESTORE_END = "home-scroll-restore-end";
export const HOME_SCROLL_LOCK_CHANGE = "home-scroll-lock-change";

export type HomeScrollLockChange = {
    locked: boolean;
    direction?: "up" | "down";
};
