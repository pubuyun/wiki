<script setup lang="ts">
import type { ContentCollectionItem } from "@nuxt/content";
const props = defineProps<{
    /** Markdown filename relative to content/, including the .md extension. */
    src?: string;
    title?: string;
    topic?: string;
    interviewee?: string;
    interviewers?: string;
}>();

const stem = computed(() =>
    (props.src ?? "").replace(/^\/?(?:content\/)?/, "").replace(/\.md$/, ""),
);
const {
    data: interviewMetadata,
    status,
    error,
} = await useAsyncData(
    computed(() => `interview-metadata-${stem.value}`),
    () => {
        if (!stem.value) return Promise.resolve(null);
        if (import.meta.server || !import.meta.env.WIKI_STATIC_CONTENT) {
            return queryCollection("content")
                .where("stem", "=", stem.value)
                .select("stem", "path", "title", "meta")
                .first();
        }
        return $fetch<Record<string, ContentCollectionItem>>(
            `${useRuntimeConfig().app.baseURL}api/interview-metadata.json`,
        ).then((items) => items[stem.value] ?? null);
    },
);

const interview = shallowRef<ContentCollectionItem | null>(null);
const transcriptStatus = ref<"idle" | "pending" | "success" | "error">("idle");
const transcriptError = ref<unknown>(null);
let transcriptPromise: Promise<Record<string, ContentCollectionItem>> | null =
    null;

async function loadTranscript() {
    if (interview.value || transcriptStatus.value === "pending") return;
    transcriptStatus.value = "pending";
    transcriptError.value = null;
    try {
        if (import.meta.env.WIKI_STATIC_CONTENT) {
            transcriptPromise ??= $fetch<Record<string, ContentCollectionItem>>(
                `${useRuntimeConfig().app.baseURL}api/interview-scripts.json`,
            );
            interview.value = (await transcriptPromise)[stem.value] ?? null;
        } else {
            interview.value = await queryCollection("content")
                .where("stem", "=", stem.value)
                .first();
        }
        transcriptStatus.value = "success";
    } catch (loadError) {
        transcriptError.value = loadError;
        transcriptStatus.value = "error";
    }
}

function onToggle(event: Event) {
    if ((event.target as HTMLDetailsElement).open) void loadTranscript();
}

const metadata = computed(() => {
    const meta = interviewMetadata.value?.meta;
    const text = (key: string) =>
        typeof meta?.[key] === "string" ? meta[key] : "";
    return {
        topic: props.topic ?? text("topic"),
        interviewee: props.interviewee ?? text("interviewee"),
        interviewers: props.interviewers ?? text("interviewers"),
    };
});
</script>

<template>
    <section
        class="my-6 min-w-0 overflow-hidden rounded-xl border-2 border-outline bg-surface text-on-surface shadow-sm"
        :aria-label="
            props.title || interviewMetadata?.title || 'Interview transcript'
        "
        :aria-busy="status === 'pending'"
    >
        <template v-if="interviewMetadata || $slots.default">
            <header
                class="grid gap-5 bg-secondary px-5 py-5 text-on-secondary sm:grid-cols-[minmax(0,1fr)_minmax(10rem,0.45fr)] sm:gap-8 sm:px-6 sm:py-6"
            >
                <div class="min-w-0 space-y-3">
                    <span
                        class="inline-flex rounded-md bg-accent px-2.5 py-1 font-belanosima text-xs tracking-wide text-on-accent"
                        >Interview</span
                    >
                    <p
                        class="m-0 font-belanosima text-2xl leading-tight break-words sm:text-3xl"
                    >
                        {{ props.title || interviewMetadata?.title }}
                    </p>
                    <p
                        v-if="metadata.topic"
                        class="m-0 max-w-prose text-sm leading-relaxed text-pretty"
                    >
                        {{ metadata.topic }}
                    </p>
                </div>
                <dl
                    v-if="metadata.interviewee || metadata.interviewers"
                    class="m-0 grid content-start gap-4 border-t border-outline/25 pt-4 text-sm sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6"
                >
                    <div v-if="metadata.interviewee" class="min-w-0">
                        <dt
                            class="mb-1 flex items-center gap-2 font-belanosima text-xs tracking-wide"
                        >
                            <span
                                aria-hidden="true"
                                class="size-1.5 shrink-0 rounded-full bg-accent"
                            ></span
                            >Interviewee
                        </dt>
                        <dd class="m-0 text-base font-semibold break-words">
                            {{ metadata.interviewee }}
                        </dd>
                    </div>
                    <div v-if="metadata.interviewers" class="min-w-0">
                        <dt
                            class="mb-1 flex items-center gap-2 font-belanosima text-xs tracking-wide"
                        >
                            <span
                                aria-hidden="true"
                                class="size-1.5 shrink-0 rounded-full bg-accent"
                            ></span
                            >Interviewers
                        </dt>
                        <dd class="m-0 text-base font-semibold break-words">
                            {{ metadata.interviewers }}
                        </dd>
                    </div>
                </dl>
            </header>
            <details
                :key="stem"
                class="interview-disclosure border-t-2 border-outline"
                @toggle="onToggle"
            >
                <summary
                    class="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 bg-secondary px-5 py-3 font-belanosima text-sm text-on-secondary transition-colors hover:bg-surface-bright hover:text-on-surface focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-outline sm:px-6"
                >
                    <span class="interview-expand">Expand transcript</span>
                    <span class="interview-collapse">Collapse transcript</span>
                    <svg
                        viewBox="0 0 20 20"
                        class="interview-chevron size-4 shrink-0 fill-current"
                        aria-hidden="true"
                    >
                        <path
                            d="M5.3 7.3a1 1 0 0 1 1.4 0L10 10.6l3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4Z"
                        />
                    </svg>
                </summary>
                <div class="border-t-2 border-outline px-4 py-4 sm:px-6">
                    <div
                        v-if="$slots.default"
                        class="interview-transcript min-w-0 break-words"
                    >
                        <slot />
                    </div>
                    <p v-else-if="transcriptStatus === 'pending'" role="status">
                        Loading interview…
                    </p>
                    <p v-else-if="transcriptError" role="alert">
                        Unable to load this interview.
                    </p>
                    <ContentRenderer
                        v-else-if="interview"
                        :value="interview"
                        class="interview-transcript min-w-0 break-words"
                    />
                </div>
            </details>
        </template>
        <p v-else class="m-0 px-4 py-4 text-sm" role="status">
            {{
                status === "pending"
                    ? "Loading interview…"
                    : error
                      ? "Unable to load this interview."
                      : "Interview transcript not found."
            }}
        </p>
    </section>
</template>

<style scoped>
summary::-webkit-details-marker {
    display: none;
}

.interview-collapse,
.interview-disclosure[open] > summary .interview-expand {
    display: none;
}

.interview-disclosure[open] > summary .interview-collapse {
    display: inline;
}

.interview-disclosure[open] > summary .interview-chevron {
    transform: rotate(180deg);
}

.interview-transcript :deep(> p) {
    margin: 0 0 1.25rem;
    padding-inline-start: 1rem;
    border-inline-start: 2px solid var(--outline);
}

.interview-transcript :deep(> p:last-child) {
    margin-bottom: 0;
}

.interview-transcript :deep(> p > strong:first-child) {
    display: block;
    margin-bottom: 0.25rem;
    font-family: var(--font-belanosima);
    color: var(--on-surface);
}
</style>
