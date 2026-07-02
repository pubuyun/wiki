<script setup lang="ts">
import { NavigationMenuList, NavigationMenuRoot } from "reka-ui";
import BrandIcon from "./BrandIcon.vue";
import ColorblindModeToggle from "./NavigationBar/ColorblindModeToggle.vue";
import DarkModeToggle from "./NavigationBar/DarkModeToggle.vue";
import NavItem from "./NavigationBar/NavItem.vue";
import PhoneNavigationDialog from "./PhoneNavigationDialog.vue";
import { siteNavGroups } from "~/utils/site-navigation";

const props = withDefaults(
    defineProps<{
        scrollOpacity?: boolean;
    }>(),
    {
        scrollOpacity: false,
    },
);

const initialOpacity = 0.7;
const navBackgroundOpacity = ref(initialOpacity);
const navHidden = ref(false);
const lastScrollY = ref(0);
const scrollDirectionThreshold = 6;
const hideAfterScrollY = 80;
const ignoreHashScrollDuration = 2400;
let ignoreVisibilityUntil = 0;

function updateNavBackgroundOpacity() {
    if (!props.scrollOpacity) {
        return;
    }

    const fadeDistance = window.innerHeight * 0.7;
    const scrollProgress =
        fadeDistance > 0 ? Math.min(window.scrollY / fadeDistance, 1) : 1;

    navBackgroundOpacity.value =
        initialOpacity + scrollProgress * (1 - initialOpacity);
}

function updateNavVisibility() {
    const scrollY = Math.max(window.scrollY, 0);
    const scrollDelta = scrollY - lastScrollY.value;

    if (scrollY <= hideAfterScrollY) {
        navHidden.value = false;
        lastScrollY.value = scrollY;
        return;
    }

    if (Date.now() < ignoreVisibilityUntil) {
        lastScrollY.value = scrollY;
        return;
    }

    if (scrollDelta > scrollDirectionThreshold) {
        navHidden.value = true;
    } else if (scrollDelta < -scrollDirectionThreshold) {
        navHidden.value = false;
    }

    lastScrollY.value = scrollY;
}

const opacityStyle = computed(() => ({
    backgroundColor: `color-mix(in srgb, var(--navigation-bar-bg) ${Math.round(
        navBackgroundOpacity.value * 100,
    )}%, transparent)`,
}));

const navVisibilityClass = computed(() =>
    navHidden.value ? "pointer-events-none -translate-y-full" : "translate-y-0",
);

const progressVisibilityClass = computed(() =>
    navHidden.value
        ? "-translate-y-full opacity-0"
        : "translate-y-0 opacity-100",
);

function updateScrollState() {
    updateNavBackgroundOpacity();
    updateNavVisibility();
    updateProgress();
}

function ignoreHashScrollVisibilityChange() {
    ignoreVisibilityUntil = Date.now() + ignoreHashScrollDuration;
    lastScrollY.value = Math.max(window.scrollY, 0);
}

onMounted(() => {
    lastScrollY.value = Math.max(window.scrollY, 0);
    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener(
        "wiki:hash-scroll",
        ignoreHashScrollVisibilityChange,
    );
});

onUnmounted(() => {
    window.removeEventListener("scroll", updateScrollState);
    window.removeEventListener(
        "wiki:hash-scroll",
        ignoreHashScrollVisibilityChange,
    );
});

const progress = ref(0);
function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
    progress.value = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
}
</script>

<template>
    <NavigationMenuRoot
        as-child
        aria-label="Primary navigation"
        :delay-duration="100"
        >
    
        <div
            class="flex h-12 items-center justify-between gap-3 overflow-visible bg-[var(--navigation-bar-bg)] [--navigation-bar-bg:var(--surface-nav)] px-3 font-righteous transition-transform duration-300 ease-out will-change-transform sm:h-10 sm:gap-4 sm:px-4 lg:h-11 lg:gap-6 xl:h-14"
            :class="navVisibilityClass"
            :style="props.scrollOpacity ? opacityStyle : undefined"
        >
            <PhoneNavigationDialog />
            <NuxtLink
                to="/"
                class="icon-section flex h-full shrink-0 items-center gap-4"
                aria-label="Go to homepage"
            >
                <BrandIcon />
                <span
                    class="text-lg text-accent-warm sm:text-base lg:text-2xl xl:text-3xl"
                    aria-hidden="true"
                    >Expelliodor</span
                >
            </NuxtLink>
            <NavigationMenuList
               class="mr-8 hidden h-full w-1/2 list-none items-center justify-evenly gap-4 p-0 whitespace-nowrap"
            >
                <NavItem
                    v-for="item in siteNavGroups"
                    :key="item.title"
                    :title="item.title"
                    :links="item.links || []"
                />
            </NavigationMenuList>
            <div
                class="flex h-full flex-1 flex-row items-center justify-end gap-2 lg:gap-4 xl:gap-6"
            >
                <ColorblindModeToggle />
                <DarkModeToggle />
                <SearchBar /> 
               <!-- <ProgressBar 
  :progress="progress"
  class="sr-only transition-[transform,opacity] duration-300 ease-out will-change-transform"
  :class="progressVisibilityClass"
  :style="props.scrollOpacity ? opacityStyle : undefined"
/> -->
            </div>
  
</NavigationMenuRoot>
</template>
