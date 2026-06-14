<script setup lang="ts">
import { NavigationMenuList, NavigationMenuRoot } from "radix-vue";
import Logo from "./NavigationBar/Logo.vue";
import NavItem from "./NavigationBar/NavItem.vue";

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
</script>

<template>
    <NavigationMenuRoot
        as-child
        aria-label="Primary navigation"
        :delay-duration="100"
    >
        <nav
            class="flex items-center justify-between gap-10 overflow-visible bg-corn font-righteous md:h-6 lg:h-12 xl:h-18"
        >
            <NuxtLink
                to="/"
                class="icon-section flex h-full shrink-0 items-center gap-4"
                aria-label="Go to homepage"
            >
                <Logo />
                <span
                    class="text-cblue lg:text-3xl xl:text-5xl"
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
</template>
