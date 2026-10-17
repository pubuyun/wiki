<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cloudShapes } from "./cloud-shapes";

const balloonImage =
    "https://static.igem.wiki/teams/6133/wiki/hp/inclusivity/animation/ballon.avif";

const props = defineProps<{ scroller: HTMLElement }>();
const root = ref<HTMLElement>();
const balloon = ref<HTMLElement>();
const activeStep = ref(-1);
let media: gsap.MatchMedia | undefined;

const stops = [
    { cloud: "learn", x: 44, y: 80 },
    { cloud: "intervene", x: 58, y: 75 },
    { cloud: "feedback", x: 52, y: 48 },
    { cloud: "intervene", x: 58, y: 75 },
    { cloud: "feedback", x: 52, y: 48 },
    { cloud: "transfer", x: 55.5, y: 28 },
    { cloud: "beyond", x: 43, y: 22 },
];

const clouds = [
    {
        key: "beyond",
        letter: "+",
        title: "Beyond",
        shape: "round",
        color: "#58b8dc",
        points: [
            "Future plans for further development and impact beyond the scope of our project that could not be completed within the iGEM competition timeline",
        ],
    },
    {
        key: "transfer",
        letter: "T",
        title: "Transfer",
        shape: "wide",
        color: "#65d6bc",
        points: [
            "How we made our outputs replicable and adaptable by others",
            "What we have done to expand our impact, and carry our values forward",
        ],
    },
    {
        key: "feedback",
        letter: "F",
        title: "Feedback",
        shape: "round",
        color: "#ff547e",
        points: [
            "Dialogue and interviews with target groups and relevant experts",
            "Reflection on our methods",
        ],
    },
    {
        key: "learn",
        letter: "L",
        title: "Learn",
        shape: "wide",
        color: "#ffc400",
        points: [
            "Encounters that inspired us to explore inclusivity",
            "How we came to better understand the target groups and identify their barriers",
        ],
    },
    {
        key: "intervene",
        letter: "I",
        title: "Intervene",
        shape: "wide",
        color: "#ffb145",
        points: [
            "Methods and refinements to expand access and address identified barriers",
        ],
    },
] as const;

const visits = (key: string) =>
    stops.flatMap((stop, index) => (stop.cloud === key ? [index] : []));

onMounted(() => {
    if (!root.value || !balloon.value) return;
    gsap.registerPlugin(ScrollTrigger);
    media = gsap.matchMedia();
    media.add(
        {
            desktop: "(min-width: 760px) and (orientation: landscape)",
            compact: "(max-width: 759px), (orientation: portrait)",
            reduce: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
            const section = root.value!;
            const traveler = balloon.value!;
            const { desktop, reduce } = context.conditions!;
            activeStep.value = desktop && !reduce ? -1 : 6;
            if (!desktop || reduce) {
                traveler.style.removeProperty("transform");
                traveler.style.removeProperty("translate");
                traveler.style.removeProperty("scale");
                traveler.style.removeProperty("rotate");
            }
            if (reduce) return;
            if (!desktop) {
                section
                    .querySelectorAll<HTMLElement>(".lift-cloud-content")
                    .forEach((cloud) => {
                        gsap.fromTo(
                            cloud,
                            { autoAlpha: 0, y: 36 },
                            {
                                autoAlpha: 1,
                                y: 0,
                                ease: "power1.out",
                                scrollTrigger: {
                                    trigger: cloud.parentElement,
                                    scroller: props.scroller,
                                    start: "top 92%",
                                    end: "top 65%",
                                    scrub: 0.4,
                                    invalidateOnRefresh: true,
                                },
                            },
                        );
                    });
                return;
            }

            const position = { x: 54, y: 74 };
            const renderPosition = () =>
                gsap.set(traveler, {
                    x: (position.x * section.clientWidth) / 100,
                    y: (position.y * section.clientHeight) / 100,
                });
            const flags = section.querySelectorAll(".lift-flag");
            const iteration = section.querySelector(".lift-iteration");
            const cloudContent = section.querySelectorAll(
                ".lift-cloud-content",
            );
            gsap.set(cloudContent, { autoAlpha: 0, y: 48 });
            gsap.set(traveler, { xPercent: -50, yPercent: -50, scale: 1 });
            gsap.set(flags, {
                autoAlpha: 0,
                y: 24,
                scale: 0.25,
                transformOrigin: "20% 100%",
            });
            gsap.set(iteration, { autoAlpha: 0, scale: 0.8, y: 15 });
            renderPosition();
            const timeline = gsap.timeline({
                defaults: { ease: "sine.inOut" },
                scrollTrigger: {
                    id: "inclusivity-framework",
                    trigger: section,
                    scroller: props.scroller,
                    start: "top top",
                    end: () => `+=${props.scroller.clientHeight * 4.6}`,
                    pin: true,
                    pinSpacing: true,
                    scrub: 0.65,
                    invalidateOnRefresh: true,
                    refreshPriority: 2,
                    onRefresh: renderPosition,
                },
                onUpdate() {
                    activeStep.value =
                        this.time() < 1.05
                            ? -1
                            : Math.min(
                                  6,
                                  Math.floor((this.time() - 1.05) / 1.5),
                              );
                },
            });
            const revealed = new Set<string>();
            stops.forEach((stop, index) => {
                const at = index * 1.5;
                if (!revealed.has(stop.cloud)) {
                    revealed.add(stop.cloud);
                    timeline.to(
                        section.querySelector(
                            `.lift-cloud-${stop.cloud} .lift-cloud-content`,
                        ),
                        {
                            autoAlpha: 1,
                            y: 0,
                            duration: 0.7,
                            ease: "power2.out",
                        },
                        at,
                    );
                }
                timeline
                    .to(
                        position,
                        {
                            x: stop.x,
                            y: stop.y,
                            duration: 1,
                            onUpdate: renderPosition,
                        },
                        at,
                    )
                    .to(
                        traveler,
                        {
                            scale: 0.65,
                            rotation: index % 2 ? 5 : -5,
                            duration: 0.5,
                        },
                        at,
                    )
                    .to(traveler, { rotation: 0, duration: 0.5 }, at + 0.5)
                    .to(
                        section.querySelector(`[data-flag-visit="${index}"]`),
                        {
                            autoAlpha: 1,
                            y: 0,
                            scale: 1,
                            duration: 0.35,
                            ease: "back.out(2)",
                        },
                        at + 1.05,
                    )
                    .to({}, { duration: 0.1 }, at + 1.4);
            });
            timeline
                .to(
                    iteration,
                    {
                        autoAlpha: 1,
                        scale: 1,
                        y: 0,
                        duration: 0.45,
                        ease: "back.out(1.6)",
                    },
                    4.5,
                )
                .to(
                    iteration,
                    { autoAlpha: 0, scale: 0.9, duration: 0.35 },
                    7.9,
                );
            return () => {
                activeStep.value = -1;
            };
        },
        root.value,
    );
});

onBeforeUnmount(() => media?.revert());
</script>

<template>
    <section
        ref="root"
        class="lift-scene"
        data-journey-scene="framework"
        aria-labelledby="lift-title"
    >
        <h2 id="lift-title" class="visually-hidden">Our LIFT+ framework</h2>
        <svg
            v-for="n in 4"
            :key="n"
            class="sky-cloud"
            :class="`sky-cloud-${n}`"
            :viewBox="cloudShapes.wide.viewBox"
            preserveAspectRatio="none"
            aria-hidden="true"
        >
            <path :d="cloudShapes.wide.path" />
        </svg>
        <article
            v-for="cloud in clouds"
            :key="cloud.key"
            class="lift-cloud"
            :class="[
                `lift-cloud-${cloud.key}`,
                { 'is-current': stops[activeStep]?.cloud === cloud.key },
            ]"
            :style="{ '--cloud-color': cloud.color }"
        >
            <div class="lift-cloud-content">
                <div class="lift-flags" aria-hidden="true">
                    <svg
                        v-for="(visit, index) in visits(cloud.key)"
                        :key="visit"
                        class="lift-flag"
                        :class="{ 'second-flag': index === 1 }"
                        :data-flag-visit="visit"
                        viewBox="0 0 120 150"
                        overflow="visible"
                    >
                        <g
                            :transform="
                                cloud.key === 'feedback' ||
                                cloud.key === 'intervene'
                                    ? 'translate(120 0) scale(-1 1)'
                                    : undefined
                            "
                        >
                            <path
                                d="M14 13 L112 30 Q119 31 113 36 L14 81 Z"
                                fill="currentColor"
                            />
                            <path
                                d="M14 8 V145"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="12"
                                stroke-linecap="round"
                            />
                        </g>
                        <text
                            :x="
                                cloud.key === 'feedback' ||
                                cloud.key === 'intervene'
                                    ? 76
                                    : 44
                            "
                            y="62"
                            text-anchor="middle"
                        >
                            {{ cloud.letter }}
                        </text>
                    </svg>
                </div>
                <svg
                    class="lift-cloud-art"
                    :viewBox="cloudShapes[cloud.shape].viewBox"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                >
                    <path :d="cloudShapes[cloud.shape].path" />
                </svg>
                <div class="lift-cloud-copy">
                    <h3>{{ cloud.title }}</h3>
                    <ul>
                        <li v-for="point in cloud.points" :key="point">
                            {{ point }}
                        </li>
                    </ul>
                </div>
            </div>
        </article>
        <aside class="lift-iteration" aria-label="An iterative process">
            <svg
                :viewBox="cloudShapes.small.viewBox"
                preserveAspectRatio="none"
                aria-hidden="true"
            >
                <path :d="cloudShapes.small.path" />
            </svg>
            <p>
                I and F may iterate throughout the process, with each round of
                feedback informing further refinement.
            </p>
        </aside>
        <div ref="balloon" class="lift-balloon" aria-hidden="true">
            <img :src="balloonImage" alt="" width="944" height="1344" />
        </div>
    </section>
</template>

<style scoped>
.lift-scene {
    position: relative;
    isolation: isolate;
    container-type: size;
    height: 100dvh;
    min-height: 560px;
    overflow: hidden;
    background: #03316d;
    color: #03316d;
    font-family: var(--journey-body, system-ui, sans-serif);
    font-weight: 600;
}
.visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
}
.lift-cloud {
    position: absolute;
    z-index: 1;
}
.lift-cloud-content {
    position: relative;
    width: 100%;
    height: 100%;
}
.lift-cloud-art {
    position: absolute;
    z-index: 1;
    inset: 0;
    width: 100%;
    height: 100%;
    fill: #fff;
    overflow: visible;
}
.lift-cloud-copy {
    position: absolute;
    z-index: 2;
    inset: 0;
    text-align: center;
}
.lift-cloud h3 {
    position: absolute;
    top: var(--title-top, 29%);
    left: 15%;
    width: 70%;
    margin: 0;
    color: var(--cloud-color);
    font:
        400 min(2.5cqw, 3.8cqh)/1.1 var(--font-righteous),
        sans-serif;
}
.lift-cloud ul {
    position: absolute;
    inset: var(--body-top, 45%) 14% var(--body-bottom, 15%) 18%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    list-style: none;
    padding: 0;
    margin: 0;
    font-size: max(16px, min(1.3cqw, 2.2cqh));
    line-height: 1.3;
    overflow-wrap: anywhere;
}
.lift-cloud li + li {
    margin-top: 0.3em;
}
.lift-cloud li::before {
    content: "• ";
}
.lift-cloud-beyond {
    --title-top: 12%;
    --body-top: 30%;
    --body-bottom: 14%;
    left: 5.5%;
    top: 5.5%;
    width: 30%;
    height: 33%;
}
.lift-cloud-transfer {
    right: 1%;
    top: 15%;
    width: 39%;
    height: 35%;
}
.lift-cloud-feedback {
    --title-top: 24%;
    --body-top: 40%;
    --body-bottom: 14%;
    left: 17%;
    top: 39%;
    width: 32%;
    height: 28%;
}
.lift-cloud-learn {
    --title-top: 23%;
    --body-top: 43%;
    --body-bottom: 11%;
    left: 4%;
    bottom: 1%;
    width: 38%;
    height: 31%;
}
.lift-cloud-intervene {
    --title-top: 29%;
    --body-top: 49%;
    --body-bottom: 18%;
    right: 3%;
    bottom: 13%;
    width: 34%;
    height: 33%;
}
.lift-flags {
    position: absolute;
    z-index: 0;
    right: 18%;
    top: -17%;
    width: min(7cqw, 11cqh);
    height: min(9cqw, 14cqh);
    color: var(--cloud-color);
    rotate: -14deg;
}
.lift-flag {
    position: absolute;
    inset: 0;
    display: block;
}
.lift-flag text {
    fill: white;
    font:
        700 43px/1 var(--font-belanosima),
        sans-serif;
}
.second-flag {
    translate: 60% 13%;
    rotate: 8deg;
    scale: 0.8;
}
.lift-cloud-beyond .lift-flags {
    right: -4%;
    top: 9%;
    rotate: 21deg;
}
.lift-cloud-transfer .lift-flags {
    right: 47%;
    top: -23%;
}
.lift-cloud-feedback .lift-flags {
    right: 22%;
    top: -29%;
    rotate: 18deg;
}
.lift-cloud-learn .lift-flags {
    right: 62%;
    top: -7%;
}
.lift-cloud-intervene .lift-flags {
    right: 77%;
    top: 5%;
    rotate: -25deg;
}
.lift-iteration {
    position: absolute;
    z-index: 4;
    left: 49%;
    top: 4%;
    width: 20%;
    height: 28%;
    min-height: 225px;
    display: grid;
    place-items: center;
}
.lift-iteration svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    fill: white;
}
.lift-iteration p {
    position: relative;
    top: 3px;
    width: 64%;
    margin: 0;
    font-size: max(16px, min(1.15cqw, 2cqh));
    line-height: 1.35;
    text-align: center;
}
.lift-balloon {
    position: absolute;
    z-index: 5;
    left: 0;
    top: 0;
    width: 23%;
    pointer-events: none;
}
.lift-balloon img {
    display: block;
    width: 100%;
    height: auto;
}
.sky-cloud {
    position: absolute;
    z-index: -1;
    width: 34%;
    height: 23%;
    fill: #58a9eb;
    opacity: 0.25;
}
.sky-cloud-1 {
    left: -7%;
    top: 28%;
    rotate: -8deg;
}
.sky-cloud-2 {
    right: -10%;
    top: 35%;
    rotate: 10deg;
}
.sky-cloud-3 {
    left: -8%;
    bottom: 15%;
    width: 39%;
    height: 33%;
}
.sky-cloud-4 {
    right: 2%;
    bottom: -14%;
    width: 25%;
}
@media (max-width: 759px), (orientation: portrait) {
    .lift-scene {
        container-type: inline-size;
        height: auto;
        min-height: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 65px;
        padding: 90px 12px 290px;
    }
    .lift-scene .lift-cloud {
        position: relative;
        inset: auto;
        width: min(100%, 480px);
        height: 310px;
        flex: none;
    }
    .lift-scene .lift-cloud-beyond {
        height: 350px;
    }
    .lift-scene .lift-cloud-copy {
        inset: 0;
    }
    .lift-cloud h3 {
        font-size: 30px;
        margin: 0;
    }
    .lift-scene .lift-cloud ul {
        font-size: clamp(16px, 4.2vw, 18px);
        line-height: 1.3;
    }
    .lift-flags {
        width: 76px;
        height: 100px;
    }
    .lift-cloud-beyond .lift-flags {
        right: 0;
    }
    .lift-cloud-intervene .lift-flags {
        right: 70%;
    }
    .lift-iteration {
        position: relative;
        inset: auto;
        width: min(80%, 320px);
        height: 260px;
        flex: none;
    }
    .lift-iteration p {
        width: 64%;
        font-size: 17px;
    }
    .lift-balloon {
        left: 52%;
        top: auto;
        bottom: 15px;
        width: 165px;
        transform: translateX(-50%);
    }
    .sky-cloud {
        width: 80%;
        height: 250px;
    }
}
@media (prefers-reduced-motion: reduce) and (min-width: 760px) and (orientation: landscape) {
    .lift-balloon {
        left: 54%;
        top: 75%;
        transform: translate(-50%, -50%);
    }
}
</style>
