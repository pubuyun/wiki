<script setup lang="ts">
import { Icon } from "@iconify/vue";
import {
    AccordionContent,
    AccordionHeader,
    AccordionItem,
    AccordionRoot,
    AccordionTrigger,
    SplitterGroup,
    SplitterPanel,
    SplitterResizeHandle,
} from "reka-ui";
import type { SignLanguageWord } from "~/data/sign-language-challenge";

const props = defineProps<{
    categoryLabel: string;
    words: SignLanguageWord[];
}>();

const assignments = reactive<Record<string, string | undefined>>({});
const correctIds = ref(new Set<string>());
const errorIds = ref(new Set<string>());
const selectedWordId = ref<string>();
const shuffledWords = ref([...props.words]);
const announcement = ref("");
const splitDirection = ref<"horizontal" | "vertical">("vertical");
let desktopQuery: MediaQueryList | undefined;

const wordById = computed(
    () => new Map(props.words.map((word) => [word.id, word])),
);
const assignedWordIds = computed(
    () => new Set(Object.values(assignments).filter(Boolean)),
);
const availableWords = computed(() =>
    shuffledWords.value.filter((word) => !assignedWordIds.value.has(word.id)),
);
const filledCount = computed(() => assignedWordIds.value.size);
const isComplete = computed(() => correctIds.value.size === props.words.length);
const canSubmit = computed(
    () => filledCount.value === props.words.length && !isComplete.value,
);

function shuffleWords() {
    const items = [...props.words];
    for (let index = items.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [items[index], items[swapIndex]] = [items[swapIndex]!, items[index]!];
    }
    shuffledWords.value = items;
}

function selectWord(wordId: string) {
    selectedWordId.value = selectedWordId.value === wordId ? undefined : wordId;
    announcement.value = selectedWordId.value
        ? `${wordById.value.get(wordId)?.label} selected. Choose an answer slot.`
        : "Word selection cleared.";
}

function placeWord(targetId: string, draggedWordId: string) {
    if (correctIds.value.has(targetId)) return;
    const wordId = draggedWordId || selectedWordId.value;
    if (!wordId || !wordById.value.has(wordId)) {
        announcement.value = "Select a word first, then choose an answer slot.";
        return;
    }

    for (const [videoId, assignedWordId] of Object.entries(assignments)) {
        if (assignedWordId === wordId && videoId !== targetId) {
            assignments[videoId] = undefined;
        }
    }

    assignments[targetId] = wordId;
    selectedWordId.value = undefined;
    const nextErrors = new Set(errorIds.value);
    nextErrors.delete(targetId);
    errorIds.value = nextErrors;
    announcement.value = `${wordById.value.get(wordId)?.label} placed in sign ${props.words.findIndex((word) => word.id === targetId) + 1}.`;
}

function removeWord(targetId: string) {
    if (correctIds.value.has(targetId)) return;
    const word = assignments[targetId]
        ? wordById.value.get(assignments[targetId]!)
        : undefined;
    assignments[targetId] = undefined;
    announcement.value = word
        ? `${word.label} returned to the word bank.`
        : "Answer slot is already empty.";
}

function submitAnswers() {
    if (!canSubmit.value) return;

    const nextCorrect = new Set(correctIds.value);
    const nextErrors = new Set<string>();

    for (const word of props.words) {
        if (assignments[word.id] === word.id) {
            nextCorrect.add(word.id);
        } else {
            nextErrors.add(word.id);
            assignments[word.id] = undefined;
        }
    }

    correctIds.value = nextCorrect;
    errorIds.value = nextErrors;
    selectedWordId.value = undefined;

    if (nextCorrect.size === props.words.length) {
        announcement.value = `All ${props.words.length} matches are correct. Challenge complete!`;
    } else {
        announcement.value = `${nextCorrect.size} of ${props.words.length} matches are correct. Correct answers were kept; ${nextErrors.size} words returned to the word bank.`;
    }
}

function resetGame() {
    for (const word of props.words) assignments[word.id] = undefined;
    correctIds.value = new Set();
    errorIds.value = new Set();
    selectedWordId.value = undefined;
    shuffleWords();
    announcement.value = `${props.categoryLabel} challenge restarted.`;
}

function updateSplitDirection() {
    splitDirection.value = desktopQuery?.matches ? "horizontal" : "vertical";
}

onMounted(() => {
    shuffleWords();
    desktopQuery = window.matchMedia("(min-width: 1024px)");
    desktopQuery.addEventListener("change", updateSplitDirection);
    updateSplitDirection();
});

onBeforeUnmount(() =>
    desktopQuery?.removeEventListener("change", updateSplitDirection),
);
</script>

<template>
    <section
        class="h-full min-h-0"
        :aria-label="`${categoryLabel} matching game`"
    >
        <p class="sr-only" aria-live="polite" aria-atomic="true">
            {{ announcement }}
        </p>

        <SplitterGroup
            :key="splitDirection"
            :direction="splitDirection"
            :keyboard-resize-by="3"
            class="h-full min-h-0 overflow-hidden rounded-2xl border border-surface-bright bg-secondary shadow-[8px_8px_0_var(--color-primary)]"
        >
            <SplitterPanel
                :default-size="splitDirection === 'horizontal' ? 68 : 58"
                :min-size="splitDirection === 'horizontal' ? 45 : 40"
            >
                <div class="flex h-full min-h-0 flex-col text-on-secondary">
                    <div
                        class="flex shrink-0 items-center justify-between gap-4 border-b border-outline-variant/35 px-4 py-3 sm:px-5"
                    >
                        <div>
                            <h2
                                class="font-momo-trust-display text-xl text-on-secondary"
                            >
                                Match the signs
                            </h2>
                            <p class="mt-1 text-sm text-on-secondary/70">
                                {{ filledCount }} of {{ words.length }} answer
                                slots filled
                            </p>
                        </div>
                        <span
                            class="rounded-full bg-primary/15 px-3 py-1 text-sm font-semibold text-primary"
                        >
                            {{ correctIds.size }} correct
                        </span>
                    </div>

                    <div class="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
                        <div
                            class="grid grid-cols-[repeat(auto-fit,minmax(min(100%,15rem),1fr))] gap-4"
                        >
                            <SignLanguageChallengeVideoCard
                                v-for="(word, index) in words"
                                :key="word.id"
                                :video-id="word.id"
                                :index="index"
                                :assignment="
                                    assignments[word.id]
                                        ? wordById.get(assignments[word.id]!)
                                        : undefined
                                "
                                :is-correct="correctIds.has(word.id)"
                                :has-error="errorIds.has(word.id)"
                                @place="placeWord(word.id, $event)"
                                @remove="removeWord(word.id)"
                            />
                        </div>
                    </div>
                </div>
            </SplitterPanel>

            <SplitterResizeHandle
                class="group relative shrink-0 bg-surface outline-none focus-visible:ring-3 focus-visible:ring-outline focus-visible:ring-inset"
                :class="splitDirection === 'horizontal' ? 'w-4' : 'h-4'"
                :aria-label="
                    splitDirection === 'horizontal'
                        ? 'Resize video list and word bank'
                        : 'Resize video list and word bank vertically'
                "
            >
                <span
                    class="absolute rounded-full bg-outline-variant transition-colors group-hover:bg-primary"
                    :class="
                        splitDirection === 'horizontal'
                            ? 'inset-y-6 left-1/2 w-1 -translate-x-1/2'
                            : 'inset-x-6 top-1/2 h-1 -translate-y-1/2'
                    "
                    aria-hidden="true"
                />
            </SplitterResizeHandle>

            <SplitterPanel
                :default-size="splitDirection === 'horizontal' ? 32 : 42"
                :min-size="splitDirection === 'horizontal' ? 24 : 32"
            >
                <aside
                    class="flex h-full min-h-0 flex-col bg-surface p-4 text-on-surface sm:p-5"
                    aria-label="Word bank and game controls"
                >
                    <AccordionRoot type="single" collapsible class="shrink-0">
                        <AccordionItem
                            value="instructions"
                            class="overflow-hidden rounded-xl border border-outline-variant/50 bg-surface-bright"
                        >
                            <AccordionHeader>
                                <AccordionTrigger
                                    class="group flex w-full items-center justify-between gap-3 px-4 py-3 text-left font-semibold outline-none hover:bg-primary/10 focus-visible:ring-3 focus-visible:ring-outline focus-visible:ring-inset"
                                >
                                    <span class="flex items-center gap-2">
                                        <Icon
                                            icon="lucide:accessibility"
                                            class="size-5 text-primary"
                                        />
                                        How to play
                                    </span>
                                    <Icon
                                        icon="lucide:chevron-down"
                                        class="size-5 transition-transform group-data-[state=open]:rotate-180"
                                    />
                                </AccordionTrigger>
                            </AccordionHeader>
                            <AccordionContent
                                class="border-t border-outline-variant/35 px-4 py-3 text-sm leading-6 text-on-surface/80"
                            >
                                <p>
                                    Drag a word to a slot, or select a word with
                                    Enter or Space and then activate an empty
                                    slot. Activate a filled slot to return its
                                    word.
                                </p>
                            </AccordionContent>
                        </AccordionItem>
                    </AccordionRoot>

                    <div class="mt-5 min-h-0 flex-1 overflow-y-auto">
                        <div
                            class="mb-3 flex items-center justify-between gap-3"
                        >
                            <h3 class="font-momo-trust-display text-xl">
                                Word bank
                            </h3>
                            <span class="text-sm text-on-surface/65"
                                >{{ availableWords.length }} left</span
                            >
                        </div>
                        <SignLanguageChallengeWordBank
                            :words="availableWords"
                            :selected-word-id="selectedWordId"
                            @select="selectWord"
                        />

                        <div
                            v-if="errorIds.size"
                            class="mt-5 flex gap-2 rounded-xl border border-red-500 bg-red-500/10 p-3 text-sm text-red-800 dark:text-red-200"
                            role="status"
                        >
                            <Icon
                                icon="lucide:circle-alert"
                                class="mt-0.5 size-5 shrink-0"
                            />
                            <p>
                                Incorrect matches were returned. Red answer
                                slots need another try.
                            </p>
                        </div>
                        <div
                            v-else-if="isComplete"
                            class="mt-5 rounded-xl border border-emerald-500 bg-emerald-500/10 p-4 text-center"
                            role="status"
                        >
                            <Icon
                                icon="lucide:trophy"
                                class="mx-auto mb-2 size-8 text-emerald-600 dark:text-emerald-300"
                            />
                            <p class="font-semibold">Challenge complete!</p>
                            <p class="mt-1 text-sm text-on-surface/75">
                                Science becomes stronger when everyone can take
                                part.
                            </p>
                        </div>
                    </div>

                    <div
                        class="mt-4 grid shrink-0 gap-2 border-t border-outline-variant/35 pt-4 sm:grid-cols-[1fr_auto]"
                    >
                        <button
                            type="button"
                            class="rounded-xl bg-primary px-5 py-3 font-semibold text-on-primary transition-opacity outline-none hover:opacity-90 focus-visible:ring-3 focus-visible:ring-outline disabled:cursor-not-allowed disabled:opacity-45"
                            :disabled="!canSubmit"
                            @click="submitAnswers"
                        >
                            {{ isComplete ? "Completed" : "Submit answers" }}
                        </button>
                        <button
                            type="button"
                            class="rounded-xl border border-outline-variant px-4 py-3 font-semibold outline-none hover:bg-surface-bright focus-visible:ring-3 focus-visible:ring-outline"
                            @click="resetGame"
                        >
                            Start over
                        </button>
                        <p
                            v-if="!canSubmit && !isComplete"
                            class="text-center text-xs text-on-surface/65 sm:col-span-2"
                        >
                            Fill every answer slot to submit.
                        </p>
                    </div>
                </aside>
            </SplitterPanel>
        </SplitterGroup>
    </section>
</template>
