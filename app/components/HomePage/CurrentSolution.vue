<script setup lang="ts">
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { nextTick, onMounted, onUnmounted, ref } from "vue";

gsap.registerPlugin(ScrollTrigger);

const CURRENT_SOLUTION_ENTRANCE = {
    copyOffsetX: 72,
    questionOffsetY: 30,
    introTransitionDuration: 0.92,
    questionDuration: 0.5,
    questionStagger: 0.06,
    firstSceneHoldDuration: 0.34,
    actorStartXPercent: 112,
    actorStartYPercent: 30,
    actorArcProgress: 0.52,
    actorArcLiftPercent: 12,
    actorDuration: 0.92,
} as const;

const scene = ref<HTMLElement | null>(null);
const stage = ref<HTMLElement | null>(null);
const firstScene = ref<HTMLElement | null>(null);
const secondScene = ref<HTMLElement | null>(null);
const secondCopy = ref<HTMLElement | null>(null);
const knife = ref<HTMLImageElement | null>(null);
const antiperspirant = ref<HTMLElement | null>(null);
const antiperspirantPulse = ref<HTMLElement | null>(null);
const antiperspirantImage = ref<HTMLImageElement | null>(null);
const deodorant = ref<HTMLElement | null>(null);
const deodorantPulse = ref<HTMLElement | null>(null);
const deodorantImage = ref<HTMLImageElement | null>(null);
const corner = ref<HTMLElement | null>(null);
const deodorantPanel = ref<HTMLElement | null>(null);
const antiperspirantPanel = ref<HTMLElement | null>(null);
const triclosanSvg = ref<SVGSVGElement | null>(null);
const alcoholSvg = ref<SVGSVGElement | null>(null);

type IngredientPanel = "deodorant" | "antiperspirant";

const activeIngredient = ref<IngredientPanel | null>(null);

let media: gsap.MatchMedia | undefined;
let ingredientInteractionEnabled = false;
let productHintTweens: Partial<Record<IngredientPanel, gsap.core.Tween>> = {};
let productHoverTweens: Partial<Record<IngredientPanel, gsap.core.Tween>> = {};

function cssNumber(name: string) {
    if (!stage.value) return 0;
    return Number.parseFloat(
        getComputedStyle(stage.value).getPropertyValue(name),
    );
}

function actorOffset(fromX: string, fromY: string, toX: string, toY: string) {
    return {
        x: () =>
            (stage.value?.clientWidth ?? 0) *
            ((cssNumber(toX) - cssNumber(fromX)) / 100),
        y: () =>
            (stage.value?.clientHeight ?? 0) *
            ((cssNumber(toY) - cssNumber(fromY)) / 100),
    };
}

function entrancePointOffset(
    actorX: string,
    actorY: string,
    progress: number,
    arcLiftPercent = 0,
) {
    const targetX = () => cssNumber(actorX);
    const targetY = () => cssNumber(actorY);

    return {
        x: () =>
            (stage.value?.clientWidth ?? 0) *
            ((CURRENT_SOLUTION_ENTRANCE.actorStartXPercent +
                (targetX() - CURRENT_SOLUTION_ENTRANCE.actorStartXPercent) *
                    progress -
                targetX()) /
                100),
        y: () =>
            (stage.value?.clientHeight ?? 0) *
            ((CURRENT_SOLUTION_ENTRANCE.actorStartYPercent +
                (targetY() - CURRENT_SOLUTION_ENTRANCE.actorStartYPercent) *
                    progress -
                Math.sin(Math.PI * progress) * arcLiftPercent -
                targetY()) /
                100),
    };
}

async function drawDeodorantIngredients() {
    if (!triclosanSvg.value || !alcoholSvg.value) return;

    const { default: SmilesDrawer } = await import("smiles-drawer");
    const drawer = new SmilesDrawer.SvgDrawer({
        width: 280,
        height: 150,
        bondThickness: 2.2,
        bondLength: 34,
        fontSizeLarge: 18,
        fontSizeSmall: 7,
        padding: 12,
        compactDrawing: false,
        explicitHydrogens: false,
    });
    const drawings = [
        {
            smiles: "Oc1cc(Cl)c(Oc2cc(Cl)c(Cl)cc2)c1",
            target: triclosanSvg.value,
        },
        { smiles: "CCO", target: alcoholSvg.value },
    ] as const;

    drawings.forEach(({ smiles, target }) => {
        SmilesDrawer.parse(
            smiles,
            (tree) => drawer.draw(tree, target, "light"),
            (error) => {
                throw error;
            },
        );
    });
}

function hideIngredientPanels(immediate = false) {
    const panels = [deodorantPanel.value, antiperspirantPanel.value].filter(
        (panel): panel is HTMLElement => Boolean(panel),
    );

    activeIngredient.value = null;
    if (immediate) {
        gsap.set(panels, { autoAlpha: 0, scale: 0.86, x: 0 });
        return;
    }

    gsap.to(panels, {
        autoAlpha: 0,
        scale: 0.86,
        duration: 0.22,
        ease: "power2.in",
        overwrite: true,
    });
}

function toggleIngredientPanel(kind: IngredientPanel) {
    if (!ingredientInteractionEnabled) return;

    const selected =
        kind === "deodorant" ? deodorantPanel.value : antiperspirantPanel.value;
    const other =
        kind === "deodorant" ? antiperspirantPanel.value : deodorantPanel.value;

    if (!selected) return;

    if (activeIngredient.value === kind) {
        hideIngredientPanels();
        return;
    }

    activeIngredient.value = kind;
    if (other) {
        gsap.to(other, {
            autoAlpha: 0,
            scale: 0.86,
            duration: 0.2,
            ease: "power2.in",
            overwrite: true,
        });
    }
    gsap.fromTo(
        selected,
        {
            autoAlpha: 0,
            scale: 0.82,
            x: kind === "deodorant" ? 18 : -18,
        },
        {
            autoAlpha: 1,
            scale: 1,
            x: 0,
            duration: 0.42,
            ease: "back.out(1.55)",
            overwrite: true,
        },
    );
}

function handleProductHover(kind: IngredientPanel, hovering: boolean) {
    if (!ingredientInteractionEnabled) return;

    const pulse =
        kind === "deodorant" ? deodorantPulse.value : antiperspirantPulse.value;
    const hintTween = productHintTweens[kind];
    if (!pulse) return;

    productHoverTweens[kind]?.kill();
    productHoverTweens[kind] = undefined;

    if (hovering) {
        hintTween?.pause();
        productHoverTweens[kind] = gsap.to(pulse, {
            scale: () => cssNumber("--product-hover-scale"),
            duration: 0.24,
            ease: "power2.out",
        });
        return;
    }

    productHoverTweens[kind] = gsap.to(pulse, {
        scale: 1,
        duration: 0.2,
        ease: "power2.out",
        onComplete: () => {
            productHoverTweens[kind] = undefined;
            if (ingredientInteractionEnabled) hintTween?.restart();
        },
    });
}

onMounted(async () => {
    await nextTick();

    if (
        !scene.value ||
        !stage.value ||
        !firstScene.value ||
        !secondScene.value ||
        !secondCopy.value ||
        !knife.value ||
        !antiperspirant.value ||
        !antiperspirantPulse.value ||
        !antiperspirantImage.value ||
        !deodorant.value ||
        !deodorantPulse.value ||
        !deodorantImage.value ||
        !corner.value ||
        !deodorantPanel.value ||
        !antiperspirantPanel.value
    ) {
        return;
    }

    const refs = {
        scene: scene.value,
        firstScene: firstScene.value,
        secondScene: secondScene.value,
        secondCopy: secondCopy.value,
        knife: knife.value,
        antiperspirant: antiperspirant.value,
        antiperspirantPulse: antiperspirantPulse.value,
        antiperspirantImage: antiperspirantImage.value,
        deodorant: deodorant.value,
        deodorantPulse: deodorantPulse.value,
        deodorantImage: deodorantImage.value,
        corner: corner.value,
        deodorantPanel: deodorantPanel.value,
        antiperspirantPanel: antiperspirantPanel.value,
    };

    void drawDeodorantIngredients();

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
            const leaveUp = gsap.utils.toArray<HTMLElement>(
                ".current-solution__leave-up",
                refs.firstScene,
            );
            const leaveLeft = gsap.utils.toArray<HTMLElement>(
                ".current-solution__leave-left",
                refs.firstScene,
            );
            const leaveDown = gsap.utils.toArray<HTMLElement>(
                ".current-solution__leave-down",
                refs.firstScene,
            );
            const rightActors = [
                {
                    element: refs.knife,
                    xVariable: "--knife-x",
                    yVariable: "--knife-y",
                    rotationVariable: "--knife-rotation",
                },
                {
                    element: refs.deodorant,
                    xVariable: "--deodorant-x",
                    yVariable: "--deodorant-y",
                    rotationVariable: "--deodorant-rotation",
                },
                {
                    element: refs.antiperspirant,
                    xVariable: "--antiperspirant-x",
                    yVariable: "--antiperspirant-y",
                    rotationVariable: "--antiperspirant-rotation",
                },
            ];
            const storyItems = [refs.secondCopy];
            const antiperspirantFinal = {
                ...actorOffset(
                    "--antiperspirant-x",
                    "--antiperspirant-y",
                    "--antiperspirant-second-x",
                    "--antiperspirant-second-y",
                ),
                rotation: () => cssNumber("--antiperspirant-second-rotation"),
                scale: () => cssNumber("--antiperspirant-second-scale"),
            };
            const deodorantFinal = {
                ...actorOffset(
                    "--deodorant-x",
                    "--deodorant-y",
                    "--deodorant-second-x",
                    "--deodorant-second-y",
                ),
                rotation: () => cssNumber("--deodorant-second-rotation"),
                scale: () => cssNumber("--deodorant-second-scale"),
            };

            gsap.set(refs.secondScene, { autoAlpha: 0 });
            gsap.set(storyItems, { autoAlpha: 0, y: 24 });
            gsap.set(leaveUp, { autoAlpha: 1, y: 0 });
            gsap.set(leaveLeft, {
                autoAlpha: 0,
                x: -CURRENT_SOLUTION_ENTRANCE.copyOffsetX,
            });
            gsap.set(leaveDown, {
                autoAlpha: 0,
                y: CURRENT_SOLUTION_ENTRANCE.questionOffsetY,
            });
            gsap.set([refs.deodorantPanel, refs.antiperspirantPanel], {
                autoAlpha: 0,
                scale: 0.86,
            });
            gsap.set([refs.antiperspirant, refs.deodorant], {
                pointerEvents: "none",
            });
            gsap.set(refs.antiperspirant, {
                xPercent: -50,
                yPercent: -50,
                rotation: () => cssNumber("--antiperspirant-rotation"),
            });
            gsap.set(refs.deodorant, {
                xPercent: -50,
                yPercent: -50,
                rotation: () => cssNumber("--deodorant-rotation"),
            });
            rightActors.forEach(
                ({ element, xVariable, yVariable, rotationVariable }) => {
                    gsap.set(element, {
                        ...entrancePointOffset(xVariable, yVariable, 0),
                        autoAlpha: 0,
                        rotation: () => cssNumber(rotationVariable) - 24,
                    });
                },
            );

            if (reduceMotion) {
                gsap.set([...leaveUp, ...leaveLeft, ...leaveDown], {
                    autoAlpha: 1,
                    x: 0,
                    y: 0,
                });
                rightActors.forEach(({ element, rotationVariable }) => {
                    gsap.set(element, {
                        autoAlpha: 1,
                        x: 0,
                        y: 0,
                        rotation: () => cssNumber(rotationVariable),
                    });
                });
                gsap.set(refs.firstScene, { autoAlpha: 0 });
                gsap.set(refs.secondScene, { autoAlpha: 1 });
                gsap.set(storyItems, { autoAlpha: 1, y: 0 });
                gsap.set(refs.antiperspirant, antiperspirantFinal);
                gsap.set(refs.deodorant, deodorantFinal);
                gsap.set([refs.antiperspirant, refs.deodorant], {
                    pointerEvents: "auto",
                });
                ingredientInteractionEnabled = true;
                return () => {
                    ingredientInteractionEnabled = false;
                    hideIngredientPanels(true);
                };
            }

            const floatTweens = [
                gsap.to(refs.antiperspirantImage, {
                    y: -13,
                    rotation: 2.2,
                    duration: 2.15,
                    ease: "sine.inOut",
                    repeat: -1,
                    yoyo: true,
                    paused: true,
                }),
                gsap.to(refs.deodorantImage, {
                    y: 11,
                    rotation: -2.6,
                    duration: 1.85,
                    ease: "sine.inOut",
                    repeat: -1,
                    yoyo: true,
                    paused: true,
                }),
            ];
            const hintTweens = [
                gsap.to(refs.antiperspirantPulse, {
                    scale: () => cssNumber("--product-hint-scale"),
                    duration: 0.78,
                    ease: "sine.inOut",
                    repeat: -1,
                    yoyo: true,
                    paused: true,
                }),
                gsap.to(refs.deodorantPulse, {
                    scale: () => cssNumber("--product-hint-scale"),
                    duration: 0.78,
                    ease: "sine.inOut",
                    repeat: -1,
                    yoyo: true,
                    paused: true,
                }),
            ];
            productHintTweens = {
                antiperspirant: hintTweens[0],
                deodorant: hintTweens[1],
            };
            const firstSceneHold = { progress: 0 };
            const hold = { progress: 0 };
            let isSecondSceneActive = false;
            let secondSceneActivationProgress = 1;

            const timeline = gsap.timeline({
                defaults: { ease: "none" },
                scrollTrigger: {
                    id: "current-solution-story",
                    trigger: refs.scene,
                    start: "top top",
                    end: () => `+=${window.innerHeight * 3.2}`,
                    scrub: 0.65,
                    pin: true,
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                    onUpdate: (self) => {
                        const shouldActivate =
                            self.progress >= secondSceneActivationProgress;
                        if (shouldActivate === isSecondSceneActive) return;

                        isSecondSceneActive = shouldActivate;
                        ingredientInteractionEnabled = shouldActivate;
                        gsap.set([refs.antiperspirant, refs.deodorant], {
                            pointerEvents: shouldActivate ? "auto" : "none",
                        });
                        [...floatTweens, ...hintTweens].forEach((tween) => {
                            if (shouldActivate) tween.play();
                            else tween.pause(0);
                        });
                        if (!shouldActivate) {
                            Object.values(productHoverTweens).forEach((tween) =>
                                tween?.kill(),
                            );
                            productHoverTweens = {};
                            gsap.set(
                                [refs.antiperspirantPulse, refs.deodorantPulse],
                                { scale: 1 },
                            );
                            hideIngredientPanels(true);
                        }
                    },
                },
            });

            timeline.addLabel("introTransition", 0).fromTo(
                leaveLeft,
                {
                    autoAlpha: 0,
                    x: -CURRENT_SOLUTION_ENTRANCE.copyOffsetX,
                },
                {
                    autoAlpha: 1,
                    x: 0,
                    duration: CURRENT_SOLUTION_ENTRANCE.introTransitionDuration,
                    ease: "power3.out",
                    immediateRender: false,
                },
                "introTransition",
            );

            rightActors.forEach(
                ({ element, xVariable, yVariable, rotationVariable }) => {
                    const finalRotation = () => cssNumber(rotationVariable);
                    timeline.to(
                        element,
                        {
                            keyframes: [
                                {
                                    ...entrancePointOffset(
                                        xVariable,
                                        yVariable,
                                        CURRENT_SOLUTION_ENTRANCE.actorArcProgress,
                                        CURRENT_SOLUTION_ENTRANCE.actorArcLiftPercent,
                                    ),
                                    autoAlpha: 0.62,
                                    rotation: () => finalRotation() - 10,
                                    duration:
                                        CURRENT_SOLUTION_ENTRANCE.actorDuration *
                                        0.42,
                                    ease: "power1.in",
                                },
                                {
                                    x: 0,
                                    y: 0,
                                    autoAlpha: 1,
                                    rotation: finalRotation,
                                    duration:
                                        CURRENT_SOLUTION_ENTRANCE.actorDuration *
                                        0.58,
                                    ease: "power3.out",
                                },
                            ],
                        },
                        "introTransition",
                    );
                },
            );

            timeline
                .addLabel("questionReveal")
                .fromTo(
                    leaveDown,
                    {
                        autoAlpha: 0,
                        y: CURRENT_SOLUTION_ENTRANCE.questionOffsetY,
                    },
                    {
                        autoAlpha: 1,
                        y: 0,
                        duration: CURRENT_SOLUTION_ENTRANCE.questionDuration,
                        stagger: CURRENT_SOLUTION_ENTRANCE.questionStagger,
                        ease: "power2.out",
                        immediateRender: false,
                    },
                    "questionReveal",
                )
                .to(firstSceneHold, {
                    progress: 1,
                    duration: CURRENT_SOLUTION_ENTRANCE.firstSceneHoldDuration,
                })
                .addLabel("firstSceneExit")
                .fromTo(
                    leaveLeft,
                    { autoAlpha: 1, x: 0 },
                    {
                        autoAlpha: 0,
                        x: -48,
                        duration: 0.42,
                        immediateRender: false,
                    },
                    "firstSceneExit",
                )
                .fromTo(
                    leaveDown,
                    { autoAlpha: 1, y: 0 },
                    {
                        autoAlpha: 0,
                        y: 34,
                        duration: 0.42,
                        stagger: 0.035,
                        immediateRender: false,
                    },
                    "firstSceneExit+=0.02",
                )
                .fromTo(
                    refs.corner,
                    { autoAlpha: 1, xPercent: 0 },
                    {
                        autoAlpha: 0,
                        xPercent: 24,
                        duration: 0.48,
                        immediateRender: false,
                    },
                    "firstSceneExit",
                )
                .fromTo(
                    refs.knife,
                    {
                        autoAlpha: 1,
                        x: 0,
                        y: 0,
                        rotation: () => cssNumber("--knife-rotation"),
                    },
                    {
                        autoAlpha: 0,
                        x: 120,
                        rotation: 24,
                        duration: 0.48,
                        ease: "power2.in",
                        immediateRender: false,
                    },
                    "firstSceneExit",
                )
                .fromTo(
                    refs.firstScene,
                    { autoAlpha: 1 },
                    {
                        autoAlpha: 0,
                        duration: 0.08,
                        immediateRender: false,
                    },
                    "firstSceneExit+=0.5",
                )
                .addLabel("moveProducts", "firstSceneExit+=0.28")
                .fromTo(
                    refs.antiperspirant,
                    {
                        x: 0,
                        y: 0,
                        rotation: () => cssNumber("--antiperspirant-rotation"),
                        scale: 1,
                    },
                    {
                        ...antiperspirantFinal,
                        duration: 0.84,
                        ease: "power2.inOut",
                        immediateRender: false,
                    },
                    "moveProducts",
                )
                .fromTo(
                    refs.deodorant,
                    {
                        x: 0,
                        y: 0,
                        rotation: () => cssNumber("--deodorant-rotation"),
                        scale: 1,
                    },
                    {
                        ...deodorantFinal,
                        duration: 0.76,
                        ease: "power2.inOut",
                        immediateRender: false,
                    },
                    "moveProducts+=0.06",
                )
                .addLabel("secondScene", "moveProducts+=0.48")
                .fromTo(
                    refs.secondScene,
                    { autoAlpha: 0 },
                    {
                        autoAlpha: 1,
                        duration: 0.2,
                        immediateRender: false,
                    },
                    "secondScene",
                )
                .fromTo(
                    storyItems,
                    { autoAlpha: 0, y: 24 },
                    {
                        autoAlpha: 1,
                        y: 0,
                        duration: 0.46,
                        ease: "power2.out",
                        immediateRender: false,
                    },
                    "secondScene+=0.08",
                )
                .to(hold, { progress: 1, duration: 0.78 }, ">+0.08");

            secondSceneActivationProgress =
                timeline.labels.secondScene /
                Math.max(timeline.duration(), 0.001);

            return () => {
                ingredientInteractionEnabled = false;
                hideIngredientPanels(true);
                Object.values(productHoverTweens).forEach((tween) =>
                    tween?.kill(),
                );
                productHintTweens = {};
                productHoverTweens = {};
                [...floatTweens, ...hintTweens].forEach((tween) =>
                    tween.kill(),
                );
            };
        },
        scene.value,
    );

    void nextTick(() => ScrollTrigger.refresh());
});

onUnmounted(() => {
    ingredientInteractionEnabled = false;
    Object.values(productHoverTweens).forEach((tween) => tween?.kill());
    productHintTweens = {};
    productHoverTweens = {};
    gsap.killTweensOf([deodorantPanel.value, antiperspirantPanel.value]);
    media?.revert();
    media = undefined;
    ScrollTrigger.getById("current-solution-story")?.kill(true);
});
</script>

<template>
    <section
        id="current-solution"
        ref="scene"
        class="relative h-svh min-h-152 w-full overflow-hidden bg-[#073873] font-righteous text-white"
        aria-labelledby="current-solution-title"
    >
        <div
            ref="stage"
            class="current-solution__stage absolute inset-0 overflow-hidden"
        >
            <div ref="firstScene" class="absolute inset-0 z-2">
                <div
                    ref="corner"
                    class="absolute right-0 bottom-0 z-1 size-[var(--arm-size)]"
                    aria-hidden="true"
                >
                    <img
                        class="absolute inset-0 block size-full select-none"
                        src="https://static.igem.wiki/teams/6133/wiki/homepage/arm.avif"
                        alt=""
                        draggable="false"
                    />
                </div>

                <div
                    class="absolute [top:calc(var(--thinking-y)*1%)] [left:calc(var(--thinking-x)*1%)] z-3 w-[var(--thinking-size)] -translate-x-1/2 -translate-y-1/2"
                >
                    <img
                        class="current-solution__leave-up block h-auto w-full will-change-[transform,opacity] select-none motion-reduce:will-change-auto"
                        src="https://static.igem.wiki/teams/6133/wiki/homepage/thinking.avif"
                        alt="A character thinking"
                        draggable="false"
                    />
                </div>
                <h2
                    id="current-solution-title"
                    class="current-solution__leave-up absolute top-[16.5%] left-[30.5%] z-4 m-0 w-[55%] text-[clamp(1.65rem,2.65vw,2.85rem)] leading-[1.08] font-normal tracking-[0.005em] [text-wrap:balance] will-change-[transform,opacity] motion-reduce:will-change-auto max-[52rem]:top-[9%] max-[52rem]:left-[31%] max-[52rem]:w-[65%] max-[52rem]:text-[clamp(1.35rem,5.4vw,2.25rem)] max-[52rem]:leading-[1.12] portrait:top-[9%] portrait:left-[31%] portrait:w-[65%] portrait:text-[clamp(1.35rem,5.4vw,2.25rem)] portrait:leading-[1.12]"
                >
                    So… is there a real solution to this problem?
                </h2>

                <p
                    class="current-solution__leave-left invisible absolute top-[36.5%] left-[4.5%] z-4 m-0 w-[58%] text-[clamp(1.3rem,2.25vw,2.35rem)] leading-[1.48] tracking-[0.004em] [text-wrap:balance] opacity-0 will-change-[transform,opacity] motion-reduce:will-change-auto max-[52rem]:top-[27%] max-[52rem]:left-[6%] max-[52rem]:w-[88%] max-[52rem]:text-[clamp(1rem,4.1vw,1.5rem)] max-[52rem]:leading-[1.38] portrait:top-[27%] portrait:left-[6%] portrait:w-[88%] portrait:text-[clamp(1rem,4.1vw,1.5rem)] portrait:leading-[1.38]"
                >
                    Despite its prevalence, current clinical and commercial
                    options only work to a certain extent, often at the cost of
                    <span class="text-[#61dfc7]"> notable side effects, </span>
                    frequently
                    <span class="text-[#ff9f1c]"> outweighing </span>
                    the temporary relief they provide.
                </p>

                <p
                    class="current-solution__leave-down invisible absolute top-[75%] left-[3.5%] z-4 m-0 w-[38%] text-center text-[clamp(1.35rem,2.35vw,2.45rem)] leading-[1.3] [text-wrap:balance] opacity-0 will-change-[transform,opacity] motion-reduce:will-change-auto max-[52rem]:top-[72%] max-[52rem]:left-[4%] max-[52rem]:w-[58%] max-[52rem]:text-[clamp(1.05rem,4.4vw,1.6rem)] max-[52rem]:leading-[1.24] portrait:top-[72%] portrait:left-[4%] portrait:w-[58%] portrait:text-[clamp(1.05rem,4.4vw,1.6rem)] portrait:leading-[1.24]"
                >
                    How are there so many complaints below every single product?
                    !
                </p>
                <div
                    class="absolute [top:calc(var(--surprised-y)*1%)] [left:calc(var(--surprised-x)*1%)] z-3 w-[var(--surprised-size)] -translate-x-1/2 -translate-y-1/2"
                >
                    <img
                        class="current-solution__leave-down invisible block h-auto w-full opacity-0 will-change-[transform,opacity] select-none motion-reduce:will-change-auto"
                        src="https://static.igem.wiki/teams/6133/wiki/homepage/surprised.avif"
                        alt="A character looking surprised"
                        draggable="false"
                    />
                </div>

                <div
                    class="absolute [top:calc(var(--knife-y)*1%)] [left:calc(var(--knife-x)*1%)] z-3 w-[var(--knife-width)] -translate-x-1/2 -translate-y-1/2"
                >
                    <img
                        ref="knife"
                        class="invisible block h-auto w-full origin-center rotate-[calc(var(--knife-rotation)*1deg)] opacity-0 will-change-[transform,opacity] select-none motion-reduce:will-change-auto"
                        src="https://static.igem.wiki/teams/6133/wiki/homepage/knife.avif"
                        alt="Scalpel representing physical treatments"
                        draggable="false"
                    />
                </div>
            </div>

            <button
                ref="deodorant"
                type="button"
                class="pointer-events-none invisible absolute [top:calc(var(--deodorant-y)*1%)] [left:calc(var(--deodorant-x)*1%)] z-5 m-0 block w-[var(--deodorant-width)] origin-center cursor-pointer border-0 bg-transparent p-0 opacity-0 will-change-[transform,opacity] select-none focus-visible:outline-3 focus-visible:outline-offset-6 focus-visible:outline-[#65dbbf] motion-reduce:will-change-auto"
                aria-label="Deodorant"
                aria-controls="deodorant-ingredients"
                :aria-pressed="activeIngredient === 'deodorant'"
                @click="toggleIngredientPanel('deodorant')"
                @pointerenter="handleProductHover('deodorant', true)"
                @pointerleave="handleProductHover('deodorant', false)"
                @focus="handleProductHover('deodorant', true)"
                @blur="handleProductHover('deodorant', false)"
            >
                <span
                    ref="deodorantPulse"
                    class="block w-full origin-center will-change-transform motion-reduce:will-change-auto"
                >
                    <img
                        ref="deodorantImage"
                        class="block h-auto w-full origin-center will-change-transform motion-reduce:will-change-auto"
                        src="https://static.igem.wiki/teams/6133/wiki/homepage/dedorant.avif"
                        alt=""
                        draggable="false"
                    />
                </span>
            </button>

            <button
                ref="antiperspirant"
                type="button"
                class="pointer-events-none invisible absolute [top:calc(var(--antiperspirant-y)*1%)] [left:calc(var(--antiperspirant-x)*1%)] z-5 m-0 block w-[var(--antiperspirant-width)] origin-center cursor-pointer border-0 bg-transparent p-0 opacity-0 will-change-[transform,opacity] select-none focus-visible:outline-3 focus-visible:outline-offset-6 focus-visible:outline-[#65dbbf] motion-reduce:will-change-auto"
                aria-label="Antiperspirant"
                aria-controls="antiperspirant-ingredients"
                :aria-pressed="activeIngredient === 'antiperspirant'"
                @click="toggleIngredientPanel('antiperspirant')"
                @pointerenter="handleProductHover('antiperspirant', true)"
                @pointerleave="handleProductHover('antiperspirant', false)"
                @focus="handleProductHover('antiperspirant', true)"
                @blur="handleProductHover('antiperspirant', false)"
            >
                <span
                    ref="antiperspirantPulse"
                    class="block w-full origin-center will-change-transform motion-reduce:will-change-auto"
                >
                    <img
                        ref="antiperspirantImage"
                        class="block h-auto w-full origin-center will-change-transform motion-reduce:will-change-auto"
                        src="https://static.igem.wiki/teams/6133/wiki/homepage/antiperspirant.avif"
                        alt=""
                        draggable="false"
                    />
                </span>
            </button>

            <div
                ref="secondScene"
                class="pointer-events-none invisible absolute inset-0 z-4 opacity-0"
            >
                <p
                    ref="secondCopy"
                    class="absolute top-1/2 left-[43%] z-4 m-0 w-[52%] -translate-y-1/2 text-center text-[clamp(1.75rem,2.75vw,3rem)] leading-[1.36] [text-wrap:balance] max-[52rem]:left-[48%] max-[52rem]:w-[48%] max-[52rem]:text-[clamp(1.3rem,5vw,2rem)] max-[52rem]:leading-[1.3] portrait:left-[48%] portrait:w-[48%] portrait:text-[clamp(1.3rem,5vw,2rem)] portrait:leading-[1.3]"
                >
                    Existing antiperspirants, deodorants and physical treatments
                    primarily block sweat or cover up smell after it is
                    produced.
                </p>
            </div>

            <aside
                id="deodorant-ingredients"
                ref="deodorantPanel"
                class="invisible absolute [top:calc(var(--deodorant-panel-y)*1%)] [left:calc(var(--deodorant-panel-x)*1%)] z-7 grid w-[var(--deodorant-panel-width)] origin-center -translate-x-1/2 -translate-y-1/2 gap-2 rounded-3xl border-3 border-[#65dbbf] bg-white/95 p-[var(--ingredient-panel-padding)] text-[#073873] opacity-0 shadow-[0_1.25rem_3rem_rgb(0_0_0_/_28%)] will-change-[transform,opacity] motion-reduce:will-change-auto"
                :aria-hidden="activeIngredient !== 'deodorant'"
                aria-label="Deodorant active ingredients"
            >
                <h3
                    class="m-0 text-center text-[clamp(1rem,1.35vw,1.35rem)] leading-none"
                >
                    Deodorant active ingredients
                </h3>
                <div class="grid grid-cols-2 gap-2">
                    <article
                        class="grid min-w-0 grid-rows-[minmax(0,1fr)_auto] rounded-2xl bg-[#edf9f7] p-1.5 text-center"
                    >
                        <svg
                            ref="triclosanSvg"
                            class="block h-[clamp(5.5rem,9vw,8rem)] w-full overflow-visible"
                            role="img"
                            aria-label="Triclosan 2D molecular structure"
                        />
                        <h4
                            class="m-0 text-[clamp(0.8rem,1vw,1rem)] leading-none"
                        >
                            Triclosan
                        </h4>
                    </article>
                    <article
                        class="grid min-w-0 grid-rows-[minmax(0,1fr)_auto] rounded-2xl bg-[#edf9f7] p-1.5 text-center"
                    >
                        <svg
                            ref="alcoholSvg"
                            class="block h-[clamp(5.5rem,9vw,8rem)] w-full overflow-visible"
                            role="img"
                            aria-label="Alcohol, ethanol, 2D molecular structure"
                        />
                        <h4
                            class="m-0 text-[clamp(0.8rem,1vw,1rem)] leading-none"
                        >
                            Alcohol
                        </h4>
                    </article>
                </div>
            </aside>

            <aside
                id="antiperspirant-ingredients"
                ref="antiperspirantPanel"
                class="invisible absolute [top:calc(var(--antiperspirant-panel-y)*1%)] [left:calc(var(--antiperspirant-panel-x)*1%)] z-7 grid w-[var(--antiperspirant-panel-width)] origin-center -translate-x-1/2 -translate-y-1/2 gap-3 rounded-3xl border-3 border-[#ffbf43] bg-white/95 p-[var(--ingredient-panel-padding)] text-center text-[#073873] opacity-0 shadow-[0_1.25rem_3rem_rgb(0_0_0_/_28%)] will-change-[transform,opacity] motion-reduce:will-change-auto"
                :aria-hidden="activeIngredient !== 'antiperspirant'"
                aria-label="Antiperspirant active ingredient"
            >
                <h3 class="m-0 text-[clamp(1rem,1.35vw,1.35rem)] leading-none">
                    Aluminum chlorohydrate
                </h3>
                <p
                    class="m-0 text-xl leading-none font-bold whitespace-nowrap [&_sub]:text-[0.58em]"
                    aria-label="Al 2, open parenthesis O H close parenthesis 5, Cl, dot 2 H 2 O"
                >
                    <span class="text-[#2878cf]">Al</span><sub>2</sub>(<span
                        class="text-[#e74c3c]"
                        >O</span
                    ><span class="text-[#263238]">H</span>)<sub>5</sub
                    ><span class="text-[#32a889]">Cl</span>
                    <span class="px-[0.12em] text-[#ff9f1c]">⋅</span>
                    2<span class="text-[#263238]">H</span><sub>2</sub
                    ><span class="text-[#e74c3c]">O</span>
                </p>
            </aside>
        </div>
    </section>
</template>

<style scoped>
.current-solution__stage {
    --thinking-x: 21;
    --thinking-y: 19;
    --thinking-size: clamp(7.5rem, 12vw, 12rem);
    --surprised-x: 47;
    --surprised-y: 81;
    --surprised-size: clamp(7rem, 12vw, 12rem);
    --knife-x: 89;
    --knife-y: 31;
    --knife-width: clamp(7rem, 15vw, 15rem);
    --knife-rotation: -45;
    --deodorant-x: 77;
    --deodorant-y: 47;
    --deodorant-width: clamp(6rem, 10.5vw, 13rem);
    --deodorant-rotation: 158;
    --deodorant-second-x: 33;
    --deodorant-second-y: 35;
    --deodorant-second-rotation: 40;
    --deodorant-second-scale: 1;
    --antiperspirant-x: 70;
    --antiperspirant-y: 73;
    --antiperspirant-width: clamp(7rem, 13vw, 13rem);
    --antiperspirant-rotation: 110;
    --antiperspirant-second-x: 17;
    --antiperspirant-second-y: 57;
    --antiperspirant-second-rotation: -23;
    --antiperspirant-second-scale: 1.7;
    --arm-size: clamp(28rem, 70svh, 44rem);
    --product-hint-scale: 1.02;
    --product-hover-scale: 1.14;
    --deodorant-panel-width: clamp(16rem, 20vw, 22rem);
    --deodorant-panel-x: 35;
    --deodorant-panel-y: 75;
    --antiperspirant-panel-width: clamp(18rem, 23vw, 24rem);
    --antiperspirant-panel-x: 16;
    --antiperspirant-panel-y: 19;
    --ingredient-panel-padding: clamp(0.75rem, 1.15vw, 1.15rem);
    background:
        radial-gradient(
            circle at 76% 46%,
            rgb(15 76 144 / 18%),
            transparent 30%
        ),
        #073873;
}

@media (max-width: 52rem), (orientation: portrait) {
    .current-solution__stage {
        --thinking-x: 17;
        --thinking-y: 13;
        --thinking-size: clamp(5.6rem, 24vw, 9rem);
        --surprised-x: 75;
        --surprised-y: 81;
        --surprised-size: clamp(6.5rem, 27vw, 10rem);
        --knife-x: 94;
        --knife-y: 62;
        --knife-width: clamp(2.2rem, 9vw, 3.5rem);
        --deodorant-x: 82;
        --deodorant-y: 47;
        --deodorant-width: clamp(4.4rem, 18vw, 7rem);
        --deodorant-second-x: 28;
        --deodorant-second-y: 31;
        --deodorant-second-scale: 0.9;
        --antiperspirant-x: 78;
        --antiperspirant-y: 62;
        --antiperspirant-width: clamp(5rem, 21vw, 8rem);
        --antiperspirant-second-x: 23;
        --antiperspirant-second-y: 64;
        --antiperspirant-second-scale: 1.36;
        --arm-size: clamp(18rem, 88vw, 32rem);
        --product-hint-scale: 1.06;
        --product-hover-scale: 1.1;
        --deodorant-panel-width: clamp(15rem, 72vw, 20rem);
        --deodorant-panel-x: 60;
        --deodorant-panel-y: 28;
        --antiperspirant-panel-width: clamp(17rem, 76vw, 22rem);
        --antiperspirant-panel-x: 60;
        --antiperspirant-panel-y: 73;
        --ingredient-panel-padding: clamp(0.65rem, 3vw, 1rem);
    }
}
</style>
