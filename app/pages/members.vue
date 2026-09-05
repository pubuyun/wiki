<script setup lang="ts">
useSeoMeta({ title: "Members" });
definePageMeta({
    layout: "static",
});
</script>

<template>
    <section class="members-page" aria-label="Members">
        <MembersForest />
        <div class="members-content">
            <!-- Future member content stays above the decorative forest. -->
        </div>
    </section>
</template>

<style scoped>
.members-page {
    position: relative;
    isolation: isolate;
    min-height: 100svh;
}

.members-content {
    position: relative;
    min-height: 100svh;
}
</style>
