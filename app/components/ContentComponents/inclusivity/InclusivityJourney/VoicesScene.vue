<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from "vue";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Icon } from "@iconify/vue";
import wandaImage from "../../../../../assets/inclu/1.png";
import templeImage from "../../../../../assets/inclu/2.png";
import derekImage from "../../../../../assets/inclu/3.png";
import gabrielImage from "../../../../../assets/inclu/4.png";
import craigImage from "../../../../../assets/inclu/5.png";
import jiaImage from "../../../../../assets/inclu/6.png";
import guideImage from "../../../../../assets/inclu/cartoon.png";

const props = defineProps<{ scroller: HTMLElement }>();
const scene = ref<HTMLElement | null>(null);
const animated = ref(false);
const active = ref(0);
const turned = ref<Record<number, boolean>>({});
let media: gsap.MatchMedia | undefined;
let timeline: gsap.core.Timeline | undefined;
let selectionFade: gsap.core.Tween | undefined;
const sourceArrowIcon = {
    width: 24,
    height: 24,
    body: '<path d="M5 19 19 5M5 5h14v14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
};
const voices = [
    {
        name: "Wanda Díaz Merced",
        group: "Blind community",
        image: wandaImage,
        field: "A blind astrophysicist",
        description: "Pioneering new ways to hear astronomical data.",
        quote: "Science is for everyone. It has to be available to everyone, because we are all natural explorers.",
        source: "https://www.ted.com/talks/wanda_diaz_merced_how_a_blind_astronomer_found_a_way_to_hear_the_stars?view=transcript",
        stat: "2.1%",
        data: "Only 2.1% of blind children globally have access to specialized education services (2026).",
        dataSource: "https://worldmetrics.org/blind-statistics/",
        dataCredit: "Blind education statistics",
    },
    {
        name: "Temple Grandin",
        group: "Children on the autism spectrum",
        image: templeImage,
        field: "An animal scientist on the autism spectrum",
        description: "Transforming livestock handling and animal welfare.",
        quote: "I am different, not less.",
        source: "https://www.apa.org/members/content/neurodiversity-transcript.pdf",
        stat: "14.95%",
        data: "Despite receiving educational support, only about 14.95% of individuals with autism enroll in a 4-year college.",
        dataSource: "https://aaclu.org/statistics/education/",
        dataCredit: "Autism education statistics",
    },
    {
        name: "Derek Braun",
        group: "Deaf community",
        image: derekImage,
        field: "A deaf geneticist",
        description:
            "Establishing Gallaudet University's first molecular genetics laboratory.",
        quote: "I originally thought I’d probably run into another deaf scientist there because it was such a large conference, but I didn’t.",
        source: "https://gallaudet.edu/science-technology-accessibility-mathematics-public-health/department-of-science-technology-and-mathematics-works-to-narrow-gap-for-deaf-students-in-stem-fields/",
        stat: "80%",
        data: "Around 80% of school-age deaf children in low- and middle-income countries are out of school (2026).",
        dataSource:
            "https://www.disabilityworld.org/articles/state-of-deaf-education-access/",
        dataCredit: "State of deaf education access",
    },
    {
        name: "Gabriel Reyes",
        group: "Low socio-economic backgrounds",
        image: gabrielImage,
        field: "A neuroscientist & founder of FLi Sci",
        description:
            "Opening research opportunities for first-generation and low-income students.",
        quote: "Part of me wants to be angry and frustrated that no matter how hard I work or how enthusiastic I am, the socioeconomic class I was born into will be a hidden barrier.",
        source: "https://civicsciencemedia.org/from-poverty-to-science/",
        stat: "37% / 12%",
        data: "Socio-economic background remains strongly associated with student achievement. Across OECD countries, 37% of disadvantaged students were low performers in science, compared with 12% of advantaged students (2025).",
        dataSource: "",
        dataCredit: "OECD · Science performance · 2025",
    },
    {
        name: "Craig Venter",
        group: "Modeling beginners",
        image: craigImage,
        field: "A genomics pioneer",
        description:
            "Helping sequence the human genome and create the first synthetic bacterial cell.",
        quote: "Craig Venter is celebrated in the fields of synthetic biology and genome sequencing—fields where coding and biology blend together—yet, to the best of my knowledge, he is neither an expert programmer nor a software developer.",
        attribution: "David R. Smith, discussing Craig Venter",
        source: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5989772/",
        stat: "Beyond access",
        data: "Equitable adoption of bioinformatics tools will require sustained investment in infrastructure, training, institutions, and global communities, not just access.",
        dataSource: "https://doi.org/10.1371/journal.pbio.3003839",
        dataCredit: "Magaña et al. · PLoS Biology · 2026",
    },
    {
        name: "Jia Lanpo",
        group: "Older adults with limited formal education",
        image: jiaImage,
        field: "A pioneering paleoanthropologist",
        description:
            "A contributor to the Zhoukoudian excavation, with only a high school education.",
        quote: "The spread of scientific knowledge is slow because too little effort is devoted to communicating science.",
        original: "科学知识起得慢，就是宣传太少。",
        source: "",
        stat: "17-point gap",
        data: "In OECD countries, the tertiary education rate is much lower for older adults: only 32% among adults aged 55–64, versus 49% among those aged 25–34 — a 17-point generational gap (2026).",
        dataSource:
            "https://www.oecd.org/en/publications/education-at-a-glance-2026_b4968bbc-en/full-report/to-what-level-have-adults-studied_b5466dac.html",
        dataCredit: "OECD · Education at a Glance 2026",
    },
];
const isTurned = (index: number) => !!turned.value[index];

function toggleVoice(index: number) {
    turned.value[index] = !turned.value[index];
}

function selectVoice(index: number) {
    const trigger = timeline?.scrollTrigger;
    if (trigger && timeline) {
        const currentTimeline = timeline;
        const panels = scene.value?.querySelector<HTMLElement>(".voice-panels");
        if (!panels) return;
        selectionFade?.kill();
        const time = index * 1.4 + 0.45;
        const top =
            trigger.start +
            (time / currentTimeline.duration()) * (trigger.end - trigger.start);
        selectionFade = gsap.to(panels, {
            autoAlpha: 0,
            duration: 0.12,
            overwrite: true,
            onComplete: () => {
                props.scroller.dispatchEvent(
                    new CustomEvent("inclusion:scroll-to", {
                        detail: { top, immediate: true },
                    }),
                );
                // Finish scrub catch-up while the dialogue is hidden so a
                // portrait click never plays the intervening voices.
                trigger.update();
                trigger.getTween()?.progress(1);
                currentTimeline.time(time);
                active.value = index;
                turned.value = {};
                selectionFade = gsap.to(panels, {
                    autoAlpha: 1,
                    duration: 0.24,
                    ease: "power1.out",
                });
            },
        });
    } else {
        scene.value
            ?.querySelectorAll<HTMLElement>(".voice-panel")
            [index]?.scrollIntoView({ block: "center", behavior: "smooth" });
    }
}

onMounted(async () => {
    await nextTick();
    if (!scene.value) return;
    gsap.registerPlugin(ScrollTrigger);
    media = gsap.matchMedia();
    media.add(
        {
            desktop: "(min-width: 900px) and (min-height: 620px)",
            compact: "(max-width: 899px), (max-height: 619px)",
            reduce: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
            if (!context.conditions?.desktop || context.conditions?.reduce) {
                animated.value = false;
                gsap.set(scene.value!.querySelectorAll(".voice-panel"), {
                    clearProps: "visibility,opacity,transform",
                });
                return;
            }
            animated.value = true;
            const root = scene.value!;
            // Apply the pinned layout before ScrollTrigger measures it; Vue flushes the class on the next tick.
            root.classList.add("is-animated");
            const panels = root.querySelectorAll<HTMLElement>(".voice-panel");
            const bridge = root.querySelector<HTMLElement>(".voices-bridge")!;
            const guide = root.querySelector<HTMLElement>(".voices-guide")!;
            const speech = root.querySelectorAll<HTMLElement>(".guide-line");
            const gallery =
                root.querySelector<HTMLElement>(".portrait-gallery")!;
            gsap.set(panels, { autoAlpha: 0, y: 20 });
            gsap.set(panels[0]!, { autoAlpha: 1, y: 0 });
            gsap.set(bridge, { autoAlpha: 0 });
            gsap.set(guide, {
                autoAlpha: 0,
                y: 150,
                scale: 0.2,
                transformOrigin: "50% 100%",
            });
            gsap.set(speech, {
                autoAlpha: 0,
                y: 25,
                scale: 0.94,
                transformOrigin: "50% 100%",
            });
            timeline = gsap.timeline({
                defaults: { ease: "power2.inOut" },
                scrollTrigger: {
                    id: "inclusivity-voices",
                    trigger: root,
                    scroller: props.scroller,
                    start: "top top",
                    end: () => `+=${props.scroller.clientHeight * 8}`,
                    pin: true,
                    pinSpacing: true,
                    scrub: 0.55,
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                    // Earlier sections establish their pin spacers before the
                    // following scenes measure their starts.
                    refreshPriority: 3,
                },
                onUpdate: () => {
                    if (!timeline) return;
                    const time = timeline.time();
                    const next =
                        time < 8.4
                            ? Math.min(5, Math.floor(time / 1.4))
                            : time < 12.2
                              ? 6
                              : 7;
                    if (next !== active.value) {
                        active.value = next;
                        turned.value = {};
                    }
                },
            });
            panels.forEach((panel, index) => {
                const start = index * 1.4;
                if (index)
                    timeline!.to(
                        panel,
                        {
                            autoAlpha: 1,
                            y: 0,
                            duration: 0.35,
                        },
                        start,
                    );
                timeline!.to(
                    panel,
                    { autoAlpha: 0, y: -20, duration: 0.25 },
                    start + 1.15,
                );
            });
            timeline
                .to(gallery, { autoAlpha: 0, y: -25, duration: 0.35 }, 8.05)
                .set(bridge, { autoAlpha: 1 }, 8.4)
                .to(
                    guide,
                    {
                        autoAlpha: 1,
                        y: 0,
                        scale: 1,
                        duration: 0.9,
                        ease: "back.out(2)",
                    },
                    8.4,
                )
                .to(
                    speech[0]!,
                    {
                        autoAlpha: 1,
                        y: 0,
                        scale: 1,
                        duration: 0.7,
                        ease: "back.out(1.5)",
                    },
                    8.85,
                )
                .to(speech[0]!, { autoAlpha: 0, y: -20, duration: 0.3 }, 11.9)
                .to(
                    speech[1]!,
                    {
                        autoAlpha: 1,
                        y: 0,
                        scale: 1,
                        duration: 0.7,
                        ease: "back.out(1.5)",
                    },
                    12.2,
                )
                .to({}, { duration: 2.4 });
            return () => {
                selectionFade?.kill();
                gsap.set(root.querySelector(".voice-panels"), {
                    clearProps: "opacity,visibility",
                });
                timeline = undefined;
                root.classList.remove("is-animated");
                animated.value = false;
                active.value = 0;
            };
        },
        scene.value,
    );
});

onUnmounted(() => {
    selectionFade?.kill();
    media?.revert();
});
</script>

<template>
    <section
        ref="scene"
        class="voices-scene"
        :class="{ 'is-animated': animated }"
        data-journey-scene="voices"
        aria-label="Voices in science"
    >
        <div class="voices-stage">
            <div
                class="portrait-gallery"
                aria-label="Choose a scientist's voice"
            >
                <button
                    v-for="(voice, index) in voices"
                    :key="voice.name"
                    type="button"
                    class="portrait-choice"
                    :class="[
                        { 'is-speaking': active === index },
                        `portrait-choice--${index}`,
                    ]"
                    :aria-label="`Read ${voice.name}'s quote`"
                    :aria-pressed="active === index"
                    @click="selectVoice(index)"
                >
                    <span class="portrait-art"
                        ><img :src="voice.image" alt="" draggable="false"
                    /></span>
                    <span class="portrait-name">{{ voice.name }}</span>
                </button>
            </div>

            <div class="voice-panels">
                <article
                    v-for="(voice, index) in voices"
                    :key="voice.name"
                    class="voice-panel"
                    :aria-hidden="
                        animated && active !== index ? true : undefined
                    "
                    :inert="animated && active !== index ? true : undefined"
                >
                    <div class="mobile-portrait">
                        <img
                            :src="voice.image"
                            :alt="`Illustration of ${voice.name}`"
                        />
                    </div>
                    <div
                        class="voice-flip"
                        :class="{ 'is-turned': isTurned(index) }"
                        @click="toggleVoice(index)"
                    >
                        <div class="voice-flip-inner">
                            <div
                                class="voice-face voice-front"
                                :aria-hidden="isTurned(index)"
                            >
                                <span class="quote-mark" aria-hidden="true"
                                    >“</span
                                >
                                <blockquote
                                    :class="{
                                        'quote-long': voice.quote.length > 180,
                                    }"
                                >
                                    <span>{{ voice.quote }}</span>
                                    <sup
                                        v-if="voice.source"
                                        class="source-marker"
                                    >
                                        <a
                                            class="voice-source"
                                            :href="voice.source"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            :aria-label="`Quote source for ${voice.name} (opens in a new tab)`"
                                            :tabindex="isTurned(index) ? -1 : 0"
                                            @click.stop
                                            ><Icon
                                                :icon="sourceArrowIcon"
                                                aria-hidden="true"
                                        /></a>
                                    </sup>
                                </blockquote>
                                <p
                                    v-if="voice.original"
                                    class="original-quote"
                                    lang="zh"
                                >
                                    {{ voice.original }}
                                </p>
                                <div class="voice-attribution">
                                    <strong>{{
                                        voice.attribution || voice.name
                                    }}</strong
                                    ><span>{{ voice.field }}</span
                                    ><small>{{ voice.description }}</small>
                                </div>
                            </div>
                            <div
                                class="voice-face voice-back"
                                :aria-hidden="!isTurned(index)"
                            >
                                <span class="card-eyebrow">{{
                                    voice.group
                                }}</span>
                                <strong class="data-stat">{{
                                    voice.stat
                                }}</strong>
                                <p class="data-copy">
                                    <span>{{ voice.data }}</span>
                                    <sup
                                        v-if="voice.dataSource"
                                        class="source-marker"
                                    >
                                        <a
                                            class="voice-source"
                                            :href="voice.dataSource"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            :aria-label="`${voice.dataCredit} (opens in a new tab)`"
                                            :tabindex="isTurned(index) ? 0 : -1"
                                            @click.stop
                                            ><Icon
                                                :icon="sourceArrowIcon"
                                                aria-hidden="true"
                                        /></a>
                                    </sup>
                                </p>
                                <p v-if="!voice.dataSource" class="data-credit">
                                    {{ voice.dataCredit }}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            class="flip-control"
                            :aria-pressed="isTurned(index)"
                            :aria-label="`${isTurned(index) ? 'Show quote' : 'Show data'} for ${voice.name}`"
                            @click.stop="toggleVoice(index)"
                        >
                            {{
                                isTurned(index)
                                    ? "Back to the voice"
                                    : "Turn the quote. See the barriers."
                            }}
                            <span aria-hidden="true">↻</span>
                        </button>
                    </div>
                </article>
            </div>
        </div>

        <div
            class="voices-bridge"
            :aria-hidden="animated && active < 6 ? true : undefined"
            :inert="animated && active < 6 ? true : undefined"
        >
            <div class="guide-speech">
                <p
                    class="guide-line"
                    :aria-hidden="animated && active !== 6 ? true : undefined"
                    :inert="animated && active !== 6 ? true : undefined"
                >
                    We wanted to ensure that the voices we heard would not
                    simply be acknowledged, but answered through
                    <strong>meaningful action</strong>—and that more voices,
                    too, would find their way into science.
                </p>
                <p
                    class="guide-line"
                    :aria-hidden="animated && active !== 7 ? true : undefined"
                    :inert="animated && active !== 7 ? true : undefined"
                >
                    To guide our inclusion efforts and consistently track our
                    progress, we established the
                    <strong class="lift-word">LIFT+ framework.</strong>
                </p>
            </div>
            <img
                class="voices-guide"
                :src="guideImage"
                alt="Our blue-haired guide"
            />
        </div>
    </section>
</template>

<style scoped>
.voices-scene {
    --ink: #03316d;
    --paper: #fffff8;
    --sun: #ffe45c;
    --mint: #a8d9f9;
    position: relative;
    isolation: isolate;
    padding: 5rem 5vw 4rem;
    color: var(--paper);
    background: #03316d;
    overflow: hidden;
    font-family: var(--journey-body, system-ui, sans-serif);
    font-weight: 600;
}
.voices-stage {
    position: relative;
    max-width: 1440px;
    margin: 0 auto;
}
.portrait-gallery {
    display: none;
}
.voice-panels {
    width: min(100%, 680px);
    margin: auto;
    display: grid;
    gap: 3rem;
}
.voice-panel {
    min-width: 0;
}
.voice-flip {
    position: relative;
    perspective: 1600px;
    padding-bottom: 3.1rem;
    cursor: pointer;
}
.voice-flip-inner {
    display: grid;
    transform-style: preserve-3d;
    transition: transform 0.65s cubic-bezier(0.22, 0.68, 0, 1);
}
.voice-flip.is-turned .voice-flip-inner {
    transform: rotateY(180deg);
}
.voice-face {
    grid-area: 1/1;
    min-height: 340px;
    padding: 2rem 2.5rem;
    border-radius: 3rem;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    background: var(--paper);
    color: var(--ink);
    display: flex;
    flex-direction: column;
    justify-content: center;
    box-shadow: 0 7px 0 #a8d9f9;
    position: relative;
    overflow: visible;
}
.voice-face::after {
    content: "";
    position: absolute;
    bottom: -1.1rem;
    left: 2rem;
    width: 2rem;
    height: 1.5rem;
    background: inherit;
    clip-path: polygon(0 0, 100% 0, 0 100%);
}
.voice-front {
    transform: rotateY(0);
}
.voice-back {
    transform: rotateY(180deg);
    background: #e1eee9;
    box-shadow: 0 7px 0 #a0c4bb;
}
.card-eyebrow {
    font-size: 1rem;
    color: #2d5a8b;
}
.quote-mark {
    font-family: var(--font-righteous), "Righteous", sans-serif;
    font-size: 4rem;
    height: 2.6rem;
    line-height: 1;
    color: #3f8be1;
}
blockquote {
    margin: 0;
    font-family: inherit;
    font-size: clamp(1.65rem, 2.3vw, 2.9rem);
    line-height: 1.4;
    font-weight: 600;
}
blockquote.quote-long {
    font-size: clamp(1.25rem, 1.77vw, 2.15rem);
}
.original-quote {
    font-size: 1rem;
    margin: 0.8rem 0 0;
}
.voice-attribution {
    margin-top: 1.4rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}
.voice-attribution strong {
    font-size: 1.1rem;
    font-weight: 700;
    color: #1454a4;
}
.voice-attribution span {
    font-size: 1rem;
}
.voice-attribution small {
    color: #48688e;
    font-size: 1rem;
    line-height: 1.35;
    max-width: 28rem;
}
.source-marker {
    position: relative;
    top: -1.1em;
    margin-left: 0.1em;
    font-size: clamp(11px, 0.48em, 18px);
    line-height: 0;
    vertical-align: baseline;
    white-space: nowrap;
}
.voice-source {
    position: relative;
    display: inline-flex;
    padding: 0;
    color: inherit;
    font: inherit;
    line-height: 1;
    text-decoration: none;
    opacity: 0.75;
    transition: opacity 0.2s;
}
.voice-source::before {
    content: "";
    position: absolute;
    inset: -0.35em;
}
.voice-source :deep(svg) {
    display: block;
    width: 1em;
    height: 1em;
}
.voice-source:hover {
    color: #216ec3;
    opacity: 1;
}
.voice-flip:hover .voice-front,
.voice-flip:focus-within .voice-front {
    box-shadow:
        0 9px 0 #a8d9f9,
        0 0 0 3px #a8d9f966;
}
.voice-source:focus-visible,
.flip-control:focus-visible,
.portrait-choice:focus-visible {
    outline: 3px solid #f363ab;
    outline-offset: 5px;
}
.data-stat {
    display: block;
    margin: 1rem 0;
    font-family: var(--font-righteous), "Righteous", sans-serif;
    font-size: clamp(2.2rem, 4.2vw, 4.8rem);
    line-height: 1.08;
    font-weight: 400;
    letter-spacing: -0.035em;
}
.data-copy {
    margin: 0;
    font-size: clamp(1.1rem, 1.5vw, 1.65rem);
    line-height: 1.4;
}
.data-credit {
    font-size: 1rem;
    margin-top: 1.2rem;
}
.flip-control {
    position: absolute;
    bottom: -0.15rem;
    left: 2rem;
    min-height: 2.5rem;
    padding: 0.45rem 0.2rem;
    background: transparent;
    border: 0;
    color: #e4f0fa;
    font: inherit;
    font-size: 1rem;
    cursor: pointer;
}
.flip-control span {
    display: inline-block;
    margin-left: 0.65rem;
    color: var(--mint);
    font-size: 1.3rem;
}
.mobile-portrait {
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
    height: 280px;
    margin-bottom: -0.5rem;
    position: relative;
}
.mobile-portrait img {
    position: absolute;
    bottom: 0;
    right: 15%;
    height: 100%;
    width: auto;
    max-width: none;
}
.mobile-portrait > span {
    margin: 0 auto 1.5rem 0.75rem;
    font-size: 1rem;
    color: var(--mint);
}
.voices-bridge {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.8rem;
    max-width: 1020px;
    margin: 6rem auto 0;
    padding-bottom: 2rem;
}
.guide-speech {
    width: 100%;
    display: grid;
    gap: 2.2rem;
    position: relative;
}
.guide-line {
    position: relative;
    margin: 0;
    padding: clamp(1.5rem, 3.1vw, 3rem);
    border-radius: 3rem;
    background: var(--paper);
    color: var(--ink);
    text-align: center;
    font-size: clamp(1.3rem, 2.2vw, 2.5rem);
    line-height: 1.35;
    box-shadow: 0 7px 0 var(--mint);
}
.guide-line::after {
    content: "";
    position: absolute;
    bottom: -1.4rem;
    left: calc(50% - 1rem);
    width: 2rem;
    height: 1.6rem;
    background: inherit;
    clip-path: polygon(0 0, 100% 0, 50% 100%);
}
.guide-line strong {
    font-weight: 400;
    color: #216ec3;
}
.guide-line .lift-word {
    color: #03316d;
    background: var(--sun);
    box-decoration-break: clone;
    padding: 0 0.15em;
    font-family: var(--font-righteous), "Righteous", sans-serif;
}
.voices-guide {
    display: block;
    height: min(43vh, 390px);
    width: auto;
    max-width: 85%;
    object-fit: contain;
}
.is-animated.voices-scene {
    height: 100dvh;
    min-height: 0;
    padding: clamp(2rem, 5vh, 4rem) 4vw 3rem;
}
.is-animated .voices-stage {
    margin-top: 0;
    height: 100%;
}
.is-animated .portrait-gallery {
    display: block;
    position: absolute;
    inset: 0;
}
.portrait-choice {
    position: absolute;
    border: 0;
    padding: 0;
    background: transparent;
    color: #e5f0fa;
    font: inherit;
    width: clamp(145px, 17vw, 260px);
    cursor: pointer;
    opacity: 0.4;
    transition:
        opacity 0.4s,
        transform 0.5s;
}
.portrait-choice.is-speaking {
    opacity: 1;
    transform: translateY(-5px) scale(1.035);
}
.portrait-choice:hover,
.portrait-choice:focus-visible {
    opacity: 1;
}
.portrait-art {
    display: block;
    position: relative;
    height: clamp(130px, 23vh, 255px);
    background: transparent;
    border-radius: 2.4rem;
    border: 0;
    transition: filter 0.4s;
}
.is-speaking .portrait-art {
    background: transparent;
    border-color: transparent;
}
.portrait-art img {
    position: absolute;
    right: 50%;
    transform: translateX(50%);
    bottom: 0;
    height: 100%;
    width: auto;
    max-width: none;
    filter: saturate(0.3);
    transition: filter 0.4s;
}
.is-speaking .portrait-art img {
    filter: saturate(1);
}
.portrait-name {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    justify-content: center;
    margin-top: 0.55rem;
    font-size: 1rem;
}
.portrait-choice--0 {
    left: 2%;
    top: 0;
}
.portrait-choice--1 {
    right: 2%;
    top: 0;
}
.portrait-choice--2 {
    left: 0;
    top: 34%;
}
.portrait-choice--3 {
    right: 0;
    top: 34%;
}
.portrait-choice--4 {
    left: 3%;
    top: 68%;
}
.portrait-choice--5 {
    right: 3%;
    top: 68%;
}
.is-animated .voice-panels {
    position: relative;
    width: 56%;
    height: 100%;
    display: block;
}
.is-animated .voice-panel {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
}
.is-animated .voice-flip {
    width: 100%;
}
.is-animated .voice-face {
    min-height: min(46vh, 490px);
    max-height: none;
    overflow: visible;
    padding: clamp(1.4rem, 2.5vw, 3rem);
}
.is-animated .mobile-portrait {
    display: none;
}
.is-animated .voices-bridge {
    position: absolute;
    inset: 0;
    margin: auto;
    padding: 4rem 5vw 3rem;
    gap: 2rem;
    max-width: 1100px;
}
.is-animated .guide-line {
    grid-area: 1/1;
    align-self: center;
}
@media (min-width: 900px) and (max-height: 760px) {
    .is-animated .voices-stage {
        margin-top: 0;
        height: 100%;
    }
    .is-animated .voice-attribution {
        margin-top: 0.85rem;
    }
    .is-animated blockquote {
        font-size: clamp(24px, 1.9vw, 30px);
    }
    .is-animated blockquote.quote-long {
        font-size: clamp(20px, 1.6vw, 26px);
    }
    .is-animated .voice-attribution small {
        font-size: 1rem;
    }
    .is-animated .voices-guide {
        height: 37vh;
    }
    .is-animated .guide-line {
        font-size: clamp(1.3rem, 2vw, 2rem);
        padding: 1.8rem 2.2rem;
    }
}
@media (max-width: 600px) {
    .voices-scene {
        padding: 4.5rem 6vw 3rem;
    }
    .voice-face {
        padding: 1.6rem;
        min-height: 340px;
        max-height: none;
        border-radius: 2.2rem;
    }
    blockquote.quote-long {
        font-size: 1.25rem;
    }
    .mobile-portrait {
        height: 245px;
    }
    .mobile-portrait img {
        right: 10%;
    }
    .voice-attribution strong {
        font-size: 1rem;
    }
    .flip-control {
        font-size: 0.9rem;
        left: 1.5rem;
    }
    .guide-line {
        font-size: 1.22rem;
        border-radius: 2rem;
        padding: 1.6rem;
    }
    .voices-bridge {
        margin-top: 4rem;
    }
    .voices-guide {
        height: 290px;
    }
}
@media (prefers-reduced-motion: reduce) {
    .voice-flip-inner,
    .portrait-choice,
    .portrait-art,
    .portrait-art img {
        transition: none;
    }
}
</style>
