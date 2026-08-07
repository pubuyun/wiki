<script setup lang="ts">
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { computed, onMounted, onUnmounted, ref } from "vue";

gsap.registerPlugin(ScrollTrigger);

type Genome = 0 | 1 | 2;

const props = withDefaults(
    defineProps<{
        genome?: Genome;
    }>(),
    {
        genome: 1,
    },
);

const GENOME_STYLES = {
    0: {
        alleles: ["C", "C"],
        personColor: "#FF503D",
    },
    1: {
        alleles: ["T", "C"],
        personColor: "#0776F9",
    },
    2: {
        alleles: ["T", "T"],
        personColor: "#64DBBB",
    },
} as const;

const genomeStyle = computed(() => GENOME_STYLES[props.genome]);
const illustrationLabel = computed(
    () =>
        `A person with the ABCC11 ${genomeStyle.value.alleles.join("")} genotype`,
);
const alleleColor = (allele: "T" | "C") =>
    allele === "T" ? "#64DBBB" : "#FF503D";

const root = ref<SVGSVGElement | null>(null);
const person = ref<SVGGElement | null>(null);
const alleleReveal = ref<SVGGElement | null>(null);

let media: gsap.MatchMedia | undefined;

onMounted(() => {
    if (!root.value || !person.value || !alleleReveal.value) return;

    media = gsap.matchMedia();
    media.add(
        {
            reduceMotion: "(prefers-reduced-motion: reduce)",
            allowMotion: "(prefers-reduced-motion: no-preference)",
        },
        (context) => {
            const { reduceMotion } = context.conditions as {
                reduceMotion: boolean;
            };
            const alleleBands = gsap.utils.toArray<SVGLineElement>(
                ".allele-band",
                alleleReveal.value,
            );
            const alleleLabels = gsap.utils.toArray<SVGTextElement>(
                ".allele-label",
                alleleReveal.value,
            );

            if (reduceMotion) {
                gsap.set(person.value, { fill: genomeStyle.value.personColor });
                gsap.set([...alleleBands, ...alleleLabels], {
                    autoAlpha: 1,
                    x: 0,
                    scale: 1,
                });
                return;
            }

            const timeline = gsap.timeline({
                defaults: { ease: "power3.out" },
                scrollTrigger: {
                    trigger: root.value,
                    start: "top 92%",
                    once: true,
                },
            });

            timeline
                .fromTo(
                    alleleBands,
                    { autoAlpha: 0, x: -120 },
                    {
                        autoAlpha: 1,
                        x: 0,
                        duration: 0.62,
                        stagger: 0.13,
                    },
                )
                .addLabel("allelesArrived", "-=0.15")
                .fromTo(
                    alleleLabels,
                    {
                        autoAlpha: 0,
                        x: -24,
                        scale: 0.78,
                        transformOrigin: "50% 50%",
                    },
                    {
                        autoAlpha: 1,
                        x: 0,
                        scale: 1,
                        duration: 0.38,
                        stagger: 0.08,
                    },
                    "allelesArrived",
                )
                .to(
                    person.value,
                    {
                        fill: genomeStyle.value.personColor,
                        duration: 0.55,
                    },
                    "allelesArrived",
                );
        },
        root.value,
    );
});

onUnmounted(() => {
    media?.revert();
});
</script>

<template>
    <svg
        ref="root"
        class="chromosome-illustration"
        viewBox="0 0 960 600"
        role="img"
        :aria-label="illustrationLabel"
    >
        <title>
            Person and chromosome with ABCC11
            {{ genomeStyle.alleles.join("") }} alleles
        </title>

        <g ref="person" class="chromosome-person" aria-hidden="true">
            <circle cx="180" cy="150" r="104" />
            <path
                d="M48 541v-55c0-128 50-236 132-236s132 108 132 236v55c0 31-24 55-55 55H103c-31 0-55-24-55-55Z"
            />
        </g>

        <g aria-hidden="true">
            <path
                class="chromosome-branch"
                d="M552 92c-4 105 1 169 36 220 18 27 48 38 66 61 35 45 55 98 66 151"
            />
            <path
                class="chromosome-branch"
                d="M754 92c4 105-1 169-36 220-18 27-48 38-66 61-35 45-55 98-66 151"
            />
            <circle cx="653" cy="356" r="17" fill="#FFF7F2" />

            <g ref="alleleReveal" class="allele-reveal">
                <line
                    x1="520"
                    y1="155"
                    x2="579"
                    y2="151"
                    :stroke="alleleColor(genomeStyle.alleles[0])"
                    class="allele-band"
                />
                <line
                    x1="727"
                    y1="151"
                    x2="786"
                    y2="155"
                    :stroke="alleleColor(genomeStyle.alleles[1])"
                    class="allele-band"
                />

                <text
                    x="465"
                    y="171"
                    text-anchor="middle"
                    :fill="alleleColor(genomeStyle.alleles[0])"
                    class="allele-label"
                >
                    {{ genomeStyle.alleles[0] }}
                </text>
                <text
                    x="842"
                    y="171"
                    text-anchor="middle"
                    :fill="alleleColor(genomeStyle.alleles[1])"
                    class="allele-label"
                >
                    {{ genomeStyle.alleles[1] }}
                </text>
            </g>
        </g>
    </svg>
</template>

<style scoped>
.chromosome-illustration {
    display: block;
    width: 100%;
    height: auto;
    overflow: visible;
}

.chromosome-person {
    fill: #9aa3ad;
    will-change: fill;
}

.allele-reveal {
    pointer-events: none;
}

.chromosome-branch {
    fill: none;
    stroke: #ffd05a;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 58;
}

.allele-band {
    visibility: hidden;
    opacity: 0;
    stroke-linecap: round;
    stroke-width: 28;
    will-change: transform, opacity;
}

.allele-label {
    visibility: hidden;
    opacity: 0;
    font-family: var(--font-righteous), sans-serif;
    font-size: 92px;
    font-weight: 700;
    line-height: 1;
    will-change: transform, opacity;
}
</style>
