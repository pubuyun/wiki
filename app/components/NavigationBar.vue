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
        title: "Model",
        to: "/model",
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
            class="flex h-24 items-center justify-between overflow-visible bg-corn font-nunito"
        >
            <NuxtLink
                to="/"
                class="icon-section flex h-full shrink-0 items-center"
                aria-label="Go to homepage"
            >
                <Logo />
                <span
                    class="ml-8 text-6xl font-black text-cblue"
                    aria-hidden="true"
                    >EXPELLIODOR</span
                >
            </NuxtLink>

            <!-- <SearchBar /> -->
            <NavigationMenuList
                class="mr-8 flex h-full w-1/2 list-none items-center justify-evenly gap-6 p-0 whitespace-nowrap"
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
