<script setup lang="ts">
import { NavigationMenuList, NavigationMenuRoot } from "radix-vue";
import ColorblindModeToggle from "./NavigationBar/ColorblindModeToggle.vue";
import DarkModeToggle from "./NavigationBar/DarkModeToggle.vue";
import Logo from "./NavigationBar/Logo.vue";
import NavItem from "./NavigationBar/NavItem.vue";

const props = withDefaults(
    defineProps<{
        scrollOpacity?: boolean;
    }>(),
    {
        scrollOpacity: true,
    },
);

const navItems = [
    {
        title: "Project",
        links: [
            { to: "/contribution", label: "Contribution" },
            { to: "/description", label: "Description" },
            { to: "/safety-and-security", label: "Safety" },
        ],
    },
    {
        title: "Wet lab",
        links: [
            { to: "/engineering", label: "Engineering" },
            { to: "/parts", label: "Parts" },
        ],
    },
    {
        title: "iHP",
        links: [
            { to: "/human-practices", label: "iHP" },
            { to: "/education", label: "Education" },
            { to: "/entrepreneurship", label: "Entrepreneurship" },
        ],
    },
    {
        title: "Team",
        links: [
            { to: "/members", label: "Members" },
            { to: "/attributions", label: "Attributions" },
        ],
    },
    {
        title: "Dry Lab",
        links: [
            { to: "/model", label: "Model" },
            { to: "/software", label: "Software" },
            { to: "/viewbinder", label: "Binder Viewer" },
            { to: "/testgraph", label: "Test Graph" },
        ],
    },
];

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

    if (Date.now() < ignoreVisibilityUntil) {
        lastScrollY.value = scrollY;
        return;
    }

    if (scrollY <= hideAfterScrollY) {
        navHidden.value = false;
    } else if (scrollDelta > scrollDirectionThreshold) {
        navHidden.value = true;
    } else if (scrollDelta < -scrollDirectionThreshold) {
        navHidden.value = false;
    }

    lastScrollY.value = scrollY;
}

const opacityStyle = computed(() => ({
    backgroundColor: `color-mix(in srgb, var(--primary-light) ${Math.round(
        navBackgroundOpacity.value * 100,
    )}%, transparent)`,
}));

const navVisibilityClass = computed(() =>
    navHidden.value
        ? "pointer-events-none -translate-y-full"
        : "translate-y-0",
);

const progressVisibilityClass = computed(() =>
    navHidden.value ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100",
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
        <nav
            class="flex items-center justify-between gap-6 overflow-visible bg-primary-light font-righteous transition-transform duration-300 ease-out will-change-transform sm:h-8 lg:h-11 xl:h-14"
            :class="navVisibilityClass"
            :style="props.scrollOpacity ? opacityStyle : undefined"
        >
            <NuxtLink
                to="/"
                class="icon-section flex h-full shrink-0 items-center gap-4"
                aria-label="Go to homepage"
            >
                <Logo />
                <span
                    class="text-primary-deep lg:text-2xl xl:text-4xl"
                    aria-hidden="true"
                    >Expelliodor</span
                >
            </NuxtLink>
            <NavigationMenuList
                class="mr-8 hidden h-full w-1/2 list-none items-center justify-evenly gap-4 p-0 whitespace-nowrap sm:text-base lg:flex lg:text-lg xl:text-xl"
            >
                <NavItem
                    v-for="item in navItems"
                    :key="item.title"
                    :title="item.title"
                    :links="item.links || []"
                />
            </NavigationMenuList>
            <div
                class="h-full flex-1 flex-row items-center justify-end gap-2 sm:flex lg:gap-4 xl:gap-6"
            >
                <ColorblindModeToggle />
                <DarkModeToggle />
                <SearchBar />
            </div>
        </nav>
    </NavigationMenuRoot>
    <!-- <ProgressBar
        :progress="progress"
        class="transition-[transform,opacity] duration-300 ease-out will-change-transform"
        :class="progressVisibilityClass"
        :style="props.scrollOpacity ? opacityStyle : undefined"
    /> -->
</template>
