<script setup lang="ts">
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { onMounted, onUnmounted, ref } from "vue";
import {
    HOME_CHAPTERS,
    homeChapterActivationLabel,
} from "~/utils/home-chapters";

gsap.registerPlugin(ScrollTrigger);

const voices = [
    {
        side: "experience",
        label: "Those living with it",
        messages: [
            "It's a medical condition, not a personality flaw.",
            "You wouldn't mock someone for having a disease, so why mock this?",
            "I can't help it.",
            "I never chose to smell this way",
            "I shower every day, but it never seems to be enough for some people.",
        ],
    },
    {
        side: "prejudice",
        label: "The prejudice they face",
        messages: [
            "Have some basic hygiene.",
            "Do they ever shower? Seriously",
            "It smells like rotten tomatoes.",
            "it's choking me to death.",
            "Get some BOTOX injections plz",
            "It's just laziness, plain and simple.",
            "If they actually cared, they'd fix it.",
            "I feel bad saying it, but I'd rather not be close to them.",
        ],
    },
] as const;

const scene = ref<HTMLElement | null>(null);
const isSceneActive = ref(false);
const messagesPaused = ref(false);
let media: gsap.MatchMedia | undefined;

onMounted(() => {
    if (!scene.value) return;
    media = gsap.matchMedia();
    media.add(
        {
            reduceMotion: "(prefers-reduced-motion: reduce)",
            allowMotion: "(prefers-reduced-motion: no-preference)",
        },
        (context) => {
            // Reduced motion shows all messages as static lists, without pinning.
            if (context.conditions?.reduceMotion) return;

            const timeline = gsap.timeline({
                defaults: { ease: "power3.out" },
                scrollTrigger: {
                    id: "east-asia-awareness-story",
                    trigger: scene.value,
                    start: "top top",
                    end: "+=180%",
                    pin: true,
                    scrub: 0.7,
                    onToggle: (self) => {
                        isSceneActive.value = self.isActive;
                    },
                },
            });
            timeline
                .addLabel(
                    homeChapterActivationLabel(HOME_CHAPTERS.eastAsiaAwareness),
                    0,
                )
                .from(
                    ".awareness-scene__copy",
                    { autoAlpha: 0, y: 30, duration: 0.6 },
                    0,
                )
                .from(
                    ".awareness-scene__dialogue",
                    { autoAlpha: 0, y: 40, duration: 0.65 },
                    0.2,
                )
                .addLabel(HOME_CHAPTERS.eastAsiaAwareness)
                .to({}, { duration: 0.6 });

            return () => {
                isSceneActive.value = false;
            };
        },
        scene.value,
    );
});
onUnmounted(() => media?.revert());
</script>

<template>
    <section
        id="east-asia-awareness"
        ref="scene"
        class="awareness-scene"
        :class="{
            'awareness-scene--flowing': isSceneActive && !messagesPaused,
        }"
        :data-home-chapter="HOME_CHAPTERS.eastAsiaAwareness"
        aria-labelledby="awareness-title"
    >
        <h2 id="awareness-title" class="sr-only">
            Understanding and awareness in East Asia
        </h2>
        <div class="awareness-scene__stage">
            <p class="awareness-scene__copy">
                In East Asia, fewer people face this condition, but low
                awareness often fuels greater
                <strong class="awareness-scene__misunderstanding"
                    >misunderstanding</strong
                >
                and
                <strong class="awareness-scene__discrimination"
                    >discrimination</strong
                >.
            </p>

            <div class="awareness-scene__dialogue">
                <div class="awareness-scene__dialogue-header">
                    <h3
                        :id="`awareness-voice-${voices[0].side}`"
                        class="awareness-scene__voice-label awareness-scene__voice-label--experience"
                    >
                        {{ voices[0].label }}
                    </h3>
                    <button
                        type="button"
                        class="awareness-scene__pause"
                        :aria-label="
                            messagesPaused
                                ? 'Resume messages'
                                : 'Pause messages'
                        "
                        :title="
                            messagesPaused
                                ? 'Resume messages'
                                : 'Pause messages'
                        "
                        :aria-pressed="messagesPaused"
                        aria-controls="awareness-messages"
                        @click="messagesPaused = !messagesPaused"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            aria-hidden="true"
                        >
                            <path v-if="messagesPaused" d="m9 5 10 7-10 7z" />
                            <path v-else d="M8 5v14M16 5v14" />
                        </svg>
                    </button>
                    <h3
                        :id="`awareness-voice-${voices[1].side}`"
                        class="awareness-scene__voice-label awareness-scene__voice-label--prejudice"
                    >
                        {{ voices[1].label }}
                    </h3>
                </div>

                <div id="awareness-messages" class="awareness-scene__voices">
                    <div
                        v-for="voice in voices"
                        :key="voice.side"
                        class="awareness-scene__voice"
                        :class="`awareness-scene__voice--${voice.side}`"
                        role="group"
                        :aria-labelledby="`awareness-voice-${voice.side}`"
                    >
                        <div class="awareness-scene__window">
                            <div class="awareness-scene__stream">
                                <ul
                                    v-for="copy in 2"
                                    :key="copy"
                                    class="awareness-scene__message-list"
                                    :aria-hidden="copy === 2 ? true : undefined"
                                >
                                    <li
                                        v-for="message in voice.messages"
                                        :key="message"
                                        class="awareness-scene__message"
                                    >
                                        {{ message }}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
.awareness-scene {
    position: relative;
    isolation: isolate;
    width: 100%;
    height: 100svh;
    min-height: 36rem;
    overflow: hidden;
    background: #073873;
    color: #fff;
    font-family: var(--font-belanosima), sans-serif;
}
.awareness-scene__stage {
    display: flex;
    flex-direction: column;
    gap: clamp(1.5rem, 4svh, 3rem);
    width: 100%;
    height: 100%;
    padding: 7svh 7% 4svh;
}
.awareness-scene__copy {
    flex: 0 0 auto;
    align-self: center;
    width: min(calc(100% + 6vw), 96rem);
    margin: 0;
    font-size: clamp(1.5rem, 2.65vw, 3.4rem);
    line-height: 1.3;
    text-align: center;
    text-wrap: balance;
}
.awareness-scene__copy strong {
    font-weight: inherit;
}
.awareness-scene__misunderstanding {
    color: #c0ffe8;
}
.awareness-scene__discrimination {
    color: #fff0ac;
}
.awareness-scene__dialogue {
    --voice-gap: clamp(4rem, 15vw, 18rem);
    position: relative;
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 1.25rem;
    min-height: 0;
}
.awareness-scene__dialogue-header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) clamp(6rem, 21vw, 24rem) minmax(
            0,
            1fr
        );
    align-items: center;
    flex: 0 0 auto;
    min-height: 2.75rem;
}
.awareness-scene__pause {
    display: grid;
    justify-self: center;
    place-items: center;
    width: 2.75rem;
    height: 2.75rem;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: transparent;
    color: #88b5df;
    transition:
        color 180ms ease,
        background-color 180ms ease;
    cursor: pointer;
}
.awareness-scene__pause:hover {
    background: #104995;
    color: #fff;
}
.awareness-scene__pause[aria-pressed="true"] {
    color: #c0ffe8;
}
.awareness-scene__pause:focus-visible {
    outline: 3px solid #c0ffe8;
    outline-offset: 4px;
}
.awareness-scene__pause svg {
    width: 1.1rem;
    height: 1.1rem;
}
.awareness-scene__voices {
    display: grid;
    flex: 1;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--voice-gap);
    min-height: 0;
}
.awareness-scene__voice {
    --voice-color: #c0ffe8;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-width: 0;
    min-height: 0;
}
.awareness-scene__voice--prejudice {
    --voice-color: #fff0ac;
}
.awareness-scene__voice-label {
    margin: 0;
    font-size: clamp(1rem, 1.5vw, 1.5rem);
    font-weight: 400;
    line-height: 1.25;
    text-align: center;
    text-wrap: balance;
}
.awareness-scene__voice-label--experience {
    color: #c0ffe8;
}
.awareness-scene__voice-label--prejudice {
    color: #fff0ac;
}
.awareness-scene__window {
    flex: 1;
    min-height: 0;
    overflow: hidden;
    mask-image: linear-gradient(
        transparent,
        #073873 7%,
        #073873 88%,
        transparent
    );
}
.awareness-scene__stream {
    animation: awareness-message-flow 36s linear infinite;
    animation-play-state: paused;
}
.awareness-scene__voice--prejudice .awareness-scene__stream {
    animation-duration: 44s;
}
.awareness-scene--flowing .awareness-scene__stream {
    animation-play-state: running;
}
.awareness-scene__window:hover .awareness-scene__stream {
    animation-play-state: paused;
}
.awareness-scene__message-list {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: clamp(0.9rem, 2svh, 1.5rem);
    margin: 0;
    padding: 0.6rem 0 1.5rem;
    list-style: none;
}
.awareness-scene__message {
    max-width: 93%;
    padding: clamp(0.85rem, 1.25vw, 1.5rem) clamp(1rem, 1.8vw, 2rem);
    border-radius: 1.5rem 1.5rem 1.5rem 0.3rem;
    background: var(--voice-color);
    color: #073873;
    font-size: clamp(1.05rem, 1.55vw, 1.9rem);
    line-height: 1.25;
    text-wrap: pretty;
}
.awareness-scene__message:nth-child(even) {
    margin-left: 7%;
}
.awareness-scene__voice--prejudice .awareness-scene__message-list {
    align-items: flex-end;
}
.awareness-scene__voice--prejudice .awareness-scene__message {
    border-radius: 1.5rem 1.5rem 0.3rem 1.5rem;
}
.awareness-scene__voice--prejudice .awareness-scene__message:nth-child(even) {
    margin-right: 7%;
    margin-left: 0;
}
@keyframes awareness-message-flow {
    to {
        transform: translateY(-50%);
    }
}
@media (max-width: 52rem) {
    .awareness-scene__stage {
        gap: 1.5rem;
        padding: 7svh 6% 3svh;
    }
    .awareness-scene__copy {
        width: 100%;
        font-size: clamp(1.25rem, 4.4vw, 2rem);
        line-height: 1.35;
    }
    .awareness-scene__voices {
        gap: 1rem;
    }
    .awareness-scene__dialogue-header {
        grid-template-columns: minmax(0, 1fr) 3.5rem minmax(0, 1fr);
        gap: 0.75rem;
    }
    .awareness-scene__voice-label {
        font-size: 0.85rem;
        line-height: 1.2;
    }
    .awareness-scene__message {
        padding: 0.85rem;
        border-radius: 1rem 1rem 1rem 0.2rem;
        font-size: clamp(0.9rem, 2.8vw, 1.2rem);
        line-height: 1.3;
    }
    .awareness-scene__voice--prejudice .awareness-scene__message {
        border-radius: 1rem 1rem 0.2rem 1rem;
    }
}
@media (max-height: 32rem) and (min-width: 52.01rem) {
    .awareness-scene {
        min-height: 24rem;
    }
    .awareness-scene__stage {
        gap: 1rem;
        padding-block: 1.5rem;
    }
    .awareness-scene__copy {
        font-size: 1.4rem;
    }
}
@media (prefers-reduced-motion: reduce) {
    .awareness-scene {
        height: auto;
        min-height: 100svh;
    }
    .awareness-scene__stage {
        padding-block: 4rem;
    }
    .awareness-scene__pause {
        visibility: hidden;
    }
    .awareness-scene__window {
        overflow: visible;
        mask-image: none;
    }
    .awareness-scene__stream {
        animation: none;
    }
    .awareness-scene__message-list[aria-hidden="true"] {
        display: none;
    }
}
</style>
