<script setup lang="ts">
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { nextTick, onMounted, onUnmounted, ref } from "vue";

gsap.registerPlugin(ScrollTrigger);

type DetailKind = "irritation" | "ecosystem";

const SURGERY_MOTION = {
    scrollScreens: 5.2,
    scrub: 0.65,
    detailThreshold: 0.25,
    knifeStartX: 0.8,
    syringeStartX: 1.03,
} as const;

const scene = ref<HTMLElement | null>(null);
const stage = ref<HTMLElement | null>(null);
const panel = ref<HTMLElement | null>(null);
const panelShell = ref<HTMLElement | null>(null);
const firstScene = ref<HTMLElement | null>(null);
const wipe = ref<HTMLElement | null>(null);
const knife = ref<HTMLImageElement | null>(null);
const syringe = ref<HTMLImageElement | null>(null);
const secondScene = ref<HTMLElement | null>(null);
const finalScene = ref<HTMLElement | null>(null);
const irritationDetail = ref<HTMLElement | null>(null);
const ecosystemDetail = ref<HTMLElement | null>(null);

const activeDetail = ref<DetailKind | null>(null);

let media: gsap.MatchMedia | undefined;
let detailInteractionEnabled = false;

function stageCssNumber(property: string) {
    if (!stage.value) return 0;

    return (
        Number.parseFloat(
            window.getComputedStyle(stage.value).getPropertyValue(property),
        ) || 0
    );
}

function detailElement(kind: DetailKind) {
    return kind === "irritation"
        ? irritationDetail.value
        : ecosystemDetail.value;
}

function hideDetails(immediate = false) {
    const details = [irritationDetail.value, ecosystemDetail.value].filter(
        (item): item is HTMLElement => Boolean(item),
    );

    activeDetail.value = null;
    if (immediate) {
        gsap.set(details, { autoAlpha: 0, scale: 0.9, y: 10 });
        return;
    }

    gsap.to(details, {
        autoAlpha: 0,
        scale: 0.9,
        y: 10,
        duration: 0.2,
        ease: "power2.in",
        overwrite: true,
    });
}

function showDetail(kind: DetailKind) {
    if (!detailInteractionEnabled) return;

    const selected = detailElement(kind);
    const other = detailElement(
        kind === "irritation" ? "ecosystem" : "irritation",
    );
    if (!selected) return;

    activeDetail.value = kind;
    if (other) {
        gsap.to(other, {
            autoAlpha: 0,
            scale: 0.9,
            y: 10,
            duration: 0.18,
            overwrite: true,
        });
    }
    gsap.fromTo(
        selected,
        { autoAlpha: 0, scale: 0.9, y: 12 },
        {
            autoAlpha: 1,
            scale: 1,
            y: 0,
            duration: 0.38,
            ease: "back.out(1.45)",
            overwrite: true,
        },
    );
}

function handleDetailHover(kind: DetailKind, hovering: boolean) {
    if (hovering) showDetail(kind);
    else if (activeDetail.value === kind) hideDetails();
}

onMounted(async () => {
    await nextTick();

    if (
        !scene.value ||
        !stage.value ||
        !panel.value ||
        !panelShell.value ||
        !firstScene.value ||
        !wipe.value ||
        !knife.value ||
        !syringe.value ||
        !secondScene.value ||
        !finalScene.value ||
        !irritationDetail.value ||
        !ecosystemDetail.value
    ) {
        return;
    }

    const refs = {
        scene: scene.value,
        stage: stage.value,
        panel: panel.value,
        panelShell: panelShell.value,
        firstScene: firstScene.value,
        wipe: wipe.value,
        knife: knife.value,
        syringe: syringe.value,
        secondScene: secondScene.value,
        finalScene: finalScene.value,
        irritationDetail: irritationDetail.value,
        ecosystemDetail: ecosystemDetail.value,
    };

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
            const introItems = gsap.utils.toArray<HTMLElement>(
                "[data-surgery-intro]",
                refs.firstScene,
            );
            const secondItems = gsap.utils.toArray<HTMLElement>(
                "[data-surgery-second]",
                refs.secondScene,
            );
            const finalItems = gsap.utils.toArray<HTMLElement>(
                "[data-surgery-final]",
                refs.finalScene,
            );
            const details = [refs.irritationDetail, refs.ecosystemDetail];
            const instruments = [refs.knife, refs.syringe];

            gsap.set(details, { autoAlpha: 0, scale: 0.9, y: 10 });
            gsap.set(refs.wipe, { x: () => refs.panel.clientWidth });
            gsap.set([refs.secondScene, refs.finalScene], { autoAlpha: 0 });
            gsap.set(secondItems, { autoAlpha: 0, y: 24 });
            gsap.set(finalItems, { autoAlpha: 0, y: 28 });

            if (reduceMotion) {
                gsap.set(refs.panelShell, { autoAlpha: 1, y: 0, scale: 1 });
                gsap.set(introItems, { autoAlpha: 0 });
                gsap.set(instruments, { autoAlpha: 0 });
                gsap.set(refs.wipe, {
                    x: () => -(refs.wipe.offsetWidth - refs.panel.clientWidth),
                });
                gsap.set(refs.finalScene, { autoAlpha: 1 });
                gsap.set(finalItems, { autoAlpha: 1, y: 0 });
                return;
            }

            gsap.set(refs.panelShell, { autoAlpha: 0, y: 46, scale: 0.975 });
            gsap.set(introItems, { autoAlpha: 0, y: 24 });
            gsap.set(refs.knife, {
                autoAlpha: 0,
                x: () => refs.panel.clientWidth * SURGERY_MOTION.knifeStartX,
                y: 12,
                rotation: () => stageCssNumber("--knife-start-rotation"),
            });
            gsap.set(refs.syringe, {
                autoAlpha: 0,
                x: () => refs.panel.clientWidth * SURGERY_MOTION.syringeStartX,
                y: -10,
                rotation: () => stageCssNumber("--syringe-start-rotation"),
            });

            const entrance = gsap.timeline({
                defaults: { ease: "power3.out" },
                scrollTrigger: {
                    id: "surgery-entrance",
                    trigger: refs.scene,
                    start: "top 84%",
                    end: "top 42%",
                    scrub: 0.45,
                    invalidateOnRefresh: true,
                },
            });
            entrance
                .to(refs.panelShell, {
                    autoAlpha: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.5,
                })
                .to(
                    introItems,
                    {
                        autoAlpha: 1,
                        y: 0,
                        duration: 0.58,
                        stagger: 0.07,
                    },
                    "-=0.28",
                );

            const hold = { value: 0 };
            let firstSceneInteractive = false;
            const story = gsap.timeline({
                defaults: { ease: "none" },
                scrollTrigger: {
                    id: "surgery-story",
                    trigger: refs.scene,
                    start: "top top",
                    end: () =>
                        `+=${window.innerHeight * SURGERY_MOTION.scrollScreens}`,
                    pin: true,
                    scrub: SURGERY_MOTION.scrub,
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                    onUpdate: (self) => {
                        const shouldEnable =
                            self.progress < SURGERY_MOTION.detailThreshold;
                        if (shouldEnable === firstSceneInteractive) return;

                        firstSceneInteractive = shouldEnable;
                        detailInteractionEnabled = shouldEnable;
                        if (!shouldEnable) hideDetails(true);
                    },
                },
            });

            story
                .addLabel("overview", 0)
                .to(hold, { value: 1, duration: 0.72 }, "overview")
                .addLabel("erase")
                .to(
                    refs.wipe,
                    {
                        x: () =>
                            -(refs.wipe.offsetWidth - refs.panel.clientWidth),
                        duration: 1.22,
                        ease: "power1.out",
                    },
                    "erase",
                )
                .to(
                    refs.knife,
                    {
                        autoAlpha: 1,
                        x: 0,
                        y: 0,
                        rotation: () => stageCssNumber("--knife-rotation"),
                        duration: 1.16,
                        ease: "power1.out",
                    },
                    "erase",
                )
                .to(
                    refs.syringe,
                    {
                        autoAlpha: 1,
                        x: 0,
                        y: 0,
                        rotation: () => stageCssNumber("--syringe-rotation"),
                        duration: 1.1,
                        ease: "power1.out",
                    },
                    "erase+=0.08",
                )
                .to(
                    refs.firstScene,
                    { autoAlpha: 0, duration: 0.12 },
                    "erase+=1.1",
                )
                .addLabel("clinical")
                .to(
                    refs.secondScene,
                    { autoAlpha: 1, duration: 0.16 },
                    "clinical",
                )
                .to(
                    secondItems,
                    {
                        autoAlpha: 1,
                        y: 0,
                        duration: 0.48,
                        stagger: 0.08,
                        ease: "power2.out",
                    },
                    "clinical+=0.05",
                )
                .to(hold, { value: 2, duration: 0.86 }, ">+0.06")
                .addLabel("restrictions")
                .to(
                    [refs.secondScene, refs.knife, refs.syringe],
                    {
                        autoAlpha: 0,
                        x: (index) => (index === 0 ? 0 : -36),
                        duration: 0.34,
                        ease: "power2.in",
                    },
                    "restrictions",
                )
                .to(
                    refs.finalScene,
                    { autoAlpha: 1, duration: 0.22 },
                    "restrictions+=0.2",
                )
                .to(
                    finalItems,
                    {
                        autoAlpha: 1,
                        y: 0,
                        duration: 0.56,
                        stagger: 0.1,
                        ease: "power3.out",
                    },
                    "restrictions+=0.24",
                )
                .to(hold, { value: 3, duration: 1 }, ">+0.05");

            detailInteractionEnabled = true;
            firstSceneInteractive = true;

            return () => {
                detailInteractionEnabled = false;
                hideDetails(true);
                entrance.kill();
                story.kill();
            };
        },
        scene.value,
    );

    void nextTick(() => ScrollTrigger.refresh());
});

onUnmounted(() => {
    detailInteractionEnabled = false;
    hideDetails(true);
    media?.revert();
    media = undefined;
    ScrollTrigger.getById("surgery-entrance")?.kill(true);
    ScrollTrigger.getById("surgery-story")?.kill(true);
});
</script>

<template>
    <section
        id="surgery"
        ref="scene"
        class="relative h-svh min-h-[38rem] w-full overflow-hidden bg-[#03316d] font-righteous text-white max-[52rem]:min-h-[42rem] portrait:min-h-[42rem]"
        aria-labelledby="surgery-title"
    >
        <div ref="stage" class="surgery__stage absolute inset-0">
            <div
                ref="panelShell"
                class="absolute top-[var(--panel-y)] left-[var(--panel-x)] h-[var(--panel-height)] w-[var(--panel-width)] will-change-[transform,opacity] motion-reduce:will-change-auto"
            >
                <div
                    class="absolute inset-0 z-0 [transform:translate(var(--shadow-x),var(--shadow-y))] rounded-[var(--panel-radius)] bg-[#347ad5]"
                    aria-hidden="true"
                />

                <article
                    ref="panel"
                    class="absolute inset-0 z-10 overflow-hidden rounded-[var(--panel-radius)] bg-[#0a4297]"
                >
                    <div ref="firstScene" class="absolute inset-0 z-20">
                        <h2
                            id="surgery-title"
                            class="absolute top-[5%] left-[7%] m-0 w-[86%] text-center text-[clamp(1.45rem,2.35vw,2.45rem)] leading-[1.28] font-normal [text-wrap:balance] max-[52rem]:top-[4%] max-[52rem]:left-[5%] max-[52rem]:w-[90%] max-[52rem]:text-[clamp(1rem,4.3vw,1.55rem)] max-[52rem]:leading-[1.22] portrait:top-[4%] portrait:left-[5%] portrait:w-[90%] portrait:text-[clamp(1rem,4.3vw,1.55rem)] portrait:leading-[1.22]"
                            data-surgery-intro
                        >
                            Unfortunately, products that rely heavily on
                            aluminum salts or strong antimicrobials may irritate
                            skin and disrupt our natural axillary ecosystem.
                        </h2>

                        <img
                            class="absolute top-[var(--skin-y)] left-1/2 h-auto w-[var(--skin-width)] -translate-x-1/2 -translate-y-1/2 select-none"
                            data-surgery-intro
                            src="/skinmess.png"
                            alt="Illustration of irritated skin and an unbalanced axillary microbiome"
                            draggable="false"
                        />

                        <button
                            type="button"
                            class="absolute top-[var(--skin-irritation-target-y)] left-[5%] z-30 m-0 flex w-[calc(var(--skin-irritation-target-x)-5%)] -translate-y-1/2 cursor-pointer items-center gap-[.7rem] border-0 bg-transparent p-0 text-left text-[clamp(1.3rem,2.35vw,2.45rem)] leading-[1.18] text-[#ffad2f] will-change-[transform,opacity] hover:text-[#ffd166] focus-visible:rounded-[.35rem] focus-visible:text-[#ffd166] focus-visible:outline-[.2rem] focus-visible:outline-offset-[.4rem] focus-visible:outline-[#61dfc7] aria-[expanded=true]:text-[#ffd166] max-[52rem]:gap-[.4rem] max-[52rem]:text-[clamp(1rem,4.1vw,1.4rem)] portrait:gap-[.4rem] portrait:text-[clamp(1rem,4.1vw,1.4rem)]"
                            data-surgery-intro
                            aria-controls="skin-irritation-detail"
                            :aria-expanded="activeDetail === 'irritation'"
                            @click="showDetail('irritation')"
                            @pointerenter="
                                handleDetailHover('irritation', true)
                            "
                            @pointerleave="
                                handleDetailHover('irritation', false)
                            "
                            @focus="handleDetailHover('irritation', true)"
                            @blur="handleDetailHover('irritation', false)"
                        >
                            <span class="shrink-0">Skin irritation</span>
                            <i
                                class="relative block h-[.35rem] min-w-0 flex-1 rounded-full bg-white after:absolute after:top-1/2 after:right-0 after:size-[1.12rem] after:translate-x-1/2 after:-translate-y-1/2 after:rounded-full after:border-[.35rem] after:border-white after:bg-[#ff8e81] after:content-[''] max-[52rem]:h-1 max-[52rem]:after:size-[.9rem] max-[52rem]:after:border-[.25rem] portrait:h-1 portrait:after:size-[.9rem] portrait:after:border-[.25rem]"
                                aria-hidden="true"
                            />
                        </button>

                        <button
                            type="button"
                            class="absolute top-[var(--axillary-ecosystem-target-y)] right-[5%] left-[var(--axillary-ecosystem-target-x)] z-30 m-0 flex -translate-y-1/2 cursor-pointer items-center gap-[.7rem] border-0 bg-transparent p-0 text-center text-[clamp(1.3rem,2.35vw,2.45rem)] leading-[1.18] text-[#ffad2f] will-change-[transform,opacity] hover:text-[#ffd166] focus-visible:rounded-[.35rem] focus-visible:text-[#ffd166] focus-visible:outline-[.2rem] focus-visible:outline-offset-[.4rem] focus-visible:outline-[#61dfc7] aria-[expanded=true]:text-[#ffd166] max-[52rem]:gap-[.4rem] max-[52rem]:text-[clamp(1rem,4.1vw,1.4rem)] portrait:gap-[.4rem] portrait:text-[clamp(1rem,4.1vw,1.4rem)]"
                            data-surgery-intro
                            aria-controls="ecosystem-detail"
                            :aria-expanded="activeDetail === 'ecosystem'"
                            @click="showDetail('ecosystem')"
                            @pointerenter="handleDetailHover('ecosystem', true)"
                            @pointerleave="
                                handleDetailHover('ecosystem', false)
                            "
                            @focus="handleDetailHover('ecosystem', true)"
                            @blur="handleDetailHover('ecosystem', false)"
                        >
                            <i
                                class="relative block h-[.35rem] min-w-0 flex-1 rounded-full bg-white after:absolute after:top-1/2 after:left-0 after:size-[1.12rem] after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full after:border-[.35rem] after:border-white after:bg-[#61dfc7] after:content-[''] max-[52rem]:h-1 max-[52rem]:after:size-[.9rem] max-[52rem]:after:border-[.25rem] portrait:h-1 portrait:after:size-[.9rem] portrait:after:border-[.25rem]"
                                aria-hidden="true"
                            />
                            <span class="shrink-0"
                                >Unbalanced<br />axillary ecosystem</span
                            >
                        </button>

                        <aside
                            id="skin-irritation-detail"
                            ref="irritationDetail"
                            class="pointer-events-none absolute top-[52%] left-[1.8%] z-50 w-[min(31%,27rem)] origin-center rounded-[2rem] bg-[#347ad5] p-[clamp(1rem,1.8vw,1.65rem)] text-[clamp(.85rem,1.35vw,1.35rem)] leading-[1.46] text-white shadow-[0_1.15rem_2.5rem_rgb(1_24_58_/_28%)] after:absolute after:top-[-.95rem] after:left-[48%] after:size-0 after:border-x-[1rem] after:border-b-[1rem] after:border-x-transparent after:border-b-[#347ad5] after:content-[''] max-[52rem]:top-[33%] max-[52rem]:left-[10%] max-[52rem]:w-[80%] max-[52rem]:rounded-[1.35rem] max-[52rem]:p-4 max-[52rem]:text-[clamp(.78rem,3.4vw,1rem)] max-[52rem]:leading-[1.34] max-[52rem]:after:hidden portrait:top-[33%] portrait:left-[10%] portrait:w-[80%] portrait:rounded-[1.35rem] portrait:p-4 portrait:text-[clamp(.78rem,3.4vw,1rem)] portrait:leading-[1.34] portrait:after:hidden"
                            :aria-hidden="activeDetail !== 'irritation'"
                        >
                            <ul class="m-0 grid gap-[1.1rem] pl-[1.2em]">
                                <li>
                                    Trapped sweat may enter the dermis, causing
                                    local immune responses known as miliaria
                                    rubra.
                                </li>
                                <li>
                                    Common antiperspirants rely on the
                                    hydrolysis of metal salts to clog sweat
                                    pores.
                                </li>
                            </ul>
                        </aside>

                        <aside
                            id="ecosystem-detail"
                            ref="ecosystemDetail"
                            class="pointer-events-none absolute top-[29%] right-[2.5%] z-50 w-[min(31%,27rem)] origin-center rounded-[2rem] bg-[#347ad5] p-[clamp(1rem,1.8vw,1.65rem)] text-[clamp(.85rem,1.35vw,1.35rem)] leading-[1.46] text-white shadow-[0_1.15rem_2.5rem_rgb(1_24_58_/_28%)] after:absolute after:bottom-[-.95rem] after:left-[46%] after:size-0 after:border-x-[1rem] after:border-t-[1rem] after:border-x-transparent after:border-t-[#347ad5] after:content-[''] max-[52rem]:top-[33%] max-[52rem]:right-auto max-[52rem]:left-[10%] max-[52rem]:w-[80%] max-[52rem]:rounded-[1.35rem] max-[52rem]:p-4 max-[52rem]:text-[clamp(.78rem,3.4vw,1rem)] max-[52rem]:leading-[1.34] max-[52rem]:after:hidden portrait:top-[33%] portrait:right-auto portrait:left-[10%] portrait:w-[80%] portrait:rounded-[1.35rem] portrait:p-4 portrait:text-[clamp(.78rem,3.4vw,1rem)] portrait:leading-[1.34] portrait:after:hidden"
                            :aria-hidden="activeDetail !== 'ecosystem'"
                        >
                            <ul class="m-0 grid gap-[1.1rem] pl-[1.2em]">
                                <li>
                                    Deodorant use increases the diversity of the
                                    axillary microbiome.
                                </li>
                                <li>
                                    Antiperspirant use can stimulate activity of
                                    certain odor-producing bacteria.
                                </li>
                            </ul>
                        </aside>
                    </div>

                    <div
                        ref="wipe"
                        class="surgery__wipe pointer-events-none absolute left-0 z-30 bg-[#0a4297] will-change-transform"
                        aria-hidden="true"
                    />

                    <div ref="secondScene" class="absolute inset-0 z-50">
                        <p
                            class="absolute top-[14%] left-[40%] m-0 w-[43%] text-center text-[clamp(1.5rem,2.7vw,2.8rem)] leading-[1.3] [text-wrap:balance] max-[52rem]:top-[12%] max-[52rem]:left-[38%] max-[52rem]:w-[43%] max-[52rem]:text-[clamp(1.05rem,4.2vw,1.55rem)] portrait:top-[12%] portrait:left-[38%] portrait:w-[43%] portrait:text-[clamp(1.05rem,4.2vw,1.55rem)]"
                            data-surgery-second
                        >
                            Hmm, surgical removal of sweat glands seems to offer
                            a more permanent solution.
                        </p>
                        <img
                            class="absolute top-[12%] right-[2.5%] h-auto w-[clamp(9rem,14vw,14rem)] rotate-14 select-none max-[52rem]:top-[31%] max-[52rem]:right-[1.5%] max-[52rem]:w-[clamp(4.5rem,17vw,7rem)] portrait:top-[31%] portrait:right-[1.5%] portrait:w-[clamp(4.5rem,17vw,7rem)]"
                            data-surgery-second
                            src="/questioning.png"
                            alt="A character questioning the surgical option"
                            draggable="false"
                        />
                        <p
                            class="absolute top-[58%] left-[40%] m-0 w-[55%] text-center text-[clamp(1.25rem,2.25vw,2.35rem)] leading-[1.45] [text-wrap:balance] max-[52rem]:top-[55%] max-[52rem]:left-[36%] max-[52rem]:w-[60%] max-[52rem]:text-[clamp(.85rem,3.55vw,1.2rem)] max-[52rem]:leading-[1.35] portrait:top-[55%] portrait:left-[36%] portrait:w-[60%] portrait:text-[clamp(.85rem,3.55vw,1.2rem)] portrait:leading-[1.35]"
                            data-surgery-second
                        >
                            In clinical practice, it is sometimes considered as
                            the last-resort intervention when other methods fail
                            to provide sufficient effectiveness.
                        </p>
                    </div>

                    <div
                        ref="finalScene"
                        class="absolute inset-0 z-[70] bg-[#0a4297]"
                    >
                        <p
                            class="absolute top-[8%] left-[5%] m-0 w-[90%] text-[clamp(1.25rem,2.15vw,2.25rem)] leading-[1.48] [text-wrap:balance] max-[52rem]:top-[4%] max-[52rem]:left-[4%] max-[52rem]:w-[92%] max-[52rem]:text-[clamp(.78rem,3.2vw,1.05rem)] max-[52rem]:leading-[1.3] portrait:top-[4%] portrait:left-[4%] portrait:w-[92%] portrait:text-[clamp(.78rem,3.2vw,1.05rem)] portrait:leading-[1.3]"
                            data-surgery-final
                        >
                            However, this option is generally restricted to
                            certain groups of people and is not suitable for
                            minors, gravida, or conservative groups. It also
                            carries significant medical risks, including
                            scarring, nerve damage, and irreversible alteration
                            of thermoregulatory function.
                        </p>

                        <div
                            class="absolute right-[7%] bottom-[2%] left-[7%] grid h-[53%] grid-cols-3 items-end gap-[7%] max-[52rem]:right-[4%] max-[52rem]:bottom-[3%] max-[52rem]:left-[4%] max-[52rem]:h-1/2 max-[52rem]:gap-[2%] portrait:right-[4%] portrait:bottom-[3%] portrait:left-[4%] portrait:h-1/2 portrait:gap-[2%]"
                        >
                            <figure
                                class="m-0 grid h-full grid-rows-[minmax(0,1fr)_auto] text-center"
                                data-surgery-final
                            >
                                <img
                                    class="block size-full min-h-0 object-contain select-none"
                                    src="/minors.png"
                                    alt="A minor"
                                    draggable="false"
                                />
                                <figcaption
                                    class="min-h-[1.25em] text-[clamp(.8rem,1.2vw,1.15rem)] text-[#ffd166] max-[52rem]:text-[clamp(.65rem,2.8vw,.9rem)] portrait:text-[clamp(.65rem,2.8vw,.9rem)]"
                                >
                                    Minors
                                </figcaption>
                            </figure>
                            <figure
                                class="m-0 grid h-full grid-rows-[minmax(0,1fr)_auto] text-center"
                                data-surgery-final
                            >
                                <img
                                    class="block size-full min-h-0 object-contain select-none"
                                    src="/gravida.png"
                                    alt="A pregnant person"
                                    draggable="false"
                                />
                                <figcaption
                                    class="min-h-[1.25em] text-[clamp(.8rem,1.2vw,1.15rem)] text-[#ffd166] max-[52rem]:text-[clamp(.65rem,2.8vw,.9rem)] portrait:text-[clamp(.65rem,2.8vw,.9rem)]"
                                >
                                    Gravida
                                </figcaption>
                            </figure>
                            <figure
                                class="m-0 grid h-full grid-rows-[minmax(0,1fr)_auto] text-center"
                                data-surgery-final
                            >
                                <img
                                    class="block size-full min-h-0 object-contain select-none"
                                    src="/conservative.png"
                                    alt="A person for whom conservative treatment is preferred"
                                    draggable="false"
                                />
                                <figcaption
                                    class="min-h-[1.25em] text-[clamp(.8rem,1.2vw,1.15rem)] text-[#ffd166] max-[52rem]:text-[clamp(.65rem,2.8vw,.9rem)] portrait:text-[clamp(.65rem,2.8vw,.9rem)]"
                                >
                                    Conservative groups
                                </figcaption>
                            </figure>
                        </div>
                    </div>
                </article>

                <img
                    ref="knife"
                    class="pointer-events-none absolute top-[var(--knife-y)] left-[var(--knife-x)] z-[60] block h-auto w-[var(--knife-width)] origin-center will-change-[transform,opacity] select-none motion-reduce:will-change-auto"
                    src="/knifecartoon.png"
                    alt=""
                    draggable="false"
                />
                <img
                    ref="syringe"
                    class="pointer-events-none absolute top-[var(--syringe-y)] left-[var(--syringe-x)] z-[60] block h-auto w-[var(--syringe-width)] origin-center will-change-[transform,opacity] select-none motion-reduce:will-change-auto"
                    src="/syringecartoon.png"
                    alt=""
                    draggable="false"
                />
            </div>
        </div>
    </section>
</template>

<style scoped>
.surgery__stage {
    --panel-x: 7%;
    --panel-y: 13%;
    --panel-width: 86%;
    --panel-height: 76%;
    --panel-radius: 2.3rem;
    --shadow-x: 1.75rem;
    --shadow-y: 1.35rem;
    --skin-y: 30%;
    --skin-width: 35vw;
    --skin-irritation-target-x: 50%;
    --skin-irritation-target-y: 45%;
    --axillary-ecosystem-target-x: 53%;
    --axillary-ecosystem-target-y: 79%;
    --knife-width: 5vw;
    --knife-x: 27.5%;
    --knife-y: 7%;
    --knife-start-rotation: -50;
    --knife-rotation: 16;
    --syringe-width: 27vw;
    --syringe-x: 0%;
    --syringe-y: 17%;
    --syringe-start-rotation: 0;
    --syringe-rotation: 52;
    --wipe-feather: 12vw;
    --wipe-filter-blur: 0.8rem;
}

.surgery__wipe {
    top: -2rem;
    bottom: -2rem;
    width: calc(100% + var(--wipe-feather));
    filter: blur(var(--wipe-filter-blur));
    mask-image: linear-gradient(
        to right,
        transparent 0,
        #000 var(--wipe-feather)
    );
    mask-repeat: no-repeat;
    mask-mode: alpha;
    -webkit-mask-image: linear-gradient(
        to right,
        transparent 0,
        #000 var(--wipe-feather)
    );
    -webkit-mask-repeat: no-repeat;
}

@media (max-width: 52rem), (orientation: portrait) {
    .surgery__stage {
        --panel-x: 5%;
        --panel-y: 7%;
        --panel-width: 90%;
        --panel-height: 84%;
        --panel-radius: 1.6rem;
        --shadow-x: 0.75rem;
        --shadow-y: 0.8rem;
        --skin-y: 49%;
        --skin-width: clamp(13rem, 56vw, 22rem);
        --skin-irritation-target-x: 50%;
        --skin-irritation-target-y: 72%;
        --axillary-ecosystem-target-x: 50%;
        --axillary-ecosystem-target-y: 88%;
        --knife-width: clamp(3rem, 10vw, 5.5rem);
        --knife-x: 18%;
        --knife-y: 26%;
        --knife-start-rotation: 10;
        --knife-rotation: 18;
        --syringe-width: clamp(12rem, 42vw, 16rem);
        --syringe-x: -7%;
        --syringe-y: 13%;
        --syringe-start-rotation: 0;
        --syringe-rotation: 52;
        --wipe-feather: clamp(5rem, 22vw, 8rem);
        --wipe-filter-blur: 0.6rem;
    }
}
</style>
