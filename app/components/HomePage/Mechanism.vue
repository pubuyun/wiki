<script setup lang="ts">
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { onMounted, onUnmounted, ref } from "vue";

import ChemicalFormulaPanel from "./Mechanism/ChemicalFormulaPanel.client.vue";
import TransporterAnim from "./Mechanism/TransporterAnim.vue";

gsap.registerPlugin(ScrollTrigger);

type Point = {
    x: number;
    y: number;
};

type TransporterAnimExpose = {
    getTimeline: () => gsap.core.Timeline | undefined;
};

type ChemicalPathwayExpose = {
    getAnimationTargets: () => {
        pepVArrows: SVGPathElement[];
        pepVProducts: HTMLElement[];
        patBArrows: SVGPathElement[];
        patBProducts: HTMLElement[];
    };
};

/*
 * 路径调整区：x / y 是旋转后 memscene 的百分比坐标（0 到 1）。
 * pointA 和 pointB 分别控制 PepV、PatB 的中心与流程位置。
 */
// const PATH_POINTS = {
//     outsideStart: { x: 1.3, y: 0.155 },
//     transporter: { x: 0.85, y: 0.155 },
//     insideMembrane: { x: 0.76, y: 0.17 },
//     pointA: { x: 0.48, y: 0.35 },
//     pointB: { x: 0.48, y: 0.75 },
//     exitApproach: { x: 0.76, y: 0.72 },
//     membraneExit: { x: 0.85, y: 0.72 },
//     outsideEnd: { x: 1.16, y: 0.72 },
// } satisfies Record<string, Point>;

// scene2
const PATH_POINTS = {
    outsideStart: { x: 1.7, y: 0.155 },
    transporter: { x: 0.85, y: 0.155 },
    insideMembrane: { x: 0.76, y: 0.17 },
    pointA: { x: 0.41, y: 0.32 },
    pointB: { x: 0.38, y: 0.68 },
    exitApproach: { x: 0.76, y: 0.72 },
    membraneExit: { x: 0.85, y: 0.72 },
    outsideEnd: { x: 1.16, y: 0.72 },
} satisfies Record<string, Point>;

/*
 * 蛋白名称坐标调整区：x / y 与 PATH_POINTS 使用同一套旋转后场景坐标（0 到 1）。
 * 修改这里即可分别移动 PepTsh、PepV 和 PatB 标签。
 */
const PROTEIN_LABELS = [
    {
        id: "pepTsh",
        text: "PepT",
        color: "#124C96",
        position: { x: 0.57, y: 0.15 },
    },
    {
        id: "pepV",
        text: "PepV",
        color: "#F18D0C",
        position: { x: 0.03, y: 0.35 },
    },
    {
        id: "patB",
        text: "PatB",
        color: "#BD2F63",
        position: { x: 0.08, y: 0.8 },
    },
] as const;

/* precursor 动画参数调整区。 */
const PRECURSOR_ANIMATION = {
    transportScale: 0.7,
    initialRotation: 10,
    pointARotation: -10,
    pointBRotation: -30,
} as const;

/* 3M3SH 穿膜后的终点参数：position 使用 animationPlane 的比例坐标。 */
const PRODUCT_FINALE = {
    position: { x: 2.0, y: 0.52 },
    scale: 1.8,
    copyEndY: -0.2,
} as const;

const scene = ref<HTMLElement | null>(null);
const artwork = ref<HTMLElement | null>(null);
const animationPlane = ref<HTMLElement | null>(null);
const molecule = ref<HTMLElement | null>(null);
const precursorVisual = ref<HTMLElement | null>(null);
const gly = ref<HTMLImageElement | null>(null);
const cys3m3sh = ref<HTMLImageElement | null>(null);
const product = ref<HTMLImageElement | null>(null);
const copyOne = ref<HTMLElement | null>(null);
const copyTwo = ref<HTMLElement | null>(null);
const copyThree = ref<HTMLElement | null>(null);
const copyFour = ref<HTMLElement | null>(null);
const peptAnim = ref<TransporterAnimExpose | null>(null);
const chemicalPanel = ref<ChemicalPathwayExpose | null>(null);

let context: gsap.Context | undefined;

function pointVars(point: Point) {
    return {
        x: () => (animationPlane.value?.clientWidth ?? 0) * point.x,
        y: () => (animationPlane.value?.clientHeight ?? 0) * point.y,
    };
}

onMounted(() => {
    if (
        !scene.value ||
        !artwork.value ||
        !animationPlane.value ||
        !molecule.value ||
        !precursorVisual.value ||
        !gly.value ||
        !cys3m3sh.value ||
        !product.value ||
        !copyOne.value ||
        !copyTwo.value ||
        !copyThree.value ||
        !copyFour.value
    ) {
        return;
    }

    context = gsap.context(() => {
        const peptTimeline = peptAnim.value?.getTimeline();
        const chemicalTargets = chemicalPanel.value?.getAnimationTargets();
        const copyPanels = [
            copyOne.value,
            copyTwo.value,
            copyThree.value,
            copyFour.value,
        ];
        const pepVMainArrows =
            chemicalTargets?.pepVArrows.filter((arrow) =>
                arrow.classList.contains("reaction-arrow__path--main"),
            ) ?? [];
        const patBMainArrows =
            chemicalTargets?.patBArrows.filter((arrow) =>
                arrow.classList.contains("reaction-arrow__path--main"),
            ) ?? [];

        peptTimeline?.pause(0);

        gsap.set(molecule.value, {
            ...pointVars(PATH_POINTS.outsideStart),
            xPercent: -50,
            yPercent: -50,
        });
        gsap.set(precursorVisual.value, {
            rotation: PRECURSOR_ANIMATION.initialRotation,
            scale: 1,
            transformOrigin: "50% 50%",
        });
        gsap.set([gly.value, cys3m3sh.value], {
            scaleX: -1,
            transformOrigin: "50% 50%",
        });
        gsap.set(product.value, {
            autoAlpha: 0,
            scale: 0.04,
            transformOrigin: "50% 50%",
        });
        gsap.set(copyPanels, { autoAlpha: 0, y: 24 });
        gsap.set(copyOne.value, { autoAlpha: 1, y: 0 });
        gsap.set(copyFour.value, { y: 0 });

        if (chemicalTargets) {
            const pathwayProducts = [
                ...chemicalTargets.pepVProducts,
                ...chemicalTargets.patBProducts,
            ];
            const pathwayArrows = [
                ...chemicalTargets.pepVArrows,
                ...chemicalTargets.patBArrows,
            ];

            gsap.set(pathwayProducts, { autoAlpha: 0, y: 12 });
            pathwayArrows.forEach((arrow) => {
                if (arrow.classList.contains("reaction-arrow__path--side")) {
                    gsap.set(arrow, { autoAlpha: 0 });
                    return;
                }

                const length = arrow.getTotalLength();
                gsap.set(arrow, {
                    autoAlpha: 0,
                    strokeDasharray: length,
                    strokeDashoffset: length,
                });
            });
        }

        const timeline = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
                id: "mechanism-story",
                trigger: scene.value,
                start: "top top",
                end: () => `+=${window.innerHeight * 5}`,
                // Keep the local actor exactly aligned with the incoming
                // cross-scene route during forward and reverse handoff.
                scrub: true,
                pin: true,
                anticipatePin: 1,
                invalidateOnRefresh: true,
            },
        });

        timeline
            .addLabel("transport", 0)
            .to(
                molecule.value,
                { ...pointVars(PATH_POINTS.transporter), duration: 1 },
                "transport",
            );

        if (peptTimeline) {
            timeline.to(
                peptTimeline,
                { progress: 1, duration: 0.45, ease: "power2.inOut" },
                "transport+=0.15",
            );
        }

        timeline.to(
            precursorVisual.value,
            {
                scale: PRECURSOR_ANIMATION.transportScale,
                duration: 0.65,
                ease: "power2.inOut",
            },
            "transport+=0.05",
        );

        timeline
            .addLabel("throughTransporter")
            .to(
                molecule.value,
                {
                    ...pointVars(PATH_POINTS.insideMembrane),
                    duration: 0.55,
                },
                "throughTransporter",
            )
            .to(
                precursorVisual.value,
                {
                    rotation: PRECURSOR_ANIMATION.pointARotation,
                    duration: 1.55,
                    ease: "power2.inOut",
                },
                "throughTransporter",
            )
            .to(
                precursorVisual.value,
                {
                    scale: 1,
                    duration: 0.75,
                    ease: "power2.inOut",
                },
                "throughTransporter-=0.1",
            );

        if (peptTimeline) {
            timeline.to(
                peptTimeline,
                { progress: 0, duration: 0.45, ease: "power2.inOut" },
                "throughTransporter",
            );
        }

        timeline
            .to(
                molecule.value,
                {
                    ...pointVars(PATH_POINTS.pointA),
                    duration: 1,
                },
                "throughTransporter+=0.55",
            )
            .addLabel("pepV")
            .to(
                chemicalTargets?.pepVArrows ?? [],
                {
                    autoAlpha: 1,
                    strokeDashoffset: 0,
                    duration: 0.45,
                },
                "pepV",
            )
            .set(
                pepVMainArrows,
                { strokeDasharray: "none", strokeDashoffset: 0 },
                "pepV+=0.45",
            )
            .to(
                chemicalTargets?.pepVProducts ?? [],
                {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.35,
                    stagger: 0.08,
                    ease: "power2.out",
                },
                "pepV+=0.16",
            )
            .to(copyOne.value, { autoAlpha: 0, y: -24, duration: 0.25 }, "pepV")
            .to(
                copyTwo.value,
                { autoAlpha: 1, y: 0, duration: 0.25 },
                "pepV+=0.15",
            )
            .to(
                gly.value,
                {
                    x: -36,
                    y: -42,
                    rotation: -25,
                    autoAlpha: 0,
                    duration: 0.7,
                    ease: "power2.in",
                },
                "pepV+=0.1",
            )
            .to(
                molecule.value,
                { ...pointVars(PATH_POINTS.pointB), duration: 1.15 },
                "pepV+=0.7",
            )
            .to(
                precursorVisual.value,
                {
                    rotation: PRECURSOR_ANIMATION.pointBRotation,
                    duration: 1.15,
                    ease: "power2.inOut",
                },
                "pepV+=0.7",
            )
            .addLabel("patB")
            .to(
                chemicalTargets?.patBArrows ?? [],
                {
                    autoAlpha: 1,
                    strokeDashoffset: 0,
                    duration: 0.45,
                },
                "patB",
            )
            .set(
                patBMainArrows,
                { strokeDasharray: "none", strokeDashoffset: 0 },
                "patB+=0.45",
            )
            .to(
                chemicalTargets?.patBProducts ?? [],
                {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.35,
                    stagger: 0.08,
                    ease: "power2.out",
                },
                "patB+=0.16",
            )
            .to(copyTwo.value, { autoAlpha: 0, y: -24, duration: 0.25 }, "patB")
            .to(
                copyThree.value,
                { autoAlpha: 1, y: 0, duration: 0.25 },
                "patB+=0.15",
            )
            .to(
                cys3m3sh.value,
                { scale: 0.04, duration: 0.45, ease: "power2.in" },
                "patB",
            )
            .set(cys3m3sh.value, { autoAlpha: 0 })
            .set(product.value, { autoAlpha: 1 })
            .to(product.value, {
                scale: 1,
                duration: 0.55,
                ease: "power2.out",
            })
            .to(molecule.value, {
                ...pointVars(PATH_POINTS.exitApproach),
                duration: 1.1,
            })
            .to(product.value, {
                scale: 0.04,
                duration: 0.45,
                ease: "power2.in",
            })
            .to(
                molecule.value,
                { ...pointVars(PATH_POINTS.membraneExit), duration: 0.25 },
                "<0.1",
            )
            .to(molecule.value, {
                ...pointVars(PATH_POINTS.outsideEnd),
                duration: 0.7,
            })
            .to(
                product.value,
                { scale: 1, duration: 0.6, ease: "power2.out" },
                "<",
            )
            .addLabel("productFinale")
            .to(
                molecule.value,
                {
                    ...pointVars(PRODUCT_FINALE.position),
                    duration: 1,
                    ease: "power2.inOut",
                },
                "productFinale",
            )
            .to(
                product.value,
                {
                    scale: PRODUCT_FINALE.scale,
                    duration: 1,
                    ease: "power2.inOut",
                },
                "productFinale",
            )
            .to(
                copyThree.value,
                { autoAlpha: 0, y: -24, duration: 0.25 },
                "productFinale",
            )
            .to(
                copyFour.value,
                { autoAlpha: 1, duration: 0.15 },
                "productFinale",
            )
            .to(
                copyFour.value,
                {
                    y: () => window.innerHeight * PRODUCT_FINALE.copyEndY,
                    duration: 0.75,
                    ease: "power2.inOut",
                },
                "productFinale",
            );
    }, scene.value);

    ScrollTrigger.refresh();
});

onUnmounted(() => {
    context?.revert();
});
</script>

<template>
    <section
        id="mechanism"
        ref="scene"
        class="mechanism-scene relative isolate h-svh w-full overflow-visible bg-[#b6fbf1] portrait:grid portrait:grid-rows-[auto_var(--artwork-height)_minmax(0,1fr)]"
    >
        <div
            ref="artwork"
            class="mechanism-scene__artwork absolute top-0 z-1 h-svh w-[48.89svh] -translate-x-full overflow-visible portrait:relative portrait:top-auto portrait:z-10 portrait:row-start-2 portrait:w-screen portrait:transform-none"
        >
            <img
                class="mechanism-scene__background absolute top-1/2 left-1/2 block h-auto w-svh max-w-none -translate-x-1/2 -translate-y-1/2 rotate-90 select-none portrait:inset-0 portrait:size-full portrait:translate-none portrait:rotate-none portrait:object-contain"
                src="https://static.igem.wiki/teams/6133/wiki/homepage/memscene2.avif"
                alt="Cell membrane mechanism scene"
                loading="lazy"
                fetchpriority="low"
                decoding="async"
                draggable="false"
            />

            <div
                ref="animationPlane"
                class="mechanism-scene__animation absolute inset-0 z-10 origin-center overflow-visible portrait:top-1/2 portrait:left-1/2 portrait:z-4 portrait:-translate-x-1/2 portrait:-translate-y-1/2 portrait:-rotate-90"
            >
                <span
                    class="precursor-transition-target pointer-events-none absolute size-0"
                    :style="{
                        left: `${PATH_POINTS.outsideStart.x * 100}%`,
                        top: `${PATH_POINTS.outsideStart.y * 100}%`,
                    }"
                    aria-hidden="true"
                />

                <div
                    class="mechanism-scene__pept absolute z-1 -translate-x-1/2 -translate-y-1/2 rotate-90 overflow-visible"
                >
                    <TransporterAnim
                        ref="peptAnim"
                        left-src="https://static.igem.wiki/teams/6133/wiki/homepage/peptshl.avif"
                        middle-src="https://static.igem.wiki/teams/6133/wiki/homepage/peptshm.avif"
                        right-src="https://static.igem.wiki/teams/6133/wiki/homepage/peptshr.avif"
                        :open-angle="-10"
                        :closed-angle="10"
                        :autoplay="false"
                    />
                </div>

                <span
                    v-for="label in PROTEIN_LABELS"
                    :key="label.id"
                    class="mechanism-scene__protein-label pointer-events-none absolute z-3 block -translate-x-1/2 -translate-y-1/2 text-[clamp(0.9rem,2svh,1.3rem)] leading-none font-extrabold whitespace-nowrap [text-shadow:0_1px_2px_rgb(255_255_255_/_90%),0_0_5px_rgb(255_255_255_/_65%)] portrait:rotate-90"
                    :style="{
                        left: `${label.position.x * 100}%`,
                        top: `${label.position.y * 100}%`,
                        color: label.color,
                    }"
                >
                    {{ label.text }}
                </span>

                <div
                    ref="molecule"
                    class="mechanism-scene__molecule pointer-events-none absolute top-0 left-0 z-10 aspect-square overflow-visible will-change-transform"
                >
                    <div
                        ref="precursorVisual"
                        class="mechanism-scene__precursor absolute inset-0 will-change-transform"
                    >
                        <img
                            ref="cys3m3sh"
                            class="mechanism-scene__molecule-layer absolute inset-0 block size-full object-contain will-change-[transform,opacity] select-none"
                            src="https://static.igem.wiki/teams/6133/wiki/homepage/precursorcys3m3sh.avif"
                            alt=""
                            loading="lazy"
                            fetchpriority="low"
                            decoding="async"
                            draggable="false"
                        />
                        <img
                            ref="gly"
                            class="mechanism-scene__molecule-layer absolute inset-0 block size-full object-contain will-change-[transform,opacity] select-none"
                            src="https://static.igem.wiki/teams/6133/wiki/homepage/precursorgly.avif"
                            alt=""
                            loading="lazy"
                            fetchpriority="low"
                            decoding="async"
                            draggable="false"
                        />
                    </div>
                    <img
                        ref="product"
                        class="mechanism-scene__molecule-layer mechanism-scene__molecule-layer--product absolute inset-0 block size-full object-contain will-change-[transform,opacity] select-none portrait:rotate-90"
                        src="https://static.igem.wiki/teams/6133/wiki/homepage/3m3sh.avif"
                        alt=""
                        loading="lazy"
                        fetchpriority="low"
                        decoding="async"
                        draggable="false"
                    />
                </div>
            </div>
        </div>

        <ChemicalFormulaPanel
            ref="chemicalPanel"
            class="mechanism-scene__chemistry absolute inset-y-0 left-0 z-3 portrait:relative portrait:inset-auto portrait:row-start-3 portrait:h-auto portrait:min-h-0"
        />

        <div
            class="mechanism-scene__copy absolute inset-y-0 right-0 z-3 box-border grid place-items-center portrait:pointer-events-none portrait:relative portrait:inset-auto portrait:row-start-1 portrait:bg-[#03316d] portrait:px-[clamp(1rem,5vw,2rem)] portrait:py-20 portrait:[grid-template:'copy'_auto/minmax(0,1fr)]"
        >
            <p
                ref="copyOne"
                class="mechanism-scene__copy-panel absolute right-20 left-20 m-0 box-border h-auto w-auto max-w-none text-[clamp(1.1rem,1.8vw,1.75rem)] leading-[1.55] [overflow-wrap:break-word] whitespace-normal text-[#f7fbff] will-change-[transform,opacity] portrait:relative portrait:right-auto portrait:left-auto portrait:w-full portrait:text-[clamp(0.95rem,3.8vw,1.25rem)] portrait:leading-[1.42] portrait:[grid-area:copy]"
            >
                This precursor is transported into <em>S. hominis</em> cells by
                <strong class="text-[#8ed0ff]">PepT<sub>sh</sub></strong> , a
                member of the
                <strong>POT</strong>
                (Proton-dependent Oligopeptide Transporter) family.
            </p>
            <p
                ref="copyTwo"
                class="mechanism-scene__copy-panel absolute right-20 left-20 m-0 box-border h-auto w-auto max-w-none text-[clamp(1.1rem,1.8vw,1.75rem)] leading-[1.55] [overflow-wrap:break-word] whitespace-normal text-[#f7fbff] will-change-[transform,opacity] portrait:relative portrait:right-auto portrait:left-auto portrait:w-full portrait:text-[clamp(0.95rem,3.8vw,1.25rem)] portrait:leading-[1.42] portrait:[grid-area:copy]"
            >
                Inside the bacterium,
                <strong class="text-[#ffc56e]">PepV</strong> uses water to
                hydrolyze the peptide bond in
                <strong class="text-[#8ed0ff]">Cys-Gly-3M3SH</strong>, producing
                <strong class="text-[#ffc56e]">Cys-3M3SH</strong> and
                <strong>glycine</strong>.
            </p>
            <p
                ref="copyThree"
                class="mechanism-scene__copy-panel absolute right-20 left-20 m-0 box-border h-auto w-auto max-w-none text-[clamp(1.1rem,1.8vw,1.75rem)] leading-[1.55] [overflow-wrap:break-word] whitespace-normal text-[#f7fbff] will-change-[transform,opacity] portrait:relative portrait:right-auto portrait:left-auto portrait:w-full portrait:text-[clamp(0.95rem,3.8vw,1.25rem)] portrait:leading-[1.42] portrait:[grid-area:copy]"
            >
                Subsequently, the
                <strong
                    >C–S lyase <span class="text-[#ff91b8]">PatB</span></strong
                >
                converts
                <strong class="text-[#ffc56e]">Cys-3M3SH</strong> into the
                pungent volatile thiol
                <strong class="text-[#ff91b8]">3M3SH</strong>, with
                <strong class="text-[#8ed0ff]">ammonia</strong> and
                <strong>pyruvic acid</strong> as coproducts.
                <strong class="text-[#ff91b8]">3M3SH</strong> is one of the
                primary compounds responsible for axillary body odor.
            </p>
            <p
                ref="copyFour"
                class="mechanism-scene__copy-panel absolute right-20 left-20 m-0 box-border h-auto w-auto max-w-none text-[clamp(1.1rem,1.8vw,1.75rem)] leading-[1.55] [overflow-wrap:break-word] whitespace-normal text-[#f7fbff] will-change-[transform,opacity] portrait:relative portrait:right-auto portrait:left-auto portrait:w-full portrait:text-[clamp(0.95rem,3.8vw,1.25rem)] portrait:leading-[1.42] portrait:[grid-area:copy]"
            >
                <strong class="text-[#ff91b8]">3M3SH</strong>
                (3-methyl-3-sulfanylhexan-1-ol), a volatile thiol compound, is
                one of the major contributors to axillary body odor.
            </p>
        </div>
    </section>
</template>

<style scoped>
.mechanism-scene {
    /* 整幅场景的右边缘位置；调大即可整体右移。 */
    --artwork-right: 47vw;
    --pept-left: 85%;
    --pept-top: 15.5%;
    --pept-size: 35svh;
    --molecule-size: 17svh;
}

.mechanism-scene::before {
    position: absolute;
    z-index: 0;
    inset: 0 0 0 var(--artwork-right);
    content: "";
    background: #03316d;
}

.mechanism-scene__artwork {
    left: var(--artwork-right);
}

.mechanism-scene__pept {
    top: var(--pept-top);
    left: var(--pept-left);
    width: var(--pept-size);
}

.mechanism-scene__molecule {
    width: var(--molecule-size);
}

.mechanism-scene__copy {
    left: var(--artwork-right);
}

.mechanism-scene__chemistry {
    width: max(0px, calc(var(--artwork-right) - 48.89svh));
}

@media (orientation: portrait) {
    .mechanism-scene {
        --artwork-height: 48.89vw;
        --pept-size: 35vw;
        --molecule-size: 17vw;
    }

    .mechanism-scene::before {
        display: none;
    }

    .mechanism-scene__artwork {
        position: relative;
        left: 100%;
        overflow: visible;
        height: var(--artwork-height);
    }

    .mechanism-scene__animation {
        width: var(--artwork-height);
        height: 100vw;
    }

    .mechanism-scene__copy {
        left: auto;
    }

    .mechanism-scene__chemistry {
        width: 100%;
    }
}
</style>
