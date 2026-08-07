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
    <aside
        ref="pathway"
        class="pathway flex h-full translate-x-[clamp(0.75rem,1.5vw,1.5rem)] flex-col justify-center overflow-visible p-[clamp(0.65rem,1.5svh,1.15rem)] text-[#173e42] portrait:grid portrait:translate-x-0 portrait:grid-cols-[minmax(0,1.15fr)_minmax(2.5rem,0.42fr)_minmax(0,1.15fr)_minmax(2.5rem,0.42fr)_minmax(0,1.15fr)] portrait:items-stretch portrait:justify-normal portrait:gap-[clamp(0.1rem,0.6vw,0.35rem)] portrait:p-[clamp(0.35rem,1.5vw,0.75rem)]"
        aria-label="3M3SH biochemical pathway"
    >
        <div
            class="pathway__row pathway__row--reactants relative grid min-h-[clamp(4.3rem,10.5svh,7rem)] grid-cols-[minmax(0,46%)_minmax(0,54%)] items-center portrait:min-h-0 portrait:grid-cols-1 portrait:grid-rows-2"
        >
            <article
                data-pathway-reveal="pepV"
                class="molecule molecule--small pathway__side invisible relative col-start-1 row-start-1 min-w-0 translate-y-3 text-center opacity-0 will-change-[transform,opacity] portrait:row-start-2"
            >
                <div
                    class="molecule__structure molecule__structure--simple-formula grid h-[clamp(5.6rem,12.8svh,9rem)] place-items-center portrait:h-[clamp(3.25rem,9svh,5rem)]"
                    role="img"
                    :aria-label="`${compounds.water.name} molecular formula: H2O`"
                >
                    <span
                        class="molecule__simple-formula translate-y-[clamp(0.45rem,1svh,0.75rem)] text-[1.8rem] leading-none font-medium text-black portrait:translate-y-0 portrait:text-[clamp(1rem,4vw,1.45rem)] [&_sub]:text-[0.58em]"
                        aria-hidden="true"
                        >H<sub>2</sub
                        ><span
                            class="molecule__simple-formula-element molecule__simple-formula-element--oxygen text-[#e74c3c]"
                            >O</span
                        ></span
                    >
                </div>
                <h2
                    class="absolute top-[clamp(5.6rem,12.8svh,9.8rem)] m-0 w-full text-[clamp(0.9rem,1.7svh,1.2rem)] leading-[1.08] portrait:static portrait:text-[clamp(0.58rem,2.1vw,0.82rem)] portrait:leading-none"
                >
                    {{ compounds.water.name }}
                </h2>
            </article>

            <span
                data-pathway-reveal="pepV"
                class="pathway__plus invisible absolute left-[42%] grid -translate-x-1/2 translate-y-3 place-items-center text-[clamp(1rem,2svh,1.35rem)] leading-none font-extrabold opacity-0 portrait:top-1/2 portrait:left-1/2 portrait:-translate-x-1/2 portrait:-translate-y-1/2"
                aria-hidden="true"
                >+</span
            >

            <article
                class="molecule molecule--main molecule--precursor pathway__main relative col-start-2 row-start-1 min-w-0 text-center will-change-[transform,opacity] portrait:col-start-1 portrait:row-start-1"
            >
                <div
                    class="molecule__structure h-[clamp(7.6rem,19.6svh,13.4rem)] portrait:h-[clamp(3.25rem,9svh,5rem)]"
                    role="img"
                    :aria-label="`${compounds.precursor.name} 2D structure`"
                >
                    <svg
                        ref="precursorSvg"
                        class="molecule__svg block size-full overflow-visible"
                        aria-hidden="true"
                    />
                </div>
                <h2
                    class="absolute top-[clamp(6.6rem,16.2svh,12rem)] m-0 w-full text-[clamp(0.9rem,1.7svh,1.2rem)] leading-[1.08] text-[#124c96] portrait:static portrait:text-[clamp(0.58rem,2.1vw,0.82rem)] portrait:leading-none"
                >
                    {{ compounds.precursor.name }}
                </h2>
            </article>
        </div>

        <div
            class="reaction-arrow reaction-arrow--pepv relative h-[clamp(4.2rem,10svh,6.5rem)] text-[#f18d0c] portrait:h-[clamp(2.5rem,10vw,4rem)] portrait:self-center"
        >
            <span
                data-pathway-reveal="pepV"
                class="reaction-arrow__enzyme invisible absolute top-[24%] left-[76%] z-1 translate-y-3 rounded-sm bg-[#b6fbf1] px-[0.3rem] py-[0.12rem] text-[clamp(0.78rem,1.5svh,1.05rem)] font-extrabold opacity-0 portrait:top-[-12%] portrait:left-1/2 portrait:-translate-x-1/2 portrait:-translate-y-1/2 portrait:text-[clamp(0.62rem,2.2vw,0.8rem)]"
                >PepV</span
            >
            <svg
                class="block size-full overflow-visible portrait:-rotate-90"
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
                            class="reaction-arrow__head fill-current"
                            d="M0,0 L7,3.5 L0,7 Z"
                        />
                    </marker>
                </defs>
                <path
                    data-pathway-arrow="pepV"
                    class="reaction-arrow__path reaction-arrow__path--main invisible fill-none stroke-current [stroke-width:2.2] opacity-0 [stroke-linecap:round] [stroke-linejoin:round] [vector-effect:non-scaling-stroke]"
                    d="M74 3 V75"
                    marker-end="url(#arrow-pepv)"
                />
                <path
                    data-pathway-arrow="pepV"
                    class="reaction-arrow__path reaction-arrow__path--side invisible fill-none stroke-current [stroke-width:2.2] opacity-0 [stroke-dasharray:9_6] [stroke-linecap:round] [stroke-linejoin:round] [vector-effect:non-scaling-stroke]"
                    d="M74 30 H25 V75"
                    marker-end="url(#arrow-pepv)"
                />
            </svg>
        </div>

        <div
            class="pathway__row pathway__row--products pathway__row--pepv-products grid min-h-[clamp(4.3rem,10.5svh,7rem)] grid-cols-[minmax(0,46%)_minmax(0,54%)] items-center portrait:min-h-0 portrait:grid-cols-1 portrait:grid-rows-2"
        >
            <article
                data-pathway-reveal="pepV"
                class="molecule molecule--side-product pathway__side invisible col-start-1 min-w-0 translate-y-3 text-center opacity-0 will-change-[transform,opacity] portrait:row-start-2"
            >
                <div
                    class="molecule__structure h-[clamp(6.4rem,14.8svh,10.2rem)] portrait:h-[clamp(3.25rem,9svh,5rem)]"
                    role="img"
                    :aria-label="`${compounds.glycine.name} 2D structure`"
                >
                    <svg
                        ref="glycineSvg"
                        class="molecule__svg block size-full overflow-visible"
                        aria-hidden="true"
                    />
                </div>
                <h2
                    class="m-0 translate-y-[clamp(0.3rem,1.2svh,0.8rem)] text-[clamp(0.9rem,1.7svh,1.2rem)] leading-[1.08] portrait:translate-y-0 portrait:text-[clamp(0.58rem,2.1vw,0.82rem)] portrait:leading-none"
                >
                    {{ compounds.glycine.name }}
                </h2>
            </article>

            <article
                data-pathway-reveal="pepV"
                class="molecule molecule--main molecule--cys3m3sh pathway__main invisible col-start-2 min-w-0 translate-y-3 text-center opacity-0 will-change-[transform,opacity] portrait:col-start-1 portrait:row-start-1"
            >
                <div
                    class="molecule__structure h-[clamp(7.6rem,19.6svh,13.4rem)] portrait:h-[clamp(3.25rem,9svh,5rem)]"
                    role="img"
                    :aria-label="`${compounds.cys3m3sh.name} 2D structure`"
                >
                    <svg
                        ref="cys3m3shSvg"
                        class="molecule__svg block size-full overflow-visible"
                        aria-hidden="true"
                    />
                </div>
                <h2
                    class="m-0 translate-y-[clamp(-0.8rem,-1.2svh,-0.3rem)] text-[clamp(0.9rem,1.7svh,1.2rem)] leading-[1.08] text-[#f18d0c] portrait:translate-y-0 portrait:text-[clamp(0.58rem,2.1vw,0.82rem)] portrait:leading-none"
                >
                    {{ compounds.cys3m3sh.name }}
                </h2>
            </article>
        </div>

        <div
            class="reaction-arrow reaction-arrow--patb relative h-[clamp(4.2rem,10svh,6.5rem)] text-[#bd2f63] portrait:h-[clamp(2.5rem,10vw,4rem)] portrait:self-center"
        >
            <span
                data-pathway-reveal="patB"
                class="reaction-arrow__enzyme invisible absolute top-[24%] left-[76%] z-1 translate-y-3 rounded-sm bg-[#b6fbf1] px-[0.3rem] py-[0.12rem] text-[clamp(0.78rem,1.5svh,1.05rem)] font-extrabold opacity-0 portrait:top-[-12%] portrait:left-1/2 portrait:-translate-x-1/2 portrait:-translate-y-1/2 portrait:text-[clamp(0.62rem,2.2vw,0.8rem)]"
                >PatB</span
            >
            <svg
                class="block size-full overflow-visible portrait:-rotate-90"
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
                            class="reaction-arrow__head fill-current"
                            d="M0,0 L7,3.5 L0,7 Z"
                        />
                    </marker>
                </defs>
                <path
                    data-pathway-arrow="patB"
                    class="reaction-arrow__path reaction-arrow__path--main invisible fill-none stroke-current [stroke-width:2.2] opacity-0 [stroke-linecap:round] [stroke-linejoin:round] [vector-effect:non-scaling-stroke]"
                    d="M74 3 V75"
                    marker-end="url(#arrow-patb)"
                />
                <path
                    data-pathway-arrow="patB"
                    class="reaction-arrow__path reaction-arrow__path--side invisible fill-none stroke-current [stroke-width:2.2] opacity-0 [stroke-dasharray:9_6] [stroke-linecap:round] [stroke-linejoin:round] [vector-effect:non-scaling-stroke]"
                    d="M74 30 H25 V75"
                    marker-end="url(#arrow-patb)"
                />
            </svg>
        </div>

        <div
            class="pathway__row pathway__row--products pathway__row--patb-products grid min-h-[clamp(4.3rem,10.5svh,7rem)] grid-cols-[minmax(0,46%)_minmax(0,54%)] items-center portrait:min-h-0 portrait:grid-cols-1 portrait:grid-rows-2"
        >
            <div
                data-pathway-reveal="patB"
                class="pathway__byproducts pathway__side invisible col-start-1 ml-[-12%] grid w-[112%] translate-y-3 grid-cols-[minmax(3.5rem,0.7fr)_auto_minmax(6rem,1.55fr)] items-center gap-[clamp(0.6rem,1.4vw,1.1rem)] opacity-0 will-change-[transform,opacity] portrait:row-start-2 portrait:ml-0 portrait:w-full portrait:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.35fr)] portrait:gap-[clamp(0.1rem,0.5vw,0.3rem)]"
            >
                <article class="molecule molecule--tiny molecule--ammonia">
                    <div
                        class="molecule__structure molecule__structure--simple-formula grid h-[clamp(5.6rem,12.8svh,9rem)] place-items-center portrait:h-[clamp(3.25rem,9svh,5rem)]"
                        role="img"
                        :aria-label="`${compounds.ammonia.name} molecular formula: NH3`"
                    >
                        <span
                            class="molecule__simple-formula translate-y-[clamp(0.45rem,1svh,0.75rem)] text-[1.8rem] leading-none font-medium text-black portrait:translate-y-0 portrait:text-[clamp(1rem,4vw,1.45rem)] [&_sub]:text-[0.58em]"
                            aria-hidden="true"
                            ><span
                                class="molecule__simple-formula-element molecule__simple-formula-element--nitrogen text-[#3498db]"
                                >N</span
                            >H<sub>3</sub></span
                        >
                    </div>
                    <h2
                        class="m-0 text-[clamp(0.9rem,1.7svh,1.2rem)] leading-[1.08] portrait:text-[clamp(0.58rem,2.1vw,0.82rem)] portrait:leading-none"
                    >
                        {{ compounds.ammonia.name }}
                    </h2>
                </article>
                <span
                    class="pathway__plus grid place-items-center self-center justify-self-center text-[clamp(1rem,2svh,1.35rem)] leading-none font-extrabold"
                    aria-hidden="true"
                    >+</span
                >
                <article class="molecule molecule--tiny min-w-0 text-center">
                    <div
                        class="molecule__structure h-[clamp(5.6rem,12.8svh,9rem)] portrait:h-[clamp(3.25rem,9svh,5rem)]"
                        role="img"
                        :aria-label="`${compounds.pyruvate.name} 2D structure`"
                    >
                        <svg
                            ref="pyruvateSvg"
                            class="molecule__svg block size-full overflow-visible"
                            aria-hidden="true"
                        />
                    </div>
                    <h2
                        class="m-0 text-[clamp(0.9rem,1.7svh,1.2rem)] leading-[1.08] portrait:text-[clamp(0.58rem,2.1vw,0.82rem)] portrait:leading-none"
                    >
                        {{ compounds.pyruvate.name }}
                    </h2>
                </article>
            </div>

            <article
                data-pathway-reveal="patB"
                class="molecule molecule--main molecule--product pathway__main invisible col-start-2 min-w-0 translate-y-3 text-center opacity-0 will-change-[transform,opacity] portrait:col-start-1 portrait:row-start-1"
            >
                <div
                    class="molecule__structure h-[clamp(7.6rem,19.6svh,13.4rem)] portrait:h-[clamp(3.25rem,9svh,5rem)]"
                    role="img"
                    :aria-label="`${compounds.product.name} 2D structure`"
                >
                    <svg
                        ref="productSvg"
                        class="molecule__svg block size-full overflow-visible"
                        aria-hidden="true"
                    />
                </div>
                <h2
                    class="m-0 translate-y-[clamp(-2.2rem,-3.4svh,-1rem)] text-[clamp(0.9rem,1.7svh,1.2rem)] leading-[1.08] text-[#ff3e89] portrait:translate-y-0 portrait:text-[clamp(0.58rem,2.1vw,0.82rem)] portrait:leading-none"
                >
                    {{ compounds.product.name }}
                </h2>
            </article>
        </div>
    </aside>
</template>

<style scoped>
.pathway {
    font-family: var(--font-belanosima);
}

.molecule__simple-formula {
    font-family: var(--font-belanosima);
}

.reaction-arrow__path--side {
    animation: pathway-side-flow 0.75s linear infinite;
}

@keyframes pathway-side-flow {
    to {
        stroke-dashoffset: -15;
    }
}
</style>
