<script setup lang="ts">
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
        title: "Model",
        to: "model",
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
];
</script>

<template>
    <nav
        class="flex h-24 items-center justify-between overflow-hidden bg-sun font-nunito"
    >
        <NuxtLink to="/" class="icon-section flex h-full shrink-0 items-center">
            <Logo />
            <span class="ml-8 text-6xl font-black text-cblue">EXPELLIODOR</span>
        </NuxtLink>

        <!-- <SearchBar /> -->
        <div class="flex h-full w-1/2 items-center justify-evenly gap-6">
            <template v-for="item in navItems" :key="item.title">
                <NavItem
                    :title="item.title"
                    :links="item.links || []"
                    :to="item.to"
                />
            </template>
        </div>
    </nav>
</template>
