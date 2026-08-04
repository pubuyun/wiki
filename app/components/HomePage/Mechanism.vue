<script setup lang="ts">
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { onMounted, onUnmounted, ref } from "vue";

import ChemicalFormulaPanel from "./Mechanism/ChemicalFormulaPanel.client.vue";
import PeptAnim from "./Mechanism/PeptAnim.vue";

gsap.registerPlugin(ScrollTrigger);

type Point = {
    x: number;
    y: number;
};

type PeptAnimExpose = {
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
const PATH_POINTS = {
    outsideStart: { x: 1.3, y: 0.155 },
    transporter: { x: 0.85, y: 0.155 },
    insideMembrane: { x: 0.76, y: 0.17 },
    pointA: { x: 0.48, y: 0.35 },
    pointB: { x: 0.48, y: 0.75 },
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
        text: "PepTsh",
        color: "#124C96",
        position: { x: 0.5, y: 0.155 },
    },
    {
        id: "pepV",
        text: "PepV",
        color: "#F18D0C",
        position: { x: 0.15, y: 0.35 },
    },
    {
        id: "patB",
        text: "PatB",
        color: "#BD2F63",
        position: { x: 0.1, y: 0.75 },
    },
] as const;

/* precursor 动画参数调整区。 */
const PRECURSOR_ANIMATION = {
    transportScale: 0.7,
    initialRotation: 10,
    pointARotation: 90,
    pointBRotation: 90,
} as const;

const scene = ref<HTMLElement | null>(null);
const artwork = ref<HTMLElement | null>(null);
const molecule = ref<HTMLElement | null>(null);
const precursorVisual = ref<HTMLElement | null>(null);
const gly = ref<HTMLImageElement | null>(null);
const cys3m3sh = ref<HTMLImageElement | null>(null);
const product = ref<HTMLImageElement | null>(null);
const copyOne = ref<HTMLElement | null>(null);
const copyTwo = ref<HTMLElement | null>(null);
const copyThree = ref<HTMLElement | null>(null);
const peptAnim = ref<PeptAnimExpose | null>(null);
const chemicalPanel = ref<ChemicalPathwayExpose | null>(null);

let context: gsap.Context | undefined;

function pointVars(point: Point) {
    return {
        x: () => (artwork.value?.clientWidth ?? 0) * point.x,
        y: () => (artwork.value?.clientHeight ?? 0) * point.y,
    };
}

onMounted(() => {
    if (
        !scene.value ||
        !artwork.value ||
        !molecule.value ||
        !precursorVisual.value ||
        !gly.value ||
        !cys3m3sh.value ||
        !product.value ||
        !copyOne.value ||
        !copyTwo.value ||
        !copyThree.value
    ) {
        return;
    }

    context = gsap.context(() => {
        const peptTimeline = peptAnim.value?.getTimeline();
        const chemicalTargets = chemicalPanel.value?.getAnimationTargets();
        const copyPanels = [copyOne.value, copyTwo.value, copyThree.value];

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
                scrub: 0.6,
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
                duration: 0.45,
                ease: "power2.inOut",
            },
            "transport+=0.15",
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
                    duration: 0.55,
                    ease: "power2.inOut",
                },
                "throughTransporter",
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
                { ...pointVars(PATH_POINTS.membraneExit), duration: 0.45 },
                "<",
            )
            .to(molecule.value, {
                ...pointVars(PATH_POINTS.outsideEnd),
                duration: 0.7,
            })
            .to(
                product.value,
                { scale: 1, duration: 0.6, ease: "power2.out" },
                "<",
            );
    }, scene.value);

    ScrollTrigger.refresh();
});

onUnmounted(() => {
    context?.revert();
});
</script>

<template>
    <section id="mechanism" ref="scene" class="mechanism-scene">
        <div ref="artwork" class="mechanism-scene__artwork">
            <img
                class="mechanism-scene__background"
                src="https://static.igem.wiki/teams/6133/wiki/homepage/memscene.avif"
                alt="Cell membrane mechanism scene"
                draggable="false"
            />

            <div class="mechanism-scene__pept">
                <PeptAnim ref="peptAnim" :autoplay="false" />
            </div>

            <span
                v-for="label in PROTEIN_LABELS"
                :key="label.id"
                class="mechanism-scene__protein-label"
                :style="{
                    left: `${label.position.x * 100}%`,
                    top: `${label.position.y * 100}%`,
                    color: label.color,
                }"
            >
                {{ label.text }}
            </span>

            <div ref="molecule" class="mechanism-scene__molecule">
                <div ref="precursorVisual" class="mechanism-scene__precursor">
                    <img
                        ref="cys3m3sh"
                        class="mechanism-scene__molecule-layer"
                        src="https://static.igem.wiki/teams/6133/wiki/homepage/precursorcys3m3sh.avif"
                        alt=""
                        draggable="false"
                    />
                    <img
                        ref="gly"
                        class="mechanism-scene__molecule-layer"
                        src="https://static.igem.wiki/teams/6133/wiki/homepage/precursorgly.avif"
                        alt=""
                        draggable="false"
                    />
                </div>
                <img
                    ref="product"
                    class="mechanism-scene__molecule-layer"
                    src="https://static.igem.wiki/teams/6133/wiki/homepage/3m3sh.avif"
                    alt=""
                    draggable="false"
                />
            </div>
        </div>

        <ChemicalFormulaPanel
            ref="chemicalPanel"
            class="mechanism-scene__chemistry"
        />

        <div class="mechanism-scene__copy">
            <p ref="copyOne" class="mechanism-scene__copy-panel">
                This precursor is transported into <em>S. hominis</em> cells by
                PepTsh, a member of the
                <strong
                    >POT (Proton-dependent Oligopeptide Transporter)
                    family</strong
                >.
            </p>
            <p ref="copyTwo" class="mechanism-scene__copy-panel">
                Inside the bacterium, <strong>PepV</strong> uses water to
                hydrolyze the peptide bond in <strong>Cys-Gly-3M3SH</strong>,
                producing <strong>Cys-3M3SH</strong> and
                <strong>glycine</strong>.
            </p>
            <p ref="copyThree" class="mechanism-scene__copy-panel">
                Subsequently, the <strong>C–S lyase PatB</strong> converts
                <strong>Cys-3M3SH</strong> into the pungent volatile thiol
                <strong>3M3SH</strong>, with <strong>ammonia</strong> and
                <strong>pyruvic acid</strong> as coproducts.
                <strong
                    >3M3SH is one of the primary compounds responsible for
                    axillary body odor</strong
                >.
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

    position: relative;
    isolation: isolate;
    width: 100%;
    height: 100svh;
    overflow: visible;
    background: #b6fbf1;
}

.mechanism-scene::before {
    position: absolute;
    z-index: 0;
    inset: 0 0 0 var(--artwork-right);
    content: "";
    background: var(--color-surface);
}

.mechanism-scene__artwork {
    position: absolute;
    z-index: 1;
    top: 0;
    left: var(--artwork-right);
    width: 48.89svh;
    height: 100svh;
    overflow: visible;
    transform: translateX(-100%);
}

.mechanism-scene__background {
    position: absolute;
    top: 50%;
    left: 50%;
    display: block;
    width: 100svh;
    max-width: none;
    height: auto;
    transform: translate(-50%, -50%) rotate(90deg);
    user-select: none;
}

.mechanism-scene__pept {
    position: absolute;
    z-index: 1;
    top: var(--pept-top);
    left: var(--pept-left);
    width: var(--pept-size);
    overflow: visible;
    transform: translate(-50%, -50%) rotate(90deg);
}

.mechanism-scene__protein-label {
    position: absolute;
    z-index: 3;
    display: block;
    transform: translate(-50%, -50%);
    font-size: clamp(0.9rem, 2svh, 1.3rem);
    font-weight: 800;
    line-height: 1;
    white-space: nowrap;
    pointer-events: none;
    text-shadow:
        0 1px 2px rgb(255 255 255 / 90%),
        0 0 5px rgb(255 255 255 / 65%);
}

.mechanism-scene__molecule {
    position: absolute;
    z-index: 2;
    top: 0;
    left: 0;
    width: var(--molecule-size);
    aspect-ratio: 1;
    overflow: visible;
    pointer-events: none;
    will-change: transform;
}

.mechanism-scene__precursor {
    position: absolute;
    inset: 0;
    will-change: transform;
}

.mechanism-scene__molecule-layer {
    position: absolute;
    inset: 0;
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
    user-select: none;
    will-change: transform, opacity;
}

.mechanism-scene__copy {
    position: absolute;
    z-index: 3;
    top: 0;
    right: 0;
    bottom: 0;
    left: var(--artwork-right);
    display: grid;
    place-items: center;
    box-sizing: border-box;
}

.mechanism-scene__chemistry {
    position: absolute;
    z-index: 3;
    top: 0;
    bottom: 0;
    left: 0;
    width: max(0px, calc(var(--artwork-right) - 48.89svh));
}

.mechanism-scene__copy-panel {
    position: absolute;
    right: 3rem;
    left: 3rem;
    box-sizing: border-box;
    width: auto;
    max-width: none;
    height: auto;
    margin: 0;
    font-size: clamp(1.1rem, 1.8vw, 1.75rem);
    line-height: 1.55;
    color: var(--color-on-surface);
    overflow-wrap: break-word;
    white-space: normal;
    will-change: transform, opacity;
}

@media (max-width: 50rem) {
    .mechanism-scene {
        --molecule-size: 14svh;
    }

    .mechanism-scene__copy {
        right: 0;
        bottom: 1.5rem;
        left: 0;
        align-items: end;
        pointer-events: none;
    }

    .mechanism-scene__chemistry {
        display: none;
    }

    .mechanism-scene__copy-panel {
        padding: 1rem;
        font-size: clamp(1rem, 4vw, 1.25rem);
        border-radius: 1rem;
        background: color-mix(in srgb, var(--color-surface) 88%, transparent);
    }
}
</style>
