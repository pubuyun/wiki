<script setup lang="ts">
import NavItem from "./NavigationBar/NavItem.vue";
const navItems = [
    {
        title: "Home",
        to: "/",
    },
    {
        title: "Tutorial",
        to: "tutorial",
    },
    {
        title: "Project",
        links: [
            { to: "contribution", label: "Contribution" },
            { to: "description", label: "Description" },
            { to: "safety-and-security", label: "Safety" },
        ],
    },
    {
        title: "Wet lab",
        links: [
            { to: "engineering", label: "Engineering" },
            { to: "parts", label: "Parts" },
        ],
    },
    {
        title: "Model",
        to: "model",
    },
    {
        title: "iHP",
        links: [
            { to: "human-practices", label: "iHP" },
            { to: "education", label: "Education" },
            { to: "entrepreneurship", label: "Entrepreneurship" },
        ],
    },
    {
        title: "Team",
        links: [
            { to: "members", label: "Members" },
            { to: "attributions", label: "Attributions" },
        ],
    },
];
</script>

<template>
    <nav class="flex justify-between gap-60">
        <NuxtLink to="/" class="icon-section">
            <img src="/logo.jpg" alt="Logo" class="h-10 w-10" />
        </NuxtLink>
        <SearchBar />
        <div class="flex items-center gap-6 pr-10">
            <template v-for="item in navItems" :key="item.title">
                <NavItem
                    v-if="item.links"
                    :title="item.title"
                    :links="item.links"
                />

                <NuxtLink v-else :to="item.to" class="navLink">
                    {{ item.title }}
                </NuxtLink>
            </template>
        </div>
    </nav>
</template>
