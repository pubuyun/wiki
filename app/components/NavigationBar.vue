<script setup lang="ts">
import { NavigationMenuList, NavigationMenuRoot } from "radix-vue";
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
        title: "Home",
        to: "/",
    },
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
            { to: "/testviewer", label: "Test Viewer" },
            { to: "/testgraph", label: "Test Graph" },
        ],
    },
];

const initialOpacity = 0.7;
const navBackgroundOpacity = ref(initialOpacity);

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

const opacityStyle = computed(() => ({
    backgroundColor: `color-mix(in srgb, var(--primary-light) ${Math.round(
        navBackgroundOpacity.value * 100,
    )}%, transparent)`,
}));

onMounted(() => {
    if (props.scrollOpacity) {
        updateNavBackgroundOpacity();
        window.addEventListener("scroll", updateNavBackgroundOpacity, {
            passive: true,
        });
    }
});

onUnmounted(() => {
    if (props.scrollOpacity) {
        window.removeEventListener("scroll", updateNavBackgroundOpacity);
    }
});

const progress = ref(0);
function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
    progress.value = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
}
onMounted(() => {
    window.addEventListener("scroll", updateProgress);
});
onUnmounted(() => {
    window.removeEventListener("scroll", updateProgress);
});
</script>

<template>
    <NavigationMenuRoot
        as-child
        aria-label="Primary navigation"
        :delay-duration="100"
    >
        <nav
            class="flex items-center justify-between gap-10 overflow-visible bg-primary-light font-righteous md:h-8 lg:h-11 xl:h-14"
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

            <SearchBar />
            <NavigationMenuList
                class="mr-8 flex h-full w-1/2 list-none items-center justify-evenly gap-4 p-0 whitespace-nowrap md:text-base lg:text-lg xl:text-xl"
            >
                <NavItem
                    v-for="item in navItems"
                    :key="item.title"
                    :title="item.title"
                    :links="item.links || []"
                    :to="item.to"
                />
            </NavigationMenuList>
        </nav>
    </NavigationMenuRoot>
    <ProgressBar
        :progress="progress"
        :style="props.scrollOpacity ? opacityStyle : undefined"
    />
</template>
