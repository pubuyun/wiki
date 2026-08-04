<script setup lang="ts">
import { Molecule } from "openchemlib";
import { ref } from "vue";

const DEPICTOR_OPTIONS = {
    autoCrop: true,
    suppressChiralText: true,
    suppressCIPParity: true,
    suppressESR: true,
    noColorOnESRAndCIP: true,
    noStereoProblem: true,
} as const;

const definitions = {
    precursor: {
        name: "Cys-Gly-3M3SH",
        smiles: "[C@@](C)(CCO)(CCC)SC[C@H](N)C(=O)NCC(=O)O",
    },
    water: { name: "Water", smiles: "O" },
    cys3m3sh: {
        name: "Cys-3M3SH",
        smiles: "[C@@](C)(CCO)(CCC)SC[C@H](N)C(=O)O",
    },
    glycine: { name: "Glycine", smiles: "NCC(=O)O" },
    product: {
        name: "3M3SH",
        smiles: "[C@@](C)(CCO)(CCC)S",
    },
    ammonia: { name: "Ammonia", smiles: "N" },
    pyruvate: { name: "Pyruvate", smiles: "CC(=O)C(=O)[O-]" },
} as const;

function depict(definition: (typeof definitions)[keyof typeof definitions]) {
    return {
        ...definition,
        svg: Molecule.fromSmiles(definition.smiles).toSVG(
            320,
            150,
            undefined,
            DEPICTOR_OPTIONS,
        ),
    };
}

const compounds = Object.fromEntries(
    Object.entries(definitions).map(([key, definition]) => [
        key,
        depict(definition),
    ]),
) as Record<keyof typeof definitions, ReturnType<typeof depict>>;

const pathway = ref<HTMLElement | null>(null);

function getAnimationTargets() {
    const root = pathway.value;

    return {
        pepVArrows: Array.from(
            root?.querySelectorAll<SVGPathElement>(
                '[data-pathway-arrow="pepV"]',
            ) ?? [],
        ),
        pepVProducts: Array.from(
            root?.querySelectorAll<HTMLElement>(
                '[data-pathway-reveal="pepV"]',
            ) ?? [],
        ),
        patBArrows: Array.from(
            root?.querySelectorAll<SVGPathElement>(
                '[data-pathway-arrow="patB"]',
            ) ?? [],
        ),
        patBProducts: Array.from(
            root?.querySelectorAll<HTMLElement>(
                '[data-pathway-reveal="patB"]',
            ) ?? [],
        ),
    };
}

defineExpose({ getAnimationTargets });
</script>

<template>
    <aside ref="pathway" class="pathway" aria-label="3M3SH biochemical pathway">
        <div class="pathway__row pathway__row--reactants">
            <article
                data-pathway-reveal="pepV"
                class="molecule molecule--small pathway__side"
            >
                <div
                    class="molecule__structure molecule__structure--water"
                    role="img"
                    :aria-label="`${compounds.water.name} 2D structure`"
                    v-html="compounds.water.svg"
                />
                <h2>{{ compounds.water.name }}</h2>
            </article>

            <span
                data-pathway-reveal="pepV"
                class="pathway__plus"
                aria-hidden="true"
                >+</span
            >

            <article class="molecule molecule--main pathway__main">
                <div
                    class="molecule__structure"
                    role="img"
                    :aria-label="`${compounds.precursor.name} 2D structure`"
                    v-html="compounds.precursor.svg"
                />
                <h2>{{ compounds.precursor.name }}</h2>
            </article>
        </div>

        <div class="reaction-arrow">
            <span data-pathway-reveal="pepV" class="reaction-arrow__enzyme"
                >PepV</span
            >
            <svg
                viewBox="0 0 100 82"
                preserveAspectRatio="none"
                aria-hidden="true"
            >
                <defs>
                    <marker
                        id="arrow-pepv"
                        markerWidth="7"
                        markerHeight="7"
                        refX="6"
                        refY="3.5"
                        orient="auto"
                    >
                        <path
                            class="reaction-arrow__head"
                            d="M0,0 L7,3.5 L0,7 Z"
                        />
                    </marker>
                </defs>
                <path data-pathway-arrow="pepV" d="M74 3 V30" />
                <path
                    data-pathway-arrow="pepV"
                    d="M74 30 V75"
                    marker-end="url(#arrow-pepv)"
                />
                <path
                    data-pathway-arrow="pepV"
                    d="M74 30 H25 V75"
                    marker-end="url(#arrow-pepv)"
                />
            </svg>
        </div>

        <div class="pathway__row pathway__row--products">
            <article
                data-pathway-reveal="pepV"
                class="molecule molecule--side-product pathway__side"
            >
                <div
                    class="molecule__structure"
                    role="img"
                    :aria-label="`${compounds.glycine.name} 2D structure`"
                    v-html="compounds.glycine.svg"
                />
                <h2>{{ compounds.glycine.name }}</h2>
            </article>

            <article
                data-pathway-reveal="pepV"
                class="molecule molecule--main pathway__main"
            >
                <div
                    class="molecule__structure"
                    role="img"
                    :aria-label="`${compounds.cys3m3sh.name} 2D structure`"
                    v-html="compounds.cys3m3sh.svg"
                />
                <h2>{{ compounds.cys3m3sh.name }}</h2>
            </article>
        </div>

        <div class="reaction-arrow">
            <span data-pathway-reveal="patB" class="reaction-arrow__enzyme"
                >PatB</span
            >
            <svg
                viewBox="0 0 100 82"
                preserveAspectRatio="none"
                aria-hidden="true"
            >
                <defs>
                    <marker
                        id="arrow-patb"
                        markerWidth="7"
                        markerHeight="7"
                        refX="6"
                        refY="3.5"
                        orient="auto"
                    >
                        <path
                            class="reaction-arrow__head"
                            d="M0,0 L7,3.5 L0,7 Z"
                        />
                    </marker>
                </defs>
                <path data-pathway-arrow="patB" d="M74 3 V30" />
                <path
                    data-pathway-arrow="patB"
                    d="M74 30 V75"
                    marker-end="url(#arrow-patb)"
                />
                <path
                    data-pathway-arrow="patB"
                    d="M74 30 H25 V75"
                    marker-end="url(#arrow-patb)"
                />
            </svg>
        </div>

        <div class="pathway__row pathway__row--products">
            <div
                data-pathway-reveal="patB"
                class="pathway__byproducts pathway__side"
            >
                <article class="molecule molecule--tiny">
                    <div
                        class="molecule__structure"
                        role="img"
                        :aria-label="`${compounds.ammonia.name} 2D structure`"
                        v-html="compounds.ammonia.svg"
                    />
                    <h2>{{ compounds.ammonia.name }}</h2>
                </article>
                <span class="pathway__plus" aria-hidden="true">+</span>
                <article class="molecule molecule--tiny">
                    <div
                        class="molecule__structure"
                        role="img"
                        :aria-label="`${compounds.pyruvate.name} 2D structure`"
                        v-html="compounds.pyruvate.svg"
                    />
                    <h2>{{ compounds.pyruvate.name }}</h2>
                </article>
            </div>

            <article
                data-pathway-reveal="patB"
                class="molecule molecule--main pathway__main"
            >
                <div
                    class="molecule__structure"
                    role="img"
                    :aria-label="`${compounds.product.name} 2D structure`"
                    v-html="compounds.product.svg"
                />
                <h2>{{ compounds.product.name }}</h2>
            </article>
        </div>
    </aside>
</template>

<style scoped>
.pathway {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
    padding: clamp(0.65rem, 1.5svh, 1.15rem);
    overflow: visible;
    color: #173e42;
}

.pathway__row {
    display: grid;
    grid-template-columns: minmax(0, 46%) minmax(0, 54%);
    align-items: center;
    min-height: clamp(4.3rem, 10.5svh, 7rem);
}

.pathway__row--reactants {
    position: relative;
}

.pathway__side {
    grid-column: 1;
}

.pathway__main {
    grid-column: 2;
}

.pathway__row--reactants .pathway__side,
.pathway__row--reactants .pathway__main {
    grid-row: 1;
}

.pathway__plus {
    font-size: clamp(1rem, 2svh, 1.35rem);
    font-weight: 800;
}

.pathway__row--reactants > .pathway__plus {
    position: absolute;
    left: 46%;
    transform: translateX(-50%);
}

.molecule {
    min-width: 0;
    text-align: center;
    will-change: transform, opacity;
}

[data-pathway-reveal] {
    visibility: hidden;
    opacity: 0;
    transform: translateY(12px);
}

.molecule h2 {
    margin: 0;
    font-size: clamp(0.75rem, 1.45svh, 1.02rem);
    line-height: 1.08;
}

.molecule__structure {
    height: clamp(3.8rem, 9.8svh, 6.7rem);
}

.molecule--small .molecule__structure,
.molecule--tiny .molecule__structure {
    height: clamp(2.8rem, 6.4svh, 4.5rem);
}

.molecule--side-product .molecule__structure {
    height: clamp(3.2rem, 7.4svh, 5.1rem);
}

.molecule__structure :deep(svg) {
    display: block;
    width: 100%;
    height: 100%;
    overflow: visible;
}

.molecule__structure--water :deep(text) {
    fill: #000 !important;
}

.reaction-arrow {
    position: relative;
    height: clamp(4.2rem, 10svh, 6.5rem);
}

.reaction-arrow svg {
    display: block;
    width: 100%;
    height: 100%;
    overflow: visible;
}

.reaction-arrow svg > path:not(.reaction-arrow__head) {
    fill: none;
    stroke: currentColor;
    stroke-width: 2.2;
    stroke-linecap: round;
    stroke-linejoin: round;
    vector-effect: non-scaling-stroke;
}

[data-pathway-arrow] {
    visibility: hidden;
    opacity: 0;
}

.reaction-arrow__head {
    fill: currentColor;
}

.reaction-arrow__enzyme {
    position: absolute;
    z-index: 1;
    top: 24%;
    left: 78%;
    padding: 0.12rem 0.3rem;
    font-size: clamp(0.78rem, 1.5svh, 1.05rem);
    font-weight: 800;
    border-radius: 0.25rem;
    background: #b6fbf1;
}

.pathway__byproducts {
    display: grid;
    grid-template-columns: minmax(0, 0.8fr) auto minmax(0, 1.35fr);
    align-items: center;
    gap: 0.05rem;
    will-change: transform, opacity;
}
</style>
