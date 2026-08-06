<script setup lang="ts">
import { computed } from "vue";

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
</script>

<template>
    <svg
        class="chromosome-illustration"
        viewBox="0 0 960 600"
        role="img"
        :aria-label="illustrationLabel"
    >
        <title>
            Person and chromosome with ABCC11
            {{ genomeStyle.alleles.join("") }} alleles
        </title>

        <g :fill="genomeStyle.personColor" aria-hidden="true">
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
    </svg>
</template>

<style scoped>
.chromosome-illustration {
    display: block;
    width: 100%;
    height: auto;
    overflow: visible;
}

.chromosome-branch {
    fill: none;
    stroke: #ffd05a;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 58;
}

.allele-band {
    stroke-linecap: round;
    stroke-width: 28;
}

.allele-label {
    font-family: var(--font-righteous), sans-serif;
    font-size: 92px;
    font-weight: 700;
    line-height: 1;
}
</style>
