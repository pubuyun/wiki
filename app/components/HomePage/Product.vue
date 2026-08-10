<script setup lang="ts">
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { onBeforeUnmount, onMounted, ref } from "vue";

gsap.registerPlugin(ScrollTrigger);

type ProductModelElement = HTMLElement;

type PointerOrientation = {
    roll: number;
    pitch: number;
    yaw: number;
};

const FEATURES = [
    {
        id: "targeted",
        title: "Targeted",
        image: "/targeted.png",
        side: "left",
        tone: "strong",
    },
    {
        id: "safe",
        title: "Safe",
        image: "/safe.png",
        side: "right",
        tone: "strong",
    },
    {
        id: "clothes",
        title: "No damage to clothes",
        image: "/clothes.png",
        side: "left",
        tone: "soft",
    },
    {
        id: "sustainable",
        title: "Sustainable",
        image: "/sustainable.png",
        side: "right",
        tone: "soft",
    },
    {
        id: "fragrance",
        title: "Customised fragrance",
        image: "/ostumised.png",
        side: "left",
        tone: "strong",
    },
] as const;

// Keep these in the same order and at the same angles as Solution.vue's
// opening overview so the painted frame hands off naturally to that scene.
const SOLUTION_PREVIEWS = [
    {
        id: "precursor-binder",
        title: "Precursor Binder",
        image: "https://static.igem.wiki/teams/6133/wiki/homepage/bindernoeyes.avif",
        color: "#ffd55e",
        angle: -90,
    },
    {
        id: "transporter-binder",
        title: "Transporter Binder",
        image: "https://static.igem.wiki/teams/6133/wiki/homepage/plugoutlined.avif",
        color: "#ffae37",
        angle: 30,
    },
    {
        id: "cgtase",
        title: "CGTase",
        image: "https://static.igem.wiki/teams/6133/wiki/homepage/cgtasseoutlined.avif",
        color: "#52dfc5",
        angle: 150,
    },
] as const;

// Vertical alignment for the two interchangeable product states. These are
// percentages of the shared product rig height; tune them until the bottle
// silhouette stays still at the splitModel timeline label.
const MODEL_LAYOUT = {
    withLidYPercent: 0,
    withoutLidYPercent: 0,
} as const;

const withLidLayoutStyle = {
    transform: `translateY(${MODEL_LAYOUT.withLidYPercent}%)`,
};
const withoutLidLayoutStyle = {
    transform: `translateY(${MODEL_LAYOUT.withoutLidYPercent}%)`,
};

// Lid-only alignment controls. Adjust these without changing either bottle or
// the shared model-viewer camera.
const LID_LAYOUT = {
    scale: 0.6,
    xPercent: 10,
    yPercent: 10,
} as const;

const lidLayoutStyle = {
    transform: `translate(${LID_LAYOUT.xPercent}%, ${LID_LAYOUT.yPercent}%) scale(${LID_LAYOUT.scale})`,
};

const scene = ref<HTMLElement | null>(null);
const productRig = ref<HTMLElement | null>(null);
const combinedRig = ref<HTMLElement | null>(null);
const separatedRig = ref<HTMLElement | null>(null);
const lidRig = ref<HTMLElement | null>(null);
const featureLayer = ref<HTMLElement | null>(null);
const transitionLayer = ref<HTMLElement | null>(null);
const paintCircle = ref<SVGCircleElement | null>(null);
const scrollHint = ref<HTMLElement | null>(null);
const combinedModel = ref<ProductModelElement | null>(null);
const bottleModel = ref<ProductModelElement | null>(null);
const lidModel = ref<ProductModelElement | null>(null);
const modelsReady = ref(false);
const loadedModels = new Set<string>();

const modelOrientation = {
    roll: 0,
    pitch: 0,
    yaw: 0,
    parallaxStrength: 1,
};
const pointerOrientation: PointerOrientation = {
    roll: 0,
    pitch: 0,
    yaw: 0,
};
const orbitState = { angle: -90 };

let media: gsap.MatchMedia | undefined;
let pointerTween: gsap.core.Tween | undefined;

function applyModelOrientation() {
    const strength = modelOrientation.parallaxStrength;
    const orientation = `${modelOrientation.roll + pointerOrientation.roll * strength}deg ${modelOrientation.pitch + pointerOrientation.pitch * strength}deg ${modelOrientation.yaw + pointerOrientation.yaw * strength}deg`;

    combinedModel.value?.setAttribute("orientation", orientation);
    bottleModel.value?.setAttribute("orientation", orientation);
    lidModel.value?.setAttribute("orientation", orientation);
}

function tweenPointer(target: PointerOrientation) {
    pointerTween?.kill();
    pointerTween = gsap.to(pointerOrientation, {
        ...target,
        duration: 0.65,
        ease: "power3.out",
        overwrite: "auto",
        onUpdate: applyModelOrientation,
    });
}

function handlePointerMove(event: PointerEvent) {
    if (!scene.value || event.pointerType === "touch") return;

    const bounds = scene.value.getBoundingClientRect();
    const x = gsap.utils.clamp(
        -1,
        1,
        ((event.clientX - bounds.left) / bounds.width - 0.5) * 2,
    );
    const y = gsap.utils.clamp(
        -1,
        1,
        ((event.clientY - bounds.top) / bounds.height - 0.5) * 2,
    );

    tweenPointer({
        roll: x * 1.25,
        pitch: -y * 3.5,
        yaw: x * 5,
    });
}

function resetPointer() {
    tweenPointer({ roll: 0, pitch: 0, yaw: 0 });
}

function handleModelLoad(model: string) {
    loadedModels.add(model);
    modelsReady.value = loadedModels.size === 3;
    requestAnimationFrame(() => ScrollTrigger.refresh());
}

function getOrbitRadius() {
    if (!scene.value) return 0;
    return Math.min(
        scene.value.clientWidth * 0.31,
        scene.value.clientHeight * 0.34,
    );
}

function renderOrbit() {
    if (!productRig.value) return;

    const radians = (orbitState.angle * Math.PI) / 180;
    const radius = getOrbitRadius();
    gsap.set(productRig.value, {
        x: Math.cos(radians) * radius,
        y: Math.sin(radians) * radius,
    });
}

onMounted(() => {
    // Build the pinned ScrollTrigger immediately. Awaiting this relatively
    // large import lets the visitor reach Product before the pin exists.
    void import("@google/model-viewer").catch((error) => {
        console.error("Unable to initialise the product models", error);
    });

    if (
        !scene.value ||
        !productRig.value ||
        !combinedRig.value ||
        !separatedRig.value ||
        !lidRig.value ||
        !combinedModel.value ||
        !bottleModel.value ||
        !lidModel.value ||
        !featureLayer.value ||
        !transitionLayer.value ||
        !paintCircle.value ||
        !scrollHint.value
    ) {
        return;
    }

    const featureBars = Array.from(
        featureLayer.value.querySelectorAll<HTMLElement>(
            ".product-feature__bar",
        ),
    );
    const featureImages = Array.from(
        featureLayer.value.querySelectorAll<HTMLElement>(
            ".product-feature__image",
        ),
    );
    const featureTitles = Array.from(
        featureLayer.value.querySelectorAll<HTMLElement>(
            ".product-feature__title",
        ),
    );
    const solutionCards = Array.from(
        transitionLayer.value.querySelectorAll<HTMLElement>(
            ".product-solution-preview",
        ),
    );

    ScrollTrigger.getById("product-story")?.kill(true);
    media = gsap.matchMedia();
    media.add(
        {
            isLandscape: "(orientation: landscape)",
            isPortrait: "(orientation: portrait)",
            reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (mediaContext) => {
            const { isPortrait, reduceMotion } = mediaContext.conditions as {
                isPortrait: boolean;
                reduceMotion: boolean;
            };
            const spinDuration = reduceMotion ? 0.12 : 4;
            const edgeSpinDuration = spinDuration / 12;
            const middleSpinDuration = spinDuration - edgeSpinDuration * 2;
            const orbitDuration = reduceMotion ? 0.35 : 3.6;

            Object.assign(modelOrientation, {
                roll: 0,
                pitch: 0,
                yaw: 0,
                parallaxStrength: 1,
            });
            Object.assign(pointerOrientation, { roll: 0, pitch: 0, yaw: 0 });
            orbitState.angle = -90;
            applyModelOrientation();

            gsap.set(productRig.value, {
                autoAlpha: 1,
                x: 0,
                y: 0,
                scale: 1,
                transformOrigin: "50% 50%",
            });
            gsap.set(combinedRig.value, { autoAlpha: 1 });
            gsap.set(separatedRig.value, { autoAlpha: 0 });
            gsap.set(lidRig.value, {
                autoAlpha: 1,
                xPercent: 0,
                yPercent: 0,
                rotation: 0,
                transformOrigin: "50% 50%",
            });
            gsap.set(featureLayer.value, { autoAlpha: 0, scale: 1 });
            gsap.set(featureBars, {
                autoAlpha: 0,
                scaleX: 0,
                transformOrigin: (_index, element) =>
                    (element as HTMLElement).parentElement?.dataset.side ===
                    "right"
                        ? "0% 50%"
                        : "100% 50%",
            });
            gsap.set(featureImages, {
                autoAlpha: 0,
                scale: 0.25,
                rotation: (_index, element) =>
                    (element as HTMLElement).parentElement?.dataset.side ===
                    "right"
                        ? 16
                        : -16,
                transformOrigin: "50% 50%",
            });
            gsap.set(featureTitles, {
                autoAlpha: 0,
                yPercent: 38,
            });
            gsap.set(transitionLayer.value, { autoAlpha: 0 });
            gsap.set(solutionCards, { autoAlpha: 0, scale: 0.55 });
            gsap.set(paintCircle.value, { strokeDashoffset: 1 });
            gsap.set(scrollHint.value, { autoAlpha: 1, y: 0 });

            const timeline = gsap.timeline({
                defaults: { ease: "none" },
                scrollTrigger: {
                    id: "product-story",
                    trigger: scene.value,
                    start: "top top",
                    end: () =>
                        `+=${window.innerHeight * (reduceMotion ? 4 : isPortrait ? 8 : 9)}`,
                    scrub: reduceMotion ? true : 0.7,
                    pin: true,
                    pinSpacing: true,
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                },
            });

            timeline
                .to(scene.value, { duration: 0.45 })
                .addLabel("spin")
                .to(
                    scrollHint.value,
                    { autoAlpha: 0, y: 12, duration: 0.2 },
                    "spin",
                )
                .to(
                    modelOrientation,
                    {
                        pitch: reduceMotion ? 0 : 30,
                        yaw: reduceMotion ? 0 : 15,
                        duration: edgeSpinDuration,
                        onUpdate: applyModelOrientation,
                    },
                    "spin",
                )
                .to(modelOrientation, {
                    pitch: reduceMotion ? 0 : 330,
                    duration: middleSpinDuration,
                    onUpdate: applyModelOrientation,
                })
                .to(modelOrientation, {
                    pitch: reduceMotion ? 0 : 360,
                    yaw: 0,
                    duration: edgeSpinDuration,
                    onUpdate: applyModelOrientation,
                })
                .addLabel("splitModel")
                .set(separatedRig.value, { autoAlpha: 1 }, "splitModel")
                .set(combinedRig.value, { autoAlpha: 0 }, "splitModel")
                .addLabel("lidExit")
                .to(lidRig.value, {
                    yPercent: -170,
                    xPercent: 15,
                    rotation: reduceMotion ? 18 : 378,
                    autoAlpha: 0,
                    duration: reduceMotion ? 0.08 : 0.85,
                    ease: "power2.in",
                })
                .addLabel("features")
                .set(featureLayer.value, { autoAlpha: 1 })
                .to(
                    featureBars,
                    {
                        autoAlpha: 1,
                        scaleX: 1,
                        duration: reduceMotion ? 0.08 : 0.62,
                        stagger: reduceMotion ? 0.01 : 0.1,
                        ease: "power3.out",
                    },
                    "features",
                )
                .to(
                    featureTitles,
                    {
                        autoAlpha: 1,
                        yPercent: 0,
                        duration: reduceMotion ? 0.08 : 0.45,
                        stagger: reduceMotion ? 0.01 : 0.1,
                        ease: "power3.out",
                    },
                    "features+=0.18",
                )
                .to(
                    featureImages,
                    {
                        autoAlpha: 1,
                        scale: 1,
                        rotation: 0,
                        duration: reduceMotion ? 0.08 : 0.52,
                        stagger: reduceMotion ? 0.01 : 0.1,
                        ease: "back.out(1.85)",
                    },
                    "features+=0.42",
                )
                .to(scene.value, { duration: reduceMotion ? 0.2 : 0.9 })
                .addLabel("solutionTransition")
                .to(
                    featureLayer.value,
                    {
                        autoAlpha: 0,
                        scale: 0.96,
                        duration: reduceMotion ? 0.08 : 0.5,
                    },
                    "solutionTransition",
                )
                .to(
                    transitionLayer.value,
                    {
                        autoAlpha: 1,
                        duration: reduceMotion ? 0.08 : 0.45,
                    },
                    "solutionTransition+=0.12",
                )
                .to(
                    modelOrientation,
                    {
                        pitch: reduceMotion ? 80 : 440,
                        yaw: 0,
                        parallaxStrength: 0,
                        duration: reduceMotion ? 0.08 : 0.9,
                        ease: "power3.inOut",
                        onUpdate: applyModelOrientation,
                    },
                    "solutionTransition",
                )
                .to(
                    productRig.value,
                    {
                        y: () => -getOrbitRadius(),
                        scale: isPortrait ? 0.3 : 0.38,
                        duration: reduceMotion ? 0.08 : 0.9,
                        ease: "power3.inOut",
                    },
                    "solutionTransition",
                )
                .addLabel("paint")
                .to(
                    orbitState,
                    {
                        angle: 270,
                        duration: orbitDuration,
                        onUpdate: renderOrbit,
                    },
                    "paint",
                )
                .to(
                    modelOrientation,
                    {
                        roll: reduceMotion ? 0 : 360,
                        duration: orbitDuration,
                        onUpdate: applyModelOrientation,
                    },
                    "paint",
                )
                .to(
                    paintCircle.value,
                    { strokeDashoffset: 0, duration: orbitDuration },
                    "paint",
                );

            const revealOffsets = [0.12, 0.38, 0.7];
            solutionCards.forEach((card, index) => {
                timeline.to(
                    card,
                    {
                        autoAlpha: 1,
                        scale: 1,
                        duration: reduceMotion ? 0.05 : 0.34,
                        ease: "back.out(1.8)",
                    },
                    `paint+=${orbitDuration * revealOffsets[index]!}`,
                );
            });

            timeline
                .to(productRig.value, {
                    autoAlpha: 0,
                    scale: isPortrait ? 0.24 : 0.31,
                    duration: reduceMotion ? 0.08 : 0.4,
                    ease: "power2.out",
                })
                .to(scene.value, { duration: reduceMotion ? 0.15 : 0.7 });

            return () => {
                timeline.scrollTrigger?.kill();
                timeline.kill();
            };
        },
        scene.value,
    );

    ScrollTrigger.refresh();
    requestAnimationFrame(() => ScrollTrigger.refresh());
});

onBeforeUnmount(() => {
    pointerTween?.kill();
    media?.revert();
    media = undefined;
    ScrollTrigger.getById("product-story")?.kill(true);
});
</script>

<template>
    <section
        id="product"
        ref="scene"
        class="product-scene relative h-svh min-h-screen overflow-hidden bg-[#07366f] text-white"
        aria-labelledby="product-title"
        @pointermove="handlePointerMove"
        @pointerleave="resetPointer"
    >
        <h2 id="product-title" class="sr-only">
            Meet the Expelliodor deodorant
        </h2>

        <div
            class="product-scene__background absolute inset-0"
            aria-hidden="true"
        />

        <div
            ref="featureLayer"
            class="product-features pointer-events-none absolute inset-0 z-10"
            aria-label="Product features"
        >
            <article
                v-for="feature in FEATURES"
                :key="feature.id"
                class="product-feature absolute flex items-center"
                :class="[
                    `product-feature--${feature.id}`,
                    `product-feature--${feature.side}`,
                    `product-feature--${feature.tone}`,
                ]"
                :data-side="feature.side"
            >
                <div class="product-feature__bar absolute" />
                <img
                    class="product-feature__image relative z-2 aspect-square shrink-0 object-contain"
                    :src="feature.image"
                    alt=""
                    loading="eager"
                    decoding="async"
                    draggable="false"
                />
                <h3
                    class="product-feature__title relative z-2 m-0 text-balance"
                >
                    {{ feature.title }}
                </h3>
            </article>
        </div>

        <div
            ref="transitionLayer"
            class="product-transition pointer-events-none absolute inset-0 z-12"
            aria-label="Three Expelliodor solutions"
        >
            <svg
                class="product-paint-ring absolute overflow-visible"
                viewBox="0 0 100 100"
                aria-hidden="true"
            >
                <circle
                    class="product-paint-ring__guide"
                    cx="50"
                    cy="50"
                    r="46"
                    pathLength="1"
                />
                <circle
                    ref="paintCircle"
                    class="product-paint-ring__stroke"
                    cx="50"
                    cy="50"
                    r="46"
                    pathLength="1"
                />
            </svg>

            <article
                v-for="solution in SOLUTION_PREVIEWS"
                :key="solution.id"
                class="product-solution-preview invisible absolute z-4 flex flex-col items-center opacity-0"
                :style="{
                    '--solution-angle': `${solution.angle}deg`,
                    '--solution-angle-inverse': `${-solution.angle}deg`,
                    '--solution-color': solution.color,
                }"
            >
                <span class="product-solution-preview__image-wrap">
                    <img
                        class="block size-full object-contain select-none"
                        :src="solution.image"
                        alt=""
                        loading="lazy"
                        decoding="async"
                        draggable="false"
                    />
                </span>
                <h3 class="mt-3 mb-0 text-center font-extrabold">
                    {{ solution.title }}
                </h3>
            </article>
        </div>

        <div
            ref="productRig"
            class="product-rig pointer-events-none absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
            :class="{ 'product-rig--ready': modelsReady }"
        >
            <div ref="combinedRig" class="absolute inset-0">
                <div class="absolute inset-0" :style="withLidLayoutStyle">
                    <component
                        :is="'model-viewer'"
                        ref="combinedModel"
                        class="product-model absolute inset-0 block size-full"
                        src="/product.glb"
                        alt="Expelliodor roll-on deodorant bottle"
                        camera-target="0m 0.13m 0m"
                        camera-orbit="0deg 82deg 7m"
                        field-of-view="26deg"
                        orientation="0deg 0deg 0deg"
                        environment-image="neutral"
                        tone-mapping="commerce"
                        exposure="1.15"
                        interaction-prompt="none"
                        interpolation-decay="1"
                        loading="eager"
                        reveal="auto"
                        disable-tap
                        @load="handleModelLoad('combined')"
                    />
                </div>
            </div>

            <div ref="separatedRig" class="absolute inset-0">
                <div class="absolute inset-0" :style="withoutLidLayoutStyle">
                    <component
                        :is="'model-viewer'"
                        ref="bottleModel"
                        class="product-model absolute inset-0 block size-full"
                        src="/product_bottle.glb"
                        alt="Expelliodor roll-on deodorant bottle without its lid"
                        camera-target="0m 0.13m 0m"
                        camera-orbit="0deg 82deg 7m"
                        field-of-view="26deg"
                        orientation="0deg 0deg 0deg"
                        environment-image="neutral"
                        tone-mapping="commerce"
                        exposure="1.15"
                        interaction-prompt="none"
                        interpolation-decay="1"
                        loading="eager"
                        reveal="auto"
                        disable-tap
                        @load="handleModelLoad('bottle')"
                    />
                </div>

                <div ref="lidRig" class="absolute inset-0">
                    <div class="absolute inset-0" :style="lidLayoutStyle">
                        <component
                            :is="'model-viewer'"
                            ref="lidModel"
                            class="product-model absolute inset-0 block size-full"
                            src="/product_lid.glb"
                            alt="Expelliodor bottle lid"
                            camera-target="0m 0.13m 0m"
                            camera-orbit="0deg 82deg 7m"
                            field-of-view="26deg"
                            orientation="0deg 0deg 0deg"
                            environment-image="neutral"
                            tone-mapping="commerce"
                            exposure="1.15"
                            interaction-prompt="none"
                            interpolation-decay="1"
                            loading="eager"
                            reveal="auto"
                            disable-tap
                            @load="handleModelLoad('lid')"
                        />
                    </div>
                </div>
            </div>

            <div
                class="product-loader absolute top-1/2 left-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center"
                role="status"
                :aria-hidden="modelsReady"
            >
                <span class="product-loader__ring" aria-hidden="true" />
                <span class="sr-only">Loading the 3D product</span>
            </div>
        </div>

        <div
            ref="scrollHint"
            class="product-scroll-hint pointer-events-none absolute bottom-[4.5svh] left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-2"
            aria-hidden="true"
        >
            <span>Scroll to turn</span>
            <span class="product-scroll-hint__line" />
        </div>
    </section>
</template>

<style scoped>
.product-scene {
    isolation: isolate;
}

.product-features {
    visibility: hidden;
    opacity: 0;
}

.product-transition {
    visibility: hidden;
    opacity: 0;
}

.product-scene__background {
    background:
        radial-gradient(
            circle at 50% 48%,
            rgb(64 144 214 / 26%),
            transparent 31%
        ),
        radial-gradient(
            circle at 12% 16%,
            rgb(22 90 173 / 48%),
            transparent 27%
        ),
        linear-gradient(180deg, #07366f 0%, #062f66 100%);
}

.product-rig {
    width: clamp(20rem, 38vw, 36rem);
    height: min(84svh, 58rem);
    transform-origin: 50% 50%;
    will-change: transform, opacity;
}

.product-model {
    opacity: 0;
    transition: opacity 300ms ease;
    --poster-color: transparent;
}

.product-rig--ready .product-model {
    opacity: 1;
}

.product-loader {
    width: 4rem;
    height: 4rem;
    opacity: 1;
    transition: opacity 250ms ease;
}

.product-rig--ready .product-loader {
    opacity: 0;
}

.product-loader__ring {
    width: 2.5rem;
    height: 2.5rem;
    border: 3px solid rgb(255 255 255 / 22%);
    border-top-color: #68d7f2;
    border-radius: 999px;
    animation: product-loader-spin 0.8s linear infinite;
}

.product-feature {
    width: min(48vw, 57rem);
    min-height: clamp(7.5rem, 24vh, 15.5rem);
    will-change: transform, opacity;
}

.product-feature--left {
    left: clamp(0.75rem, 3.5vw, 4.25rem);
    flex-direction: row;
}

.product-feature--right {
    right: clamp(0.75rem, 3.5vw, 4.25rem);
    flex-direction: row-reverse;
}

.product-feature--targeted {
    top: 5%;
}

.product-feature--safe {
    top: 10%;
}

.product-feature--clothes {
    top: 35%;
}

.product-feature--sustainable {
    top: 48%;
}

.product-feature--fragrance {
    top: 65%;
}

.product-feature__bar {
    top: 14%;
    bottom: 14%;
    background: linear-gradient(90deg, #0b4cac 0%, #1056bd 100%);
    box-shadow: 0 14px 0 rgb(2 39 91 / 68%);
}

.product-feature--soft .product-feature__bar {
    background: linear-gradient(90deg, #3178c7 0%, #3a80ce 100%);
}

.product-feature--left .product-feature__bar {
    right: 0;
    left: 13%;
}

.product-feature--right .product-feature__bar {
    right: 13%;
    left: 0;
}

.product-feature__image {
    width: clamp(6.2rem, 14vw, 11.5rem);
    filter: drop-shadow(12px 14px 0 rgb(2 39 91 / 72%));
}

.product-feature__title {
    flex: 1;
    padding-inline: clamp(1rem, 2.4vw, 2.75rem);
    font-size: clamp(1.4rem, 3vw, 3.6rem);
    line-height: 0.98;
    font-weight: 800;
    letter-spacing: -0.03em;
    text-align: center;
    text-shadow: 0 2px 5px rgb(1 28 69 / 45%);
}

.product-paint-ring {
    top: 56%;
    left: 50%;
    width: min(70vw, 72svh);
    aspect-ratio: 1;
    transform: translate(-50%, -50%) rotate(-90deg);
}

.product-paint-ring circle {
    fill: none;
    stroke-linecap: round;
}

.product-paint-ring__guide {
    stroke: rgb(113 199 235 / 15%);
    stroke-width: 3;
}

.product-paint-ring__stroke {
    stroke: url("#product-paint-gradient");
    stroke: #70dded;
    stroke-width: 4;
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
    filter: drop-shadow(0 0 8px rgb(78 214 235 / 62%));
}

.product-solution-preview {
    --solution-radius: min(31vw, 34svh);
    top: 56%;
    left: 50%;
    width: clamp(7.5rem, 13vw, 11.5rem);
    color: var(--solution-color);
    transform: translate(-50%, -50%) rotate(var(--solution-angle))
        translateX(var(--solution-radius)) rotate(var(--solution-angle-inverse));
    transform-origin: 50% 50%;
    will-change: transform, opacity;
}

.product-solution-preview__image-wrap {
    display: grid;
    width: 100%;
    aspect-ratio: 1;
    padding: 13%;
    place-items: center;
    border: 2px solid color-mix(in srgb, var(--solution-color) 75%, white);
    border-radius: 999px;
    background: rgb(4 45 98 / 86%);
    box-shadow:
        0 0 0 10px rgb(20 91 162 / 25%),
        0 18px 34px rgb(1 23 57 / 42%);
}

.product-solution-preview h3 {
    font-size: clamp(0.78rem, 1.4vw, 1.25rem);
    line-height: 1.05;
    text-shadow: 0 2px 5px rgb(2 25 57 / 85%);
}

.product-scroll-hint {
    color: rgb(232 249 255 / 88%);
    font-size: 0.74rem;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
}

.product-scroll-hint__line {
    width: 1px;
    height: 2.5rem;
    background: linear-gradient(180deg, #dffaff, transparent);
    animation: product-scroll-pulse 1.7s ease-in-out infinite;
    transform-origin: 50% 0;
}

@keyframes product-loader-spin {
    to {
        transform: rotate(360deg);
    }
}

@keyframes product-scroll-pulse {
    0%,
    100% {
        opacity: 0.35;
        transform: scaleY(0.65);
    }

    50% {
        opacity: 1;
        transform: scaleY(1);
    }
}

@media (orientation: portrait) {
    .product-rig {
        width: min(86vw, 32rem);
        height: min(69svh, 46rem);
    }

    .product-feature {
        width: min(66vw, 31rem);
        min-height: clamp(4.5rem, 11.5svh, 7rem);
    }

    .product-feature--left {
        left: 1rem;
    }

    .product-feature--right {
        right: 1rem;
    }

    .product-feature--targeted,
    .product-feature--safe {
        top: 8%;
    }

    .product-feature--safe {
        top: 23%;
    }

    .product-feature--clothes {
        top: 38%;
    }

    .product-feature--sustainable {
        top: 53%;
    }

    .product-feature--fragrance {
        top: 68%;
    }

    .product-feature__image {
        width: clamp(4.7rem, 22vw, 7rem);
        filter: drop-shadow(7px 8px 0 rgb(2 39 91 / 72%));
    }

    .product-feature__title {
        padding-inline: 0.7rem;
        font-size: clamp(1rem, 5vw, 1.65rem);
    }

    .product-paint-ring {
        top: 57%;
        width: min(88vw, 68svh);
    }

    .product-solution-preview {
        --solution-radius: min(39vw, 31svh);
        top: 57%;
        width: clamp(6.25rem, 25vw, 8.5rem);
    }
}

@media (max-width: 42rem) and (orientation: landscape) {
    .product-feature {
        min-height: 5rem;
    }

    .product-feature__image {
        width: 5.4rem;
    }

    .product-feature__title {
        font-size: 1.3rem;
    }
}

@media (prefers-reduced-motion: reduce) {
    .product-loader__ring,
    .product-scroll-hint__line {
        animation: none;
    }
}
</style>
