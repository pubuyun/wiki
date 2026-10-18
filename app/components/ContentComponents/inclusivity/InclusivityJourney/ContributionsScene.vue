<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { contributionCopy } from "./contribution-copy";

const autismImage =
    "https://static.igem.wiki/teams/6133/wiki/hp/inclusivity/animation/autism.avif";
const blindImage =
    "https://static.igem.wiki/teams/6133/wiki/hp/inclusivity/animation/blind.avif";
const deafImage =
    "https://static.igem.wiki/teams/6133/wiki/hp/inclusivity/animation/deaf.avif";
const lowIncomeImage =
    "https://static.igem.wiki/teams/6133/wiki/hp/inclusivity/animation/lowincome.avif";
const modelingImage =
    "https://static.igem.wiki/teams/6133/wiki/hp/inclusivity/animation/code.avif";
const olderAdultsImage =
    "https://static.igem.wiki/teams/6133/wiki/hp/inclusivity/animation/undereducated.avif";

const props = defineProps<{ scroller: HTMLElement }>();
const emit = defineEmits<{ navigate: [destination: string]; close: [] }>();
const root = ref<HTMLElement | null>(null);
const stage = ref<HTMLElement | null>(null);
const activeIndex = ref(0);
const hovered = ref(-1);
const previews = ref(new Set<number>());
let context: gsap.Context | undefined;
let media: gsap.MatchMedia | undefined;

// These bounds exclude only the transparent side margins of the supplied artwork.
// The complete visible illustration and every statistic retain their original ratio.
const groups = [
    {
        name: "Blind Community",
        shortName: "Science you can touch",
        image: blindImage,
        imageWidth: 3000,
        imageHeight: 2200,
        left: 220,
        visibleWidth: 2572,
        statistic: "Illustration: 8.92 million blind people in China, 2026.",
        destination: "/inclusivity/blind-community",
        contributions: contributionCopy.blind,
        color: "#8fd8ee",
    },
    {
        name: "Deaf Community",
        shortName: "A shared language of science",
        image: deafImage,
        imageWidth: 3000,
        imageHeight: 2200,
        left: 220,
        visibleWidth: 2604,
        statistic:
            "Illustration: 7.39 million people with complete hearing loss in China, 2022.",
        destination: "/inclusivity#deaf-community",
        contributions: contributionCopy.deaf,
        color: "#86dbbf",
    },
    {
        name: "Children On The Autism Spectrum",
        shortName: "Different ways to discover",
        image: autismImage,
        imageWidth: 3000,
        imageHeight: 2200,
        left: 326,
        visibleWidth: 2223,
        statistic:
            "Illustration: 13+ million people on the autism spectrum in China, 2026.",
        destination: "/inclusivity#autism-spectrum",
        contributions: contributionCopy.autism,
        color: "#ffcc62",
    },
    {
        name: "Individuals From Low Socioeconomic Backgrounds",
        shortName: "Big discoveries, everyday materials",
        image: lowIncomeImage,
        imageWidth: 3000,
        imageHeight: 2200,
        left: 364,
        visibleWidth: 2360,
        statistic:
            "Illustration: 281 million people in China had annual disposable income of approximately US$1,420 per person or less, 2025.",
        destination: "/inclusivity#low-socio-economic-backgrounds",
        contributions: contributionCopy.lowIncome,
        color: "#f9b7ab",
    },
    {
        name: "Modeling Beginners",
        shortName: "A first step into modeling",
        image: modelingImage,
        imageWidth: 2250,
        imageHeight: 1650,
        left: 231,
        visibleWidth: 1788,
        statistic:
            "Illustration: 92.9% of internet users aged 10–19 in China could not proficiently write computer programs, 2025.",
        destination: "/inclusivity#modeling-beginners",
        contributions: contributionCopy.modeling,
        color: "#beb5ee",
    },
    {
        name: "Older Adults With Limited Formal Education",
        shortName: "Curiosity has no age limit",
        image: olderAdultsImage,
        imageWidth: 2250,
        imageHeight: 1650,
        left: 336,
        visibleWidth: 1704,
        statistic:
            "Illustration: 15.87% of people aged 65 and above in China had a college education or higher, 2026.",
        destination: "/inclusivity#older-adults",
        contributions: contributionCopy.olderAdults,
        color: "#f4d385",
    },
];

function isFlipped(index: number) {
    return hovered.value === index || previews.value.has(index);
}

function togglePreview(index: number) {
    const next = new Set(previews.value);
    if (isFlipped(index)) {
        next.delete(index);
        hovered.value = -1;
    } else next.add(index);
    previews.value = next;
}

function clearPreview(index: number) {
    hovered.value = -1;
    const next = new Set(previews.value);
    next.delete(index);
    previews.value = next;
}

function restoreNaturalScene() {
    root.value?.classList.remove("is-stacked");
    // A fromTo can restore the earlier set()'s hidden state when media contexts
    // revert. Remove only animation-owned properties, preserving artwork variables.
    root.value
        ?.querySelectorAll<HTMLElement>(
            ".contribution-card, .contributions-intro > *, .contributions-stage, .contributions-outro",
        )
        .forEach((element) => {
            for (const property of [
                "opacity",
                "visibility",
                "transform",
                "transform-origin",
                "pointer-events",
                "z-index",
            ])
                element.style.removeProperty(property);
        });
    activeIndex.value = 0;
    hovered.value = -1;
    previews.value = new Set();
}

onMounted(async () => {
    await nextTick();
    if (!root.value || !stage.value) return;
    gsap.registerPlugin(ScrollTrigger);
    context = gsap.context(() => {
        media = gsap.matchMedia();
        media.add(
            {
                desktop: "(min-width: 900px) and (min-height: 600px)",
                landscape:
                    "(orientation: landscape) and (min-width: 800px) and (min-height: 500px)",
                natural: "(max-width: 899px), (max-height: 599px)",
                reduced: "(prefers-reduced-motion: reduce)",
            },
            (match) => {
                restoreNaturalScene();
                if (match.conditions?.reduced) return;
                gsap.from(".contributions-intro > *:not(.intro-bubbles)", {
                    autoAlpha: 0,
                    y: 35,
                    duration: 0.8,
                    stagger: 0.12,
                    ease: "back.out(1.25)",
                    scrollTrigger: {
                        trigger: ".contributions-intro",
                        scroller: props.scroller,
                        start: "top 76%",
                        once: true,
                        refreshPriority: 0,
                    },
                });
                const cards =
                    gsap.utils.toArray<HTMLElement>(".contribution-card");
                const stacked =
                    match.conditions?.desktop || match.conditions?.landscape;
                if (stacked) {
                    // Switch from the readable natural layout before ScrollTrigger measures the stage.
                    root.value!.classList.add("is-stacked");
                    gsap.set(cards, { autoAlpha: 0, pointerEvents: "none" });
                    const entrances = [
                        { x: -300, y: 140, rotation: -18 },
                        { x: 300, y: 100, rotation: 15 },
                        { x: -90, y: 280, rotation: -12 },
                        { x: 240, y: -170, rotation: 18 },
                        { x: -280, y: -90, rotation: -16 },
                        { x: 100, y: 260, rotation: 12 },
                    ];
                    const step = 2.8;
                    const timeline = gsap.timeline({
                        defaults: { duration: 0.85, ease: "back.out(1.45)" },
                        scrollTrigger: {
                            id: "inclusivity-contributions",
                            trigger: stage.value,
                            scroller: props.scroller,
                            start: "top top",
                            end: () => `+=${props.scroller.clientHeight * 6.5}`,
                            pin: true,
                            pinSpacing: true,
                            scrub: 0.45,
                            anticipatePin: 1,
                            invalidateOnRefresh: true,
                            refreshPriority: 1,
                        },
                        onUpdate: () => {
                            const next = Math.min(
                                groups.length - 1,
                                Math.floor(timeline.time() / step),
                            );
                            if (activeIndex.value !== next) {
                                activeIndex.value = next;
                                hovered.value = -1;
                                previews.value = new Set();
                            }
                        },
                    });
                    cards.forEach((card, index) => {
                        const arrival = index * step;
                        timeline.set(
                            card,
                            { pointerEvents: "auto", zIndex: index + 1 },
                            arrival,
                        );
                        timeline.fromTo(
                            card,
                            {
                                ...entrances[index],
                                scale: 0.48,
                                autoAlpha: 0,
                            },
                            {
                                x: 0,
                                y: 0,
                                rotation: index % 2 ? 2 : -2,
                                scale: 1,
                                autoAlpha: 1,
                            },
                            arrival,
                        );
                        if (index > 0) {
                            timeline.set(
                                cards[index - 1],
                                { pointerEvents: "none" },
                                arrival,
                            );
                            timeline.to(
                                cards[index - 1],
                                {
                                    scale: 0.66,
                                    y: -40,
                                    rotation: index % 2 ? -10 : 10,
                                    autoAlpha: 0,
                                    duration: 0.65,
                                    ease: "power2.inOut",
                                },
                                arrival,
                            );
                        }
                    });
                    // Each photo stays still long enough to read, flip, or follow its story.
                    timeline.to({}, { duration: step - 0.85 });
                } else {
                    cards.forEach((card, index) => {
                        gsap.from(card, {
                            y: 65,
                            rotation: index % 2 ? 7 : -7,
                            scale: 0.88,
                            duration: 0.85,
                            ease: "back.out(1.3)",
                            scrollTrigger: {
                                trigger: card,
                                scroller: props.scroller,
                                start: "top 86%",
                                once: true,
                                refreshPriority: 0,
                            },
                        });
                    });
                }
                return restoreNaturalScene;
            },
            root.value!,
        );
    }, root.value);
});

onBeforeUnmount(() => {
    media?.revert();
    context?.revert();
    restoreNaturalScene();
});
</script>

<template>
    <section
        ref="root"
        class="contributions-scene"
        data-journey-scene="contributions"
        aria-labelledby="contributions-title"
    >
        <div class="contributions-intro">
            <div class="intro-bubbles" aria-hidden="true">
                <span></span><span></span><span></span><span></span>
            </div>
            <h2 id="contributions-title">
                More voices.<br /><span>More possibilities.</span>
            </h2>
            <p class="intro-copy">
                Guided by our LIFT+ framework, we began with six target groups
                we could reach in China who often face barriers to accessing
                synthetic biology and broader science: the
                <strong>blind community</strong>, the
                <strong>Deaf community</strong>,
                <strong>children on the autism spectrum</strong>,
                <strong>individuals from low socioeconomic backgrounds</strong>,
                <strong>modeling beginners</strong>, and
                <strong>older adults with limited formal education</strong>.
            </p>
        </div>

        <div ref="stage" class="contributions-stage">
            <div class="stage-bubbles" aria-hidden="true">
                <span></span><span></span><span></span><span></span
                ><span></span>
            </div>
            <div class="contributions-photos">
                <article
                    v-for="(group, index) in groups"
                    :key="group.destination"
                    class="contribution-card"
                    :class="{ 'is-flipped': isFlipped(index) }"
                    :style="{
                        '--card-accent': group.color,
                        '--art-ratio': `${group.visibleWidth} / ${group.imageHeight}`,
                        '--art-width': `${(group.imageWidth / group.visibleWidth) * 100}%`,
                        '--art-left': `${(-group.left / group.visibleWidth) * 100}%`,
                    }"
                    @keydown.esc="clearPreview(index)"
                >
                    <div
                        class="photo-frame"
                        @pointerenter="
                            hovered =
                                $event.pointerType === 'mouse' ? index : -1
                        "
                        @pointerleave="hovered = -1"
                    >
                        <span class="photo-tape" aria-hidden="true"></span>
                        <div class="contribution-link">
                            <div
                                :id="`journey-contribution-${index}`"
                                class="card-rotator"
                            >
                                <a
                                    class="card-front"
                                    :aria-hidden="isFlipped(index)"
                                    :inert="isFlipped(index)"
                                    :href="group.destination"
                                    :aria-label="`Explore our inclusion journey: ${group.name}`"
                                    @click.prevent="
                                        emit('navigate', group.destination)
                                    "
                                >
                                    <img
                                        :src="group.image"
                                        :alt="group.statistic"
                                        :width="group.imageWidth"
                                        :height="group.imageHeight"
                                        decoding="async"
                                    />
                                </a>
                                <div
                                    class="card-back"
                                    :aria-hidden="!isFlipped(index)"
                                    :inert="!isFlipped(index)"
                                >
                                    <div
                                        class="back-scroll"
                                        role="region"
                                        :aria-label="`Our Contributions: ${group.name}`"
                                        :tabindex="isFlipped(index) ? 0 : -1"
                                        data-lenis-prevent
                                    >
                                        <p class="back-eyebrow">
                                            Our Contributions
                                        </p>
                                        <h4>{{ group.name }}</h4>
                                        <div class="contribution-list">
                                            <div
                                                v-for="item in group.contributions"
                                                :key="item.title"
                                                class="contribution-result"
                                            >
                                                <strong class="result-label">{{
                                                    item.title
                                                }}</strong>
                                                <p v-if="item.intro">
                                                    {{ item.intro }}
                                                </p>
                                                <ul v-if="item.points">
                                                    <li
                                                        v-for="point in item.points"
                                                        :key="point.text"
                                                    >
                                                        <strong
                                                            v-if="point.label"
                                                            >{{
                                                                point.label
                                                            }}
                                                            — </strong
                                                        ><em
                                                            v-if="
                                                                point.italicPrefix
                                                            "
                                                            >{{
                                                                point.italicPrefix
                                                            }}</em
                                                        >{{
                                                            point.italicPrefix
                                                                ? point.text.slice(
                                                                      point
                                                                          .italicPrefix
                                                                          .length,
                                                                  )
                                                                : point.text
                                                        }}
                                                        <ul
                                                            v-if="
                                                                point.children
                                                            "
                                                        >
                                                            <li
                                                                v-for="child in point.children"
                                                                :key="child"
                                                            >
                                                                {{ child }}
                                                            </li>
                                                        </ul>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    <a
                                        class="back-explore"
                                        :href="group.destination"
                                        @click.prevent="
                                            emit('navigate', group.destination)
                                        "
                                        >Trace our inclusion journey
                                        <span aria-hidden="true">↗</span></a
                                    >
                                </div>
                            </div>
                        </div>
                        <div class="photo-caption">
                            <span
                                >{{ String(index + 1).padStart(2, "0") }} /
                                06</span
                            >
                            <p>{{ group.name }}</p>
                            <span aria-hidden="true">✦</span>
                        </div>
                    </div>
                    <button
                        type="button"
                        class="preview-button"
                        :aria-expanded="isFlipped(index)"
                        :aria-controls="`journey-contribution-${index}`"
                        :aria-label="`${isFlipped(index) ? 'Show illustration' : 'Preview contributions'}: ${group.name}`"
                        @click="togglePreview(index)"
                    >
                        <span>{{
                            isFlipped(index)
                                ? "Show illustration"
                                : "Preview contributions"
                        }}</span
                        ><span aria-hidden="true">↻</span>
                    </button>
                </article>
            </div>
        </div>

        <footer class="contributions-outro">
            <button
                type="button"
                class="explore-journey"
                @click="emit('close')"
            >
                Explore our inclusion journey <span aria-hidden="true">↗</span>
            </button>
        </footer>
    </section>
</template>

<style scoped>
.contributions-scene {
    --ink: #03316d;
    position: relative;
    isolation: isolate;
    background: var(--ink);
    color: #fffbed;
    font-family: var(--journey-body, system-ui, sans-serif);
    font-weight: 600;
    overflow: clip;
}
.contributions-intro {
    position: relative;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 90px max(28px, 8vw);
    text-align: center;
    isolation: isolate;
}
.scene-eyebrow {
    color: #a8d9f9;
    font-size: 15px;
    letter-spacing: 0.12em;
    margin: 0 0 24px;
}
.contributions-intro h2 {
    font-family: "Righteous", cursive;
    font-size: clamp(48px, 6.3vw, 96px);
    font-weight: 400;
    line-height: 1.15;
    margin: 0 0 34px;
    color: #fffbed;
}
.contributions-intro h2 span {
    color: #ffe45c;
}
.intro-copy {
    max-width: 970px;
    margin: 0;
    font-size: clamp(19px, 1.7vw, 26px);
    line-height: 1.65;
    color: #eef5ff;
}
.intro-copy strong {
    font-weight: 800;
}
.contribution-result em {
    font-style: italic;
}
.intro-scroll {
    display: flex;
    align-items: center;
    gap: 20px;
    color: #ffe45c;
    font-size: 18px;
    margin: 45px 0 0;
}
.intro-scroll span {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    width: 40px;
    border: 2px solid #ffe45c;
    border-radius: 50%;
    font-size: 24px;
}
.intro-bubbles,
.stage-bubbles {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: -1;
    overflow: hidden;
}
.intro-bubbles span,
.stage-bubbles span {
    position: absolute;
    display: block;
    border-radius: 50%;
}
.intro-bubbles span:nth-child(1) {
    width: 170px;
    height: 170px;
    background: #3f8be1;
    opacity: 0.3;
    top: 8%;
    left: -70px;
}
.intro-bubbles span:nth-child(2) {
    width: 38px;
    height: 38px;
    background: #f363ab;
    top: 15%;
    right: 13%;
}
.intro-bubbles span:nth-child(3) {
    width: 72px;
    height: 72px;
    border: 7px solid #a8d9f9;
    bottom: 14%;
    right: 4%;
    transform: rotate(-15deg);
}
.intro-bubbles span:nth-child(4) {
    width: 24px;
    height: 24px;
    background: #ffb145;
    bottom: 10%;
    left: 12%;
}
.contributions-stage {
    position: relative;
    padding: 62px 25px 70px;
    isolation: isolate;
}
.stage-heading {
    position: relative;
    text-align: center;
    z-index: 2;
    margin: 0 auto 50px;
}
.stage-heading .scene-eyebrow {
    font-size: 16px;
    margin-bottom: 15px;
}
.stage-heading h3 {
    font-family: "Righteous", cursive;
    font-weight: 400;
    font-size: clamp(34px, 4vw, 58px);
    line-height: 1.15;
    margin: 0;
    color: #fffbed;
}
.stage-heading h3 span {
    color: #ffe45c;
}
.stage-instruction {
    margin: 14px 0 0;
    color: #c8dff8;
    font-size: 16px;
}
.stage-bubbles span:nth-child(1) {
    width: 180px;
    height: 180px;
    background: #a8d9f9;
    opacity: 0.18;
    left: -70px;
    top: 18%;
}
.stage-bubbles span:nth-child(2) {
    width: 100px;
    height: 100px;
    background: #f363ab;
    right: 8%;
    top: 24%;
}
.stage-bubbles span:nth-child(3) {
    width: 32px;
    height: 32px;
    background: #ffe45c;
    left: 17%;
    top: 42%;
}
.stage-bubbles span:nth-child(4) {
    width: 75px;
    height: 75px;
    border: 7px solid #3f8be1;
    right: 16%;
    bottom: 9%;
}
.stage-bubbles span:nth-child(5) {
    width: 25px;
    height: 25px;
    background: #ffb145;
    left: 11%;
    bottom: 12%;
}
.contributions-photos {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 88px;
}
.contribution-card {
    width: min(100%, 560px);
    min-width: 0;
    position: relative;
    text-align: center;
}
.contribution-card:nth-child(odd) .photo-frame {
    --frame-rotation: -2deg;
}
.contribution-card:nth-child(even) .photo-frame {
    --frame-rotation: 2deg;
}
.photo-frame {
    position: relative;
    padding: 15px 15px 0;
    background: #fffbed;
    border: 3px solid #fffbed;
    border-radius: 25px;
    box-shadow:
        0 15px 0 #001f4d,
        0 26px 40px #00193380;
    transform: rotate(var(--frame-rotation));
}
.photo-tape {
    position: absolute;
    left: calc(50% - 40px);
    top: -14px;
    width: 80px;
    height: 30px;
    background: #ffe45cd6;
    transform: rotate(-6deg);
    z-index: 3;
    border-radius: 4px;
}
.contribution-link {
    display: block;
    color: inherit;
    text-decoration: none;
    perspective: 1200px;
    border-radius: 15px;
}
.card-rotator {
    display: grid;
    position: relative;
    min-height: 340px;
    aspect-ratio: var(--art-ratio);
    grid-template-rows: minmax(0, 1fr);
    transform-style: preserve-3d;
    transition: transform 0.65s cubic-bezier(0.2, 0.65, 0.25, 1);
}
.is-flipped .card-rotator {
    transform: rotateY(180deg);
}
.card-front,
.card-back {
    grid-area: 1 / 1;
    min-width: 0;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    border-radius: 16px;
}
.card-front {
    position: relative;
    overflow: hidden;
    align-self: center;
    aspect-ratio: var(--art-ratio);
}
.card-front img {
    display: block;
    position: absolute;
    top: 0;
    left: var(--art-left);
    width: var(--art-width);
    height: auto;
    max-width: none;
}
.card-back {
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    text-align: left;
    padding: clamp(20px, 2.4vw, 35px);
    transform: rotateY(180deg);
    background: #165195;
    color: #fffbed;
}
.back-scroll {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-width: thin;
    scrollbar-color: #a8d9f9 #165195;
    padding-right: 12px;
    overflow-wrap: anywhere;
}
.back-scroll:focus-visible {
    outline: 3px solid #ffe45c;
    outline-offset: -3px;
}
.contribution-result ul {
    list-style: disc;
    padding-left: 1.25em;
    margin: 0.65em 0 0;
    font-size: 16px;
    line-height: 1.55;
}
.contribution-result li + li {
    margin-top: 0.45em;
}
.contribution-result ul ul {
    margin-top: 0.4em;
}
.contribution-result li strong {
    font-weight: 750;
}
.back-eyebrow {
    font-family: "Righteous", cursive;
    font-size: 16px;
    letter-spacing: 0.08em;
    color: #ffe45c;
    margin: 0 0 15px;
}
.card-back h4 {
    font-family: var(--journey-body, system-ui, sans-serif);
    font-weight: 700;
    font-size: clamp(21px, 2.2vw, 30px);
    line-height: 1.2;
    margin: 0 0 23px;
    color: #fffbed;
}
.contribution-list {
    display: grid;
    gap: 24px;
    margin-bottom: 18px;
}
.contribution-result {
    min-width: 0;
}
.result-label {
    display: block;
    font-size: clamp(16px, 1.5vw, 21px);
    line-height: 1.25;
    font-weight: 700;
}
.contribution-result p {
    margin: 9px 0 0;
    font-size: clamp(16px, 1.3vw, 18px);
    line-height: 1.45;
    color: #d8edff;
}
.back-explore {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    border-top: 2px dashed #a8d9f966;
    padding-top: 13px;
    margin-top: 16px;
    flex: none;
    text-decoration: none;
    font-size: 16px;
    color: #a8d9f9;
}
.back-explore > span {
    font-size: 28px;
}
.photo-caption {
    display: flex;
    align-items: center;
    gap: 13px;
    min-height: 76px;
    text-align: left;
    color: var(--ink);
}
.photo-caption > span:first-child {
    font-family: "Righteous", cursive;
    font-size: 16px;
    white-space: nowrap;
    color: #23629a;
}
.photo-caption > p {
    flex: 1;
    margin: 0;
    font-family: var(--journey-body, system-ui, sans-serif);
    font-weight: 700;
    font-size: clamp(16px, 1.7vw, 24px);
    line-height: 1.25;
}
.photo-caption > span:last-child {
    font-size: 30px;
    color: #f363ab;
}
.preview-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-top: 28px;
    min-height: 43px;
    padding: 9px 22px;
    border: 2px solid #a8d9f9;
    border-radius: 99px;
    background: #03316d;
    color: #fffbed;
    font: inherit;
    font-size: 16px;
    cursor: pointer;
}
.preview-button > span:last-child {
    font-family: sans-serif;
    font-size: 23px;
    line-height: 1;
}
.preview-button:hover {
    background: #165195;
}
.card-front:focus-visible,
.back-explore:focus-visible,
.preview-button:focus-visible,
.explore-journey:focus-visible {
    outline: 4px solid #ffe45c;
    outline-offset: 6px;
}
.photo-progress {
    display: none;
}
.is-stacked .contributions-stage {
    height: 100dvh;
    min-height: 500px;
    padding: 30px 25px 45px;
    display: flex;
    flex-direction: column;
}
.is-stacked .stage-heading {
    margin-bottom: 0;
    flex-shrink: 0;
}
.is-stacked .stage-heading .scene-eyebrow {
    margin-bottom: 8px;
    font-size: 16px;
}
.is-stacked .stage-heading h3 {
    font-size: clamp(32px, 3.5vw, 50px);
}
.is-stacked .stage-instruction {
    margin-top: 8px;
    font-size: 16px;
}
.is-stacked .contributions-photos {
    position: relative;
    flex: 1;
    min-height: 0;
    display: grid;
    place-items: center;
}
.is-stacked .contribution-card {
    grid-area: 1 / 1;
    width: min(58vw, 680px, calc(100dvh - 220px));
}
.is-stacked .photo-frame {
    --frame-rotation: 0deg !important;
    padding: 10px 10px 0;
    border-radius: 21px;
}
.is-stacked .card-rotator {
    min-height: 0;
}
.is-stacked .photo-caption {
    min-height: 62px;
}
.is-stacked .photo-caption > p {
    font-size: clamp(16px, 1.7vw, 22px);
}
.is-stacked .preview-button {
    margin-top: 22px;
    min-height: 36px;
    padding: 6px 19px;
    font-size: 16px;
}
.is-stacked .photo-progress {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 9px;
    margin-top: 17px;
    flex-shrink: 0;
}
.photo-progress > span {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #4770a2;
}
.photo-progress > span.active {
    background: #ffe45c;
    transform: scale(1.3);
}
.photo-progress > strong {
    color: #c5ddf8;
    font-weight: 400;
    font-size: 16px;
    margin-left: 12px;
}
.contributions-outro {
    position: relative;
    padding: 95px 25px 100px;
    text-align: center;
}
.outro-spark {
    display: block;
    color: #f363ab;
    font-size: 55px;
    line-height: 1;
}
.contributions-outro > p {
    font-family: "Righteous", cursive;
    font-size: clamp(31px, 4.5vw, 64px);
    line-height: 1.25;
    margin: 25px 0 35px;
}
.contributions-outro > p > span {
    color: #a8d9f9;
}
.explore-journey {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 26px;
    min-height: 58px;
    padding: 14px 27px;
    border: 3px solid #ffe45c;
    border-radius: 99px;
    background: #ffe45c;
    box-shadow: 0 7px 0 #ffb145;
    color: #03316d;
    font: inherit;
    font-size: 21px;
    cursor: pointer;
    transition: transform 0.2s;
}
.explore-journey:hover {
    transform: translateY(-3px);
}
.explore-journey > span {
    font-size: 28px;
}
@media (min-width: 800px) and (max-height: 750px) {
    .is-stacked .contributions-stage {
        padding-top: 18px;
        padding-bottom: 20px;
    }
    .is-stacked .stage-heading .scene-eyebrow {
        display: none;
    }
    .is-stacked .stage-heading h3 {
        font-size: 29px;
    }
    .is-stacked .stage-instruction {
        font-size: 16px;
        margin-top: 5px;
    }
    .is-stacked .contribution-card {
        width: min(58vw, 620px, calc(100dvh - 180px));
    }
    .is-stacked .photo-caption {
        min-height: 48px;
    }
    .is-stacked .photo-caption > p {
        font-size: 15px;
    }
    .is-stacked .photo-caption > span:first-child {
        font-size: 14px;
    }
    .is-stacked .preview-button {
        margin-top: 18px;
        min-height: 30px;
        font-size: 16px;
        padding-block: 4px;
    }
    .is-stacked .card-back {
        padding: 16px;
    }
    .is-stacked .back-eyebrow {
        font-size: 14px;
        margin-bottom: 8px;
    }
    .is-stacked .card-back h4 {
        font-size: 19px;
        margin-bottom: 13px;
    }
    .is-stacked .contribution-list {
        gap: 13px;
        margin-bottom: 10px;
    }
    .is-stacked .contribution-result {
        gap: 12px;
    }
    .is-stacked .result-label {
        font-size: 14px;
    }
    .is-stacked .contribution-result p {
        font-size: 16px;
        margin-top: 5px;
    }
    .is-stacked .back-explore {
        font-size: 16px;
        padding-top: 6px;
    }
    .is-stacked .back-explore > span {
        font-size: 20px;
    }
    .is-stacked .photo-progress {
        margin-top: 10px;
    }
}
@media (max-width: 599px) {
    .contributions-intro {
        padding: 75px 26px;
    }
    .scene-eyebrow {
        font-size: 16px;
    }
    .contributions-intro h2 {
        font-size: clamp(38px, 9vw, 55px);
        margin-bottom: 25px;
    }
    .intro-copy {
        font-size: 18px;
        line-height: 1.65;
    }
    .intro-scroll {
        margin-top: 32px;
        font-size: 16px;
    }
    .contributions-stage {
        padding-inline: 26px;
    }
    .stage-heading .scene-eyebrow {
        font-size: 14px;
    }
    .stage-heading h3 {
        font-size: 35px;
    }
    .stage-instruction {
        font-size: 14px;
    }
    .contributions-photos {
        gap: 65px;
    }
    .photo-frame {
        padding: 9px 9px 0;
        border-radius: 21px;
    }
    .photo-caption {
        min-height: 70px;
        gap: 9px;
    }
    .photo-caption > p {
        font-size: 16px;
    }
    .photo-caption > span:first-child {
        font-size: 14px;
    }
    .card-back {
        padding: 21px;
    }
    .card-back h4 {
        font-size: 22px;
        margin-bottom: 17px;
    }
    .contribution-list {
        gap: 17px;
    }
    .contribution-result {
        gap: 12px;
    }
    .result-label {
        font-size: 16px;
    }
    .contribution-result p {
        font-size: 16px;
    }
    .back-explore {
        font-size: 16px;
    }
    .preview-button {
        font-size: 15px;
    }
    .contributions-outro {
        padding: 70px 24px 85px;
    }
    .explore-journey {
        font-size: 17px;
        gap: 14px;
        padding-inline: 20px;
    }
}
@media (prefers-reduced-motion: reduce) {
    .card-rotator,
    .explore-journey {
        transition: none;
    }
}
</style>
