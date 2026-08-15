<script setup lang="ts">
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { onBeforeUnmount, onMounted, ref } from "vue";

gsap.registerPlugin(ScrollTrigger);

const props = withDefaults(defineProps<{ embedded?: boolean }>(), {
    embedded: false,
});

const emit = defineEmits<{
    timelineReady: [
        payload: {
            timeline: gsap.core.Timeline;
            scene: HTMLElement;
            productRig: HTMLElement;
            featureLayer: HTMLElement;
            modelOrientation: typeof modelOrientation;
            applyModelOrientation: () => void;
        },
    ];
}>();

type ProductModelElement = HTMLElement & {
    animationName: string;
    currentTime: number;
    duration: number;
    model: {
        getMaterialByName: (name: string) => ProductMaterial | null;
    } | null;
    pause: () => void;
};

type ProductMaterial = {
    getAlphaMode: () => "OPAQUE" | "MASK" | "BLEND";
    setAlphaMode: (mode: "OPAQUE" | "MASK" | "BLEND") => void;
    pbrMetallicRoughness: {
        baseColorFactor: readonly [number, number, number, number];
        setBaseColorFactor: (rgba: [number, number, number, number]) => void;
    };
};

type PointerOrientation = {
    roll: number;
    pitch: number;
    yaw: number;
};

const FEATURES = [
    {
        id: "targeted",
        title: "Targeted",
        image: "https://static.igem.wiki/teams/6133/wiki/homepage/targeted.avif",
        side: "left",
        tone: "strong",
        imageSize: "85%",
        imageOffsetX: "0%",
        imageOffsetY: "-4%",
    },
    {
        id: "safe",
        title: "Safe",
        image: "https://static.igem.wiki/teams/6133/wiki/homepage/safe.avif",
        side: "right",
        tone: "soft",
        imageSize: "100%",
        imageOffsetX: "0%",
        imageOffsetY: "1%",
    },
    {
        id: "clothes",
        title: "No damage to clothes",
        image: "https://static.igem.wiki/teams/6133/wiki/homepage/clothes.avif",
        side: "left",
        tone: "soft",
        imageSize: "85%",
        imageOffsetX: "7%",
        imageOffsetY: "0%",
    },
    {
        id: "sustainable",
        title: "Sustainable",
        image: "https://static.igem.wiki/teams/6133/wiki/homepage/sustainable.avif",
        side: "right",
        tone: "soft",
        imageSize: "100%",
        imageOffsetX: "0%",
        imageOffsetY: "0%",
    },
    {
        id: "fragrance",
        title: "Customised fragrance",
        image: "https://static.igem.wiki/teams/6133/wiki/homepage/costumised.avif",
        side: "left",
        tone: "strong",
        imageSize: "85%",
        imageOffsetX: "5%",
        imageOffsetY: "0%",
    },
] as const;

const MODEL_LAYOUT = {
    yPercent: 0,
} as const;

const PRODUCT_ANIMATION_NAME = "CylinderAction";
const PRODUCT_ANIMATION_END_EPSILON_SECONDS = 0.0001;
const PRODUCT_LID_MATERIAL_NAME = "Material.004";

const PRODUCT_DISPLAY_ORIENTATION = {
    verticalYaw: 0,
} as const;

const PRODUCT_CAMERA_ORBIT = {
    landscape: "0deg 82deg 8.33m",
    portrait: "0deg 82deg 10.15m",
} as const;

const modelLayoutStyle = {
    transform: `translateY(${MODEL_LAYOUT.yPercent}%)`,
};

const scene = ref<HTMLElement | null>(null);
const productRig = ref<HTMLElement | null>(null);
const featureLayer = ref<HTMLElement | null>(null);
const scrollHint = ref<HTMLElement | null>(null);
const productModel = ref<ProductModelElement | null>(null);
const modelsReady = ref(false);
const modelAnimation = { progress: 0 };
let lidMaterial: ProductMaterial | null = null;
let lidBaseColor: [number, number, number, number] | null = null;
let lidAlphaMode: "OPAQUE" | "MASK" | "BLEND" = "OPAQUE";
let isLidVisible = true;

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
let media: gsap.MatchMedia | undefined;
let pointerTween: gsap.core.Tween | undefined;

function applyModelOrientation() {
    const strength = modelOrientation.parallaxStrength;
    const orientation = `${modelOrientation.roll + pointerOrientation.roll * strength}deg ${modelOrientation.pitch + pointerOrientation.pitch * strength}deg ${modelOrientation.yaw + pointerOrientation.yaw * strength}deg`;

    productModel.value?.setAttribute("orientation", orientation);
}

function applyModelAnimation() {
    const model = productModel.value;
    if (!model || !Number.isFinite(model.duration) || model.duration <= 0)
        return;

    // Seeking to exactly `duration` lands on the animation's loop boundary,
    // which displays its first frame. Stay imperceptibly before that boundary
    // so the fully opened pose remains visible after the timeline completes.
    model.currentTime =
        modelAnimation.progress >= 1
            ? Math.max(
                  0,
                  model.duration - PRODUCT_ANIMATION_END_EPSILON_SECONDS,
              )
            : modelAnimation.progress * model.duration;

    setLidVisible(modelAnimation.progress < 1);
}

function setLidVisible(visible: boolean) {
    if (!lidMaterial || !lidBaseColor || isLidVisible === visible) return;

    isLidVisible = visible;
    if (visible) {
        lidMaterial.pbrMetallicRoughness.setBaseColorFactor(lidBaseColor);
        lidMaterial.setAlphaMode(lidAlphaMode);
        return;
    }

    lidMaterial.setAlphaMode("BLEND");
    lidMaterial.pbrMetallicRoughness.setBaseColorFactor([
        lidBaseColor[0],
        lidBaseColor[1],
        lidBaseColor[2],
        0,
    ]);
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

function handleModelLoad() {
    if (!productModel.value) return;

    productModel.value.animationName = PRODUCT_ANIMATION_NAME;
    productModel.value.pause();
    lidMaterial = productModel.value.model?.getMaterialByName(
        PRODUCT_LID_MATERIAL_NAME,
    );
    if (lidMaterial) {
        const [red, green, blue, alpha] =
            lidMaterial.pbrMetallicRoughness.baseColorFactor;
        lidBaseColor = [red, green, blue, alpha];
        lidAlphaMode = lidMaterial.getAlphaMode();
        isLidVisible = true;
    }
    applyModelAnimation();
    modelsReady.value = true;
    requestAnimationFrame(() => ScrollTrigger.refresh());
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
        !productModel.value ||
        !featureLayer.value ||
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
            productModel.value?.setAttribute(
                "camera-orbit",
                isPortrait
                    ? PRODUCT_CAMERA_ORBIT.portrait
                    : PRODUCT_CAMERA_ORBIT.landscape,
            );
            const spinDuration = reduceMotion ? 0.12 : 4;
            const edgeSpinDuration = spinDuration / 12;
            const middleSpinDuration = spinDuration - edgeSpinDuration * 2;
            Object.assign(modelOrientation, {
                roll: 0,
                pitch: 0,
                yaw: PRODUCT_DISPLAY_ORIENTATION.verticalYaw,
                parallaxStrength: 1,
            });
            Object.assign(pointerOrientation, { roll: 0, pitch: 0, yaw: 0 });
            modelAnimation.progress = 0;
            applyModelOrientation();
            applyModelAnimation();

            gsap.set(productRig.value, {
                autoAlpha: 1,
                x: 0,
                y: 0,
                scale: 1,
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
            gsap.set(scrollHint.value, { autoAlpha: 1, y: 0 });

            const timeline = props.embedded
                ? gsap.timeline({
                      defaults: { ease: "none" },
                      paused: true,
                  })
                : gsap.timeline({
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
                        yaw: reduceMotion
                            ? PRODUCT_DISPLAY_ORIENTATION.verticalYaw
                            : PRODUCT_DISPLAY_ORIENTATION.verticalYaw + 15,
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
                    yaw: PRODUCT_DISPLAY_ORIENTATION.verticalYaw,
                    duration: edgeSpinDuration,
                    onUpdate: applyModelOrientation,
                })
                .addLabel("openLid")
                .to(modelAnimation, {
                    progress: 1,
                    duration: reduceMotion ? 0.08 : 0.85,
                    ease: "power2.in",
                    onUpdate: applyModelAnimation,
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
                .to(scene.value, { duration: reduceMotion ? 0.2 : 0.9 });

            if (props.embedded) {
                emit("timelineReady", {
                    timeline,
                    scene: scene.value,
                    productRig: productRig.value,
                    featureLayer: featureLayer.value,
                    modelOrientation,
                    applyModelOrientation,
                });
            }

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
                class="product-feature absolute flex min-h-[36vh] items-center px-30"
                :class="[
                    `product-feature--${feature.id}`,
                    `product-feature--${feature.side}`,
                    `product-feature--${feature.tone}`,
                    {
                        'pr-45': feature.side === 'right',
                        'pl-45': feature.side === 'left',
                    },
                ]"
                :data-side="feature.side"
            >
                <div class="product-feature__bar absolute rounded-4xl" />
                <div
                    class="product-feature__image absolute z-2 aspect-square h-[30vh] shrink-0"
                    :class="{
                        'right-0': feature.side === 'right',
                        'left-0': feature.side === 'left',
                    }"
                    :style="{
                        '--feature-image-size': feature.imageSize,
                        '--feature-image-offset-x': feature.imageOffsetX,
                        '--feature-image-offset-y': feature.imageOffsetY,
                    }"
                >
                    <span
                        class="product-feature__image-shadow absolute rounded-full"
                        aria-hidden="true"
                    />
                    <span
                        class="product-feature__image-circle absolute rounded-full bg-surface"
                        aria-hidden="true"
                    />
                    <img
                        class="product-feature__image-content absolute z-2 max-w-none object-contain"
                        :src="feature.image"
                        alt=""
                        loading="eager"
                        decoding="async"
                        draggable="false"
                    />
                </div>
                <h3 class="product-feature__title relative z-2 text-balance">
                    {{ feature.title }}
                </h3>
            </article>
        </div>

        <div
            ref="productRig"
            class="product-rig pointer-events-none absolute inset-0 z-20"
            :class="{ 'product-rig--ready': modelsReady }"
        >
            <div class="absolute inset-0" :style="modelLayoutStyle">
                <component
                    :is="'model-viewer'"
                    ref="productModel"
                    class="product-model absolute inset-0 block size-full"
                    src="https://static.igem.wiki/teams/6133/wiki/homepage/product.glb"
                    alt="Expelliodor roll-on deodorant bottle"
                    camera-target="0m 0.13m 0m"
                    :camera-orbit="PRODUCT_CAMERA_ORBIT.landscape"
                    field-of-view="26deg"
                    orientation="0deg 0deg 0deg"
                    environment-image="neutral"
                    tone-mapping="commerce"
                    exposure="1.15"
                    interaction-prompt="none"
                    interpolation-decay="1"
                    :animation-name="PRODUCT_ANIMATION_NAME"
                    loading="eager"
                    reveal="auto"
                    disable-tap
                    @load="handleModelLoad"
                />
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
            class="product-scroll-hint pointer-events-none absolute bottom-[2svh] left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-2"
            aria-hidden="true"
        >
            <span>Scroll to turn</span>
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
    width: 100vw;
    height: 100svh;
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
    width: 48vw;
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
    overflow: visible;
}

.product-feature__image-shadow {
    background: rgb(3 42 95);
    transform: translate(-50%, -50%) translateX(var(--feature-shadow-offset-x));
}

.product-feature--left .product-feature__image-shadow {
    --feature-shadow-offset-x: clamp(0.5rem, 1.2vw, 0.9rem);
}

.product-feature--right .product-feature__image-shadow {
    --feature-shadow-offset-x: clamp(-0.9rem, -1.2vw, -0.5rem);
}

.product-feature__image-shadow,
.product-feature__image-circle {
    top: 50%;
    left: 50%;
    width: var(--feature-image-size);
    height: var(--feature-image-size);
}

.product-feature__image-circle {
    transform: translate(-50%, -50%);
}

.product-feature__image-content {
    top: calc(50% + var(--feature-image-offset-y));
    left: calc(50% + var(--feature-image-offset-x));
    width: var(--feature-image-size);
    height: var(--feature-image-size);
    transform: translate(-50%, -50%);
}

.product-feature__title {
    flex: 1;
    padding-inline: clamp(1rem, 2.4vw, 2.75rem);
    font-size: clamp(1.25rem, 2vw, 3rem);
    line-height: 0.98;
    font-weight: 800;
    letter-spacing: -0.03em;
    text-align: center;
    text-shadow: 0 2px 5px rgb(1 28 69 / 45%);
}

.product-scroll-hint {
    color: rgb(232 249 255 / 88%);
    font-size: 0.74rem;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
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
        height: clamp(4.7rem, 22vw, 7rem);
    }

    .product-feature__title {
        padding-inline: 0.7rem;
        font-size: clamp(0.9rem, 4.5vw, 1.5rem);
    }
}

@media (max-width: 42rem) and (orientation: landscape) {
    .product-feature {
        min-height: 5rem;
    }

    .product-feature__image {
        width: 5.4rem;
        height: 5.4rem;
    }

    .product-feature__title {
        font-size: 1.15rem;
    }
}

@media (prefers-reduced-motion: reduce) {
    .product-loader__ring,
    .product-scroll-hint__line {
        animation: none;
    }
}
</style>
