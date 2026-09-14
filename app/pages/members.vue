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
            <MembersArcade />
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
    z-index: 1;
    min-height: 100svh;
}
</style>
