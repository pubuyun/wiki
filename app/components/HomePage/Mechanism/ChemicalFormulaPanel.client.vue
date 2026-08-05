<script setup lang="ts">
import SmilesDrawer from "smiles-drawer";
import { onMounted, ref } from "vue";

const DRAWER_OPTIONS = {
    width: 640,
    height: 300,
    bondThickness: 2.4,
    bondLength: 48,
    fontSizeLarge: 22,
    fontSizeSmall: 8,
    padding: 16,
    // Draw carboxyl groups as C=O / C-O instead of compact labels such as COOH.
    compactDrawing: false,
    // Preserve stereochemistry without printing the alpha-carbon H explicitly.
    explicitHydrogens: false,
    isomeric: true,
} as const;

const definitions = {
    precursor: {
        name: "Cys-Gly-3M3SH",
        smiles: "CCC[C@@](C)(CCO)SC[C@H](N)C(=O)NCC(=O)O",
    },
    water: { name: "Water", smiles: "O" },
    cys3m3sh: {
        name: "Cys-3M3SH",
        smiles: "CCC[C@@](C)(CCO)SC[C@H](N)C(=O)O",
    },
    glycine: { name: "Glycine", smiles: "NCC(=O)O" },
    product: {
        name: "3M3SH",
        smiles: "CCC[C@@](C)(CCO)S",
    },
    ammonia: { name: "Ammonia", smiles: "N" },
    pyruvate: { name: "Pyruvic acid", smiles: "CC(=O)C(=O)O" },
} as const;

const compounds = definitions;

const pathway = ref<HTMLElement | null>(null);
const precursorSvg = ref<SVGSVGElement | null>(null);
const cys3m3shSvg = ref<SVGSVGElement | null>(null);
const glycineSvg = ref<SVGSVGElement | null>(null);
const productSvg = ref<SVGSVGElement | null>(null);
const pyruvateSvg = ref<SVGSVGElement | null>(null);

onMounted(() => {
    const drawer = new SmilesDrawer.SvgDrawer(DRAWER_OPTIONS);
    const drawings = [
        [definitions.precursor, precursorSvg.value],
        [definitions.cys3m3sh, cys3m3shSvg.value],
        [definitions.glycine, glycineSvg.value],
        [definitions.product, productSvg.value],
        [definitions.pyruvate, pyruvateSvg.value],
    ] as const;

    drawings.forEach(([definition, target]) => {
        if (!target) return;

        SmilesDrawer.parse(
            definition.smiles,
            (tree) => drawer.draw(tree, target, "light"),
            (error) => {
                throw error;
            },
        );
    });
});

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
                    class="molecule__structure molecule__structure--simple-formula"
                    role="img"
                    :aria-label="`${compounds.water.name} molecular formula: H2O`"
                >
                    <span class="molecule__simple-formula" aria-hidden="true"
                        >H<sub>2</sub
                        ><span
                            class="molecule__simple-formula-element molecule__simple-formula-element--oxygen"
                            >O</span
                        ></span
                    >
                </div>
                <h2>{{ compounds.water.name }}</h2>
            </article>

            <span
                data-pathway-reveal="pepV"
                class="pathway__plus"
                aria-hidden="true"
                >+</span
            >

            <article
                class="molecule molecule--main molecule--precursor pathway__main"
            >
                <div
                    class="molecule__structure"
                    role="img"
                    :aria-label="`${compounds.precursor.name} 2D structure`"
                >
                    <svg
                        ref="precursorSvg"
                        class="molecule__svg"
                        aria-hidden="true"
                    />
                </div>
                <h2>{{ compounds.precursor.name }}</h2>
            </article>
        </div>

        <div class="reaction-arrow reaction-arrow--pepv">
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
                <path
                    data-pathway-arrow="pepV"
                    class="reaction-arrow__path reaction-arrow__path--main"
                    d="M74 3 V75"
                    marker-end="url(#arrow-pepv)"
                />
                <path
                    data-pathway-arrow="pepV"
                    class="reaction-arrow__path reaction-arrow__path--side"
                    d="M74 30 H25 V75"
                    marker-end="url(#arrow-pepv)"
                />
            </svg>
        </div>

        <div
            class="pathway__row pathway__row--products pathway__row--pepv-products"
        >
            <article
                data-pathway-reveal="pepV"
                class="molecule molecule--side-product pathway__side"
            >
                <div
                    class="molecule__structure"
                    role="img"
                    :aria-label="`${compounds.glycine.name} 2D structure`"
                >
                    <svg
                        ref="glycineSvg"
                        class="molecule__svg"
                        aria-hidden="true"
                    />
                </div>
                <h2>{{ compounds.glycine.name }}</h2>
            </article>

            <article
                data-pathway-reveal="pepV"
                class="molecule molecule--main molecule--cys3m3sh pathway__main"
            >
                <div
                    class="molecule__structure"
                    role="img"
                    :aria-label="`${compounds.cys3m3sh.name} 2D structure`"
                >
                    <svg
                        ref="cys3m3shSvg"
                        class="molecule__svg"
                        aria-hidden="true"
                    />
                </div>
                <h2>{{ compounds.cys3m3sh.name }}</h2>
            </article>
        </div>

        <div class="reaction-arrow reaction-arrow--patb">
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
                <path
                    data-pathway-arrow="patB"
                    class="reaction-arrow__path reaction-arrow__path--main"
                    d="M74 3 V75"
                    marker-end="url(#arrow-patb)"
                />
                <path
                    data-pathway-arrow="patB"
                    class="reaction-arrow__path reaction-arrow__path--side"
                    d="M74 30 H25 V75"
                    marker-end="url(#arrow-patb)"
                />
            </svg>
        </div>

        <div
            class="pathway__row pathway__row--products pathway__row--patb-products"
        >
            <div
                data-pathway-reveal="patB"
                class="pathway__byproducts pathway__side"
            >
                <article class="molecule molecule--tiny molecule--ammonia">
                    <div
                        class="molecule__structure molecule__structure--simple-formula"
                        role="img"
                        :aria-label="`${compounds.ammonia.name} molecular formula: NH3`"
                    >
                        <span
                            class="molecule__simple-formula"
                            aria-hidden="true"
                            ><span
                                class="molecule__simple-formula-element molecule__simple-formula-element--nitrogen"
                                >N</span
                            >H<sub>3</sub></span
                        >
                    </div>
                    <h2>{{ compounds.ammonia.name }}</h2>
                </article>
                <span class="pathway__plus" aria-hidden="true">+</span>
                <article class="molecule molecule--tiny">
                    <div
                        class="molecule__structure"
                        role="img"
                        :aria-label="`${compounds.pyruvate.name} 2D structure`"
                    >
                        <svg
                            ref="pyruvateSvg"
                            class="molecule__svg"
                            aria-hidden="true"
                        />
                    </div>
                    <h2>{{ compounds.pyruvate.name }}</h2>
                </article>
            </div>

            <article
                data-pathway-reveal="patB"
                class="molecule molecule--main molecule--product pathway__main"
            >
                <div
                    class="molecule__structure"
                    role="img"
                    :aria-label="`${compounds.product.name} 2D structure`"
                >
                    <svg
                        ref="productSvg"
                        class="molecule__svg"
                        aria-hidden="true"
                    />
                </div>
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
    font-family: var(--font-belanosima);
    color: #173e42;
    translate: clamp(0.75rem, 1.5vw, 1.5rem) 0;
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

.pathway__row--reactants .molecule {
    position: relative;
}

.pathway__row--reactants .pathway__side h2,
.pathway__row--reactants .pathway__main h2 {
    position: absolute;
    width: 100%;
}

.pathway__row--reactants .pathway__side h2 {
    top: clamp(5.6rem, 12.8svh, 9.8rem);
}

.pathway__row--reactants .pathway__main h2 {
    top: clamp(6.6rem, 16.2svh, 12rem);
}

.pathway__plus {
    display: grid;
    place-items: center;
    font-size: clamp(1rem, 2svh, 1.35rem);
    font-weight: 800;
    line-height: 1;
}

.pathway__row--reactants > .pathway__plus {
    position: absolute;
    left: 42%;
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
    font-size: clamp(0.9rem, 1.7svh, 1.2rem);
    line-height: 1.08;
}

.molecule--precursor h2 {
    color: #124c96;
}

.molecule--cys3m3sh h2 {
    color: #f18d0c;
}

.molecule--product h2 {
    color: #ff3e89;
}

.molecule__structure {
    height: clamp(7.6rem, 19.6svh, 13.4rem);
}

.molecule--small .molecule__structure,
.molecule--tiny .molecule__structure {
    height: clamp(5.6rem, 12.8svh, 9rem);
}

.molecule--side-product .molecule__structure {
    height: clamp(6.4rem, 14.8svh, 10.2rem);
}

.pathway__row--pepv-products .pathway__side h2 {
    transform: translateY(clamp(0.3rem, 1.2svh, 0.8rem));
}

.pathway__row--pepv-products .pathway__main h2 {
    transform: translateY(clamp(-0.8rem, -1.2svh, -0.3rem));
}

.pathway__row--patb-products > .pathway__main h2 {
    transform: translateY(clamp(-2.2rem, -3.4svh, -1rem));
}

.molecule__structure :deep(svg) {
    display: block;
    width: 100%;
    height: 100%;
    overflow: visible;
}

.molecule__structure--simple-formula {
    display: grid;
    place-items: center;
}

.molecule__simple-formula {
    font-family: var(--font-belanosima);
    font-size: 1.8rem;
    font-weight: 500;
    line-height: 1;
    color: #000;
    transform: translateY(clamp(0.45rem, 1svh, 0.75rem));
}

.molecule__simple-formula sub {
    font-size: 0.58em;
}

.molecule__simple-formula-element--oxygen {
    color: #e74c3c;
}

.molecule__simple-formula-element--nitrogen {
    color: #3498db;
}

.reaction-arrow {
    position: relative;
    height: clamp(4.2rem, 10svh, 6.5rem);
}

.reaction-arrow--pepv {
    color: #f18d0c;
}

.reaction-arrow--patb {
    color: #bd2f63;
}

.reaction-arrow svg {
    display: block;
    width: 100%;
    height: 100%;
    overflow: visible;
}

.reaction-arrow__path {
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    vector-effect: non-scaling-stroke;
}

.reaction-arrow__path--main {
    stroke-width: 2.2;
}

.reaction-arrow__path--side {
    stroke-width: 2.2;
    stroke-dasharray: 9 6;
    animation: pathway-side-flow 0.75s linear infinite;
}

@keyframes pathway-side-flow {
    to {
        stroke-dashoffset: -15;
    }
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
    left: 83%;
    padding: 0.12rem 0.3rem;
    font-size: clamp(0.78rem, 1.5svh, 1.05rem);
    font-weight: 800;
    border-radius: 0.25rem;
    background: #b6fbf1;
}

.pathway__byproducts {
    display: grid;
    grid-template-columns: minmax(3.5rem, 0.7fr) auto minmax(6rem, 1.55fr);
    align-items: center;
    gap: clamp(0.6rem, 1.4vw, 1.1rem);
    width: 112%;
    margin-left: -12%;
    will-change: transform, opacity;
}

.pathway__byproducts > .pathway__plus {
    align-self: center;
    justify-self: center;
}

@media (orientation: portrait) {
    .pathway {
        display: grid;
        grid-template-columns:
            minmax(0, 1.15fr) minmax(2.5rem, 0.42fr) minmax(0, 1.15fr)
            minmax(2.5rem, 0.42fr) minmax(0, 1.15fr);
        align-items: stretch;
        justify-content: initial;
        gap: clamp(0.1rem, 0.6vw, 0.35rem);
        padding: clamp(0.35rem, 1.5vw, 0.75rem);
        translate: 0;
    }

    .pathway__row {
        grid-template-columns: 1fr;
        grid-template-rows: repeat(2, minmax(0, 1fr));
        min-height: 0;
    }

    .pathway__side,
    .pathway__main {
        grid-column: 1;
    }

    .pathway__side {
        grid-row: 1;
    }

    .pathway__main {
        grid-row: 2;
    }

    .pathway__row--products .pathway__main {
        grid-row: 1;
    }

    .pathway__row--products .pathway__side {
        grid-row: 2;
    }

    .pathway__row--reactants .pathway__main {
        grid-row: 1;
    }

    .pathway__row--reactants .pathway__side {
        grid-row: 2;
    }

    .pathway__row--reactants .pathway__side h2,
    .pathway__row--reactants .pathway__main h2 {
        position: static;
    }

    .pathway__row--reactants > .pathway__plus {
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }

    .molecule h2 {
        font-size: clamp(0.58rem, 2.1vw, 0.82rem);
        line-height: 1;
    }

    .molecule__structure,
    .molecule--small .molecule__structure,
    .molecule--tiny .molecule__structure,
    .molecule--side-product .molecule__structure {
        height: clamp(3.25rem, 9svh, 5rem);
    }

    .molecule__simple-formula {
        font-size: clamp(1rem, 4vw, 1.45rem);
        transform: none;
    }

    .pathway__row--pepv-products .pathway__side h2,
    .pathway__row--pepv-products .pathway__main h2,
    .pathway__row--patb-products > .pathway__main h2 {
        transform: none;
    }

    .reaction-arrow {
        align-self: center;
        height: clamp(2.5rem, 10vw, 4rem);
    }

    .reaction-arrow svg {
        transform: rotate(-90deg);
    }

    .reaction-arrow__enzyme {
        top: -12%;
        left: 50%;
        font-size: clamp(0.62rem, 2.2vw, 0.8rem);
        transform: translate(-50%, -50%);
    }

    .pathway__byproducts {
        grid-template-columns: minmax(0, 1fr) auto minmax(0, 1.35fr);
        gap: clamp(0.1rem, 0.5vw, 0.3rem);
        width: 100%;
        margin-left: 0;
    }
}
</style>
