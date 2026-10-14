<template>
    <span
        :id="`fnref-${id}`"
        tabindex="-1"
        class="scroll-mt-24 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-outline"
    >
        <slot mdc-unwrap="p" />
    </span>

    <NuxtLink
        v-for="citation in returnLinks"
        :key="citation.to"
        :to="citation.to"
        class="ml-2 inline-flex rounded-sm align-baseline font-bold no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-outline"
        :class="
            isActiveCitation(citation.to)
                ? 'bg-primary p-1 text-on-primary ring-2 ring-outline ring-offset-2 ring-offset-secondary'
                : 'text-on-secondary hover:text-primary'
        "
        :title="`Return to ${citation.label}`"
        :aria-label="`Back to reference ${id} in ${citation.label}`"
        :aria-current="isActiveCitation(citation.to) ? 'location' : undefined"
        @click="scrollToHash($event, citation.to)"
    >
        <Icon
            icon="mingcute:back-fill"
            class="h-4 w-4 align-middle"
            aria-hidden="true"
        />
    </NuxtLink>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
const props = defineProps({
    id: {
        type: String,
        required: true,
    },
});
const route = useRoute();
const hasMounted = ref(false);
const referenceHash = computed(() => `#fnref-${encodeURIComponent(props.id)}`);
const isSelectedReference = computed(
    () =>
        route.hash === referenceHash.value ||
        route.fullPath.endsWith(referenceHash.value),
);
const { scrollToHash } = useHashScroll();
const { citationLink, citationLinks } = await useCategoryReferences();
const activeCitationLink = computed(() => citationLink(props.id));
const returnLinks = computed(() => {
    const links = citationLinks(props.id);
    return links.length
        ? links
        : [{ to: citationLink(props.id), label: "the text" }];
});

function isActiveCitation(to: string) {
    return (
        hasMounted.value &&
        isSelectedReference.value &&
        to === activeCitationLink.value
    );
}

onMounted(() => {
    hasMounted.value = true;
});
</script>
