<template>
    <div class="dropdown">
        <!-- 触发区域 -->
        <span class="dropdown-trigger">
            {{ title }}
            <span class="arrow">▼</span>
        </span>

        <!-- 下拉菜单 -->
        <div class="dropdown-menu">
            <NuxtLink
                v-for="link in links"
                :key="link.to"
                :to="link.to"
                class="dropdown-link"
            >
                {{ link.label }}
            </NuxtLink>
        </div>
    </div>
</template>

<script setup lang="ts">
interface DropdownLink {
    to: string;
    label: string;
}

defineProps<{
    title: string;
    links: DropdownLink[];
}>();
</script>

<style scoped>
.dropdown {
    position: relative;
    display: inline-block;
}

/* 触发文字样式 */
.dropdown-trigger {
    cursor: default;
    user-select: none;
    padding: 0.5rem 0.25rem;
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
}

.arrow {
    transition: transform 0.2s;
}
.dropdown:hover .arrow {
    transform: rotate(180deg);
}

.dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    min-width: 10rem;
    margin-top: 0.25rem;
    padding: 0.25rem 0;
    background-color: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.375rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

    opacity: 0;
    visibility: hidden;
    transform: translateY(-0.25rem);
    transition:
        opacity 0.15s,
        visibility 0.15s,
        transform 0.15s;
}

.dropdown:hover .dropdown-menu {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
}

.dropdown-link {
    display: block;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    color: #374151;
    text-decoration: none;
}

.dropdown-link:hover {
    background-color: #f3f4f6;
}
</style>
