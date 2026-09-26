<script setup lang="ts">
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from "reka-ui";
import { SIGN_LANGUAGE_CATEGORIES } from "~/data/sign-language-challenge";

definePageMeta({ layout: "default" });

useSeoMeta({
    title: "ASL Biology Challenge",
    description:
        "Match animated American Sign Language signs with biology vocabulary in three accessible challenges.",
});

const activeCategory = ref(SIGN_LANGUAGE_CATEGORIES[0]!.id);
const interfaceElement = ref<HTMLElement>();
const isScrollSnapActive = ref(false);
let scrollFrame: number | undefined;

function updateScrollSnap() {
    scrollFrame = undefined;
    const rect = interfaceElement.value?.getBoundingClientRect();
    if (!rect || rect.height <= 0) return;

    const visibleHeight = Math.max(
        0,
        Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0),
    );
    isScrollSnapActive.value = visibleHeight / rect.height >= 0.7;
}

function scheduleScrollSnapUpdate() {
    if (scrollFrame !== undefined) return;
    scrollFrame = requestAnimationFrame(updateScrollSnap);
}

onMounted(() => {
    window.addEventListener("scroll", scheduleScrollSnapUpdate, {
        passive: true,
    });
    window.addEventListener("resize", scheduleScrollSnapUpdate, {
        passive: true,
    });
    scheduleScrollSnapUpdate();
});

onBeforeUnmount(() => {
    window.removeEventListener("scroll", scheduleScrollSnapUpdate);
    window.removeEventListener("resize", scheduleScrollSnapUpdate);
    if (scrollFrame !== undefined) cancelAnimationFrame(scrollFrame);
});
</script>

<template>
    <div
        class="sign-language-challenge-page min-h-screen bg-surface px-4 pt-[calc(var(--sign-game-navigation-height)+1rem)] pb-12 text-on-surface sm:px-6"
    >
        <div class="mx-auto max-w-[100rem]">
            <div
                ref="interfaceElement"
                class="sign-language-challenge-interface h-[calc(100dvh-var(--sign-game-navigation-height)-2rem)] max-h-[calc(100dvh-var(--sign-game-navigation-height)-2rem)] min-h-0"
                :class="{
                    'sign-language-challenge-interface--snap-active':
                        isScrollSnapActive,
                }"
            >
                <TabsRoot
                    v-model="activeCategory"
                    class="flex h-full min-h-0 min-w-0 flex-col"
                >
                    <TabsList
                        class="mb-3 grid shrink-0 grid-cols-3 gap-1 rounded-2xl bg-surface-elevated p-1.5 font-momo-trust-display"
                        aria-label="Sign language challenge categories"
                    >
                        <TabsTrigger
                            v-for="category in SIGN_LANGUAGE_CATEGORIES"
                            :key="category.id"
                            :value="category.id"
                            class="min-w-0 rounded-xl px-2 py-2.5 text-sm text-primary transition-colors outline-none hover:bg-primary/15 focus-visible:ring-3 focus-visible:ring-outline data-[state=active]:bg-primary data-[state=active]:text-on-primary sm:px-4 sm:text-base lg:text-lg"
                        >
                            <span class="hidden sm:inline">{{
                                category.label
                            }}</span>
                            <span class="sm:hidden">{{
                                category.shortLabel
                            }}</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent
                        v-for="category in SIGN_LANGUAGE_CATEGORIES"
                        :key="category.id"
                        :value="category.id"
                        force-mount
                        class="min-h-0 flex-1 outline-none data-[state=inactive]:hidden"
                    >
                        <SignLanguageChallengeGame
                            :category-label="category.label"
                            :words="category.words"
                        />
                    </TabsContent>
                </TabsRoot>
            </div>

            <p
                class="mx-auto mt-8 max-w-3xl text-center text-sm leading-6 text-on-surface/70"
            >
                The signs in this activity follow references from
                <a
                    href="https://aslcore.org/biology/entries/"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="font-semibold text-primary underline decoration-2 underline-offset-2 outline-none hover:no-underline focus-visible:ring-3 focus-visible:ring-outline"
                    >ASLCORE's biology collection</a
                >. Explore the collection for more signs. Animations are
                presented as a learning challenge, not as a substitute for
                learning from Deaf signers and educators.
            </p>
        </div>
    </div>
</template>

<style scoped>
:global(html:has(.sign-language-challenge-interface)) {
    --sign-game-navigation-height: 3rem;
    scroll-padding-block-start: var(--sign-game-navigation-height);
    scroll-snap-type: y proximity;
}

.sign-language-challenge-interface--snap-active {
    scroll-snap-align: center;
}

@media (width >= 40rem) {
    :global(html:has(.sign-language-challenge-interface)) {
        --sign-game-navigation-height: 2.5rem;
    }
}

@media (width >= 64rem) {
    :global(html:has(.sign-language-challenge-interface)) {
        --sign-game-navigation-height: 2.75rem;
    }
}

@media (width >= 80rem) {
    :global(html:has(.sign-language-challenge-interface)) {
        --sign-game-navigation-height: 3.5rem;
    }
}
</style>
