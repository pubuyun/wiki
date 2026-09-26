<script setup lang="ts">
import { Icon } from "@iconify/vue";
import type { SignLanguageWord } from "~/data/sign-language-challenge";

defineProps<{
    words: SignLanguageWord[];
    selectedWordId?: string;
}>();

const emit = defineEmits<{
    select: [wordId: string];
}>();

function onDragStart(event: DragEvent, wordId: string) {
    if (!event.dataTransfer) return;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", wordId);
    emit("select", wordId);
}
</script>

<template>
    <div>
        <ul
            v-if="words.length"
            class="flex flex-wrap gap-2"
            aria-label="Available words"
        >
            <li v-for="word in words" :key="word.id">
                <button
                    type="button"
                    draggable="true"
                    class="rounded-full border border-primary px-3 py-2 text-sm font-semibold transition-colors outline-none hover:bg-primary/15 focus-visible:ring-3 focus-visible:ring-outline"
                    :class="
                        selectedWordId === word.id
                            ? 'bg-primary text-on-primary'
                            : 'bg-surface-bright text-on-surface'
                    "
                    :aria-pressed="selectedWordId === word.id"
                    :aria-label="`${word.label}. ${selectedWordId === word.id ? 'Selected' : 'Press to select, then choose an empty answer slot'}.`"
                    @click="emit('select', word.id)"
                    @dragstart="onDragStart($event, word.id)"
                >
                    {{ word.label }}
                </button>
            </li>
        </ul>
        <div
            v-else
            class="flex items-center gap-2 rounded-xl bg-emerald-500/10 p-3 text-sm text-on-surface"
        >
            <Icon
                icon="lucide:circle-check"
                class="size-5 text-emerald-600 dark:text-emerald-300"
            />
            Every available word has been placed.
        </div>
    </div>
</template>
