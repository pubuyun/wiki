<script setup lang="ts">
import models from "~/data/inlcusivity/models.json";

const model = models.find((model) => model.id === "plant_cell")!;
const modelRoute = `/inclusivity/viewmodel/${model.id}/description-en`;
const characterUrl =
    "https://static.igem.wiki/teams/6133/wiki/homepage/magicwond.avif";
const decoderUrl =
    "https://cdn.jsdelivr.net/npm/meshoptimizer@0.18.1/meshopt_decoder.js";
const isViewerReady = ref(false);
const isModelLoaded = ref(false);
const modelError = ref("");
const hotspots = [
    {
        name: "Concept Model",
        position: "51.05648227451706m 85.30496243038661m 5.544282900174355m",
        normal: "-0.034570507791160776m -0.0007856933588900176m 0.9994019525081024m",
        placement: "concept",
    },
    {
        name: "Direction Arrow",
        position: "14.248551868942627m 20.5934040376669m 4.346921761151507m",
        normal: "0m 0m 1m",
        placement: "direction",
    },
    {
        name: "QR Code Paste Area",
        position: "83.44720250585377m 19.88384649527957m 3.66309616275893m",
        normal: "0m 0m 1m",
        placement: "qr",
    },
];

async function handleModelLoad(event: Event) {
    isModelLoaded.value = true;
    modelError.value = "";

    // As in View Model, supply normals for meshes exported without them.
    const viewer = event.currentTarget;
    if (!(viewer instanceof HTMLElement)) return;
    try {
        const { $scene, $needsRender } =
            await import("@google/model-viewer/lib/model-viewer-base.js");
        type Mesh = {
            isMesh?: boolean;
            geometry?: {
                getAttribute: (name: string) => unknown;
                computeVertexNormals: () => void;
            };
        };
        const internalViewer = viewer as HTMLElement &
            Record<
                typeof $scene,
                {
                    model: {
                        traverse: (visit: (object: Mesh) => void) => void;
                    } | null;
                }
            > &
            Record<typeof $needsRender, () => void>;
        let normalsAdded = false;
        internalViewer[$scene].model?.traverse((mesh) => {
            if (
                mesh.isMesh &&
                mesh.geometry &&
                !mesh.geometry.getAttribute("normal")
            ) {
                mesh.geometry.computeVertexNormals();
                normalsAdded = true;
            }
        });
        if (normalsAdded) internalViewer[$needsRender]();
    } catch (error) {
        console.warn("Unable to calculate sample model normals", error);
    }
}

onMounted(async () => {
    const modelViewerGlobal = self as typeof self & {
        ModelViewerElement?: { meshoptDecoderLocation?: string };
    };
    modelViewerGlobal.ModelViewerElement ??= {};
    modelViewerGlobal.ModelViewerElement.meshoptDecoderLocation = decoderUrl;

    try {
        const { ModelViewerElement } = await import("@google/model-viewer");
        ModelViewerElement.meshoptDecoderLocation = decoderUrl;
        isViewerReady.value = true;
    } catch (error) {
        modelError.value =
            "The 3D preview could not load. Open View Model to explore the model.";
        console.error("Unable to initialise the sample model viewer", error);
    }
});
</script>

<template>
    <section
        class="sample-model"
        aria-label="Annotated tactile plant cell model"
    >
        <figure class="sample-model__figure">
            <div class="sample-model__stage">
                <ClientOnly>
                    <component
                        :is="'model-viewer'"
                        v-if="isViewerReady"
                        class="sample-model__viewer"
                        :src="model.modelUrl"
                        alt="Tactile plant cell model with a raised cell structure, direction arrow, and QR code paste area. Drag or use arrow keys to rotate."
                        camera-controls
                        camera-orbit="-18deg 64deg auto"
                        field-of-view="28deg"
                        touch-action="pan-y"
                        environment-image="https://modelviewer.dev/shared-assets/environments/spruit_sunrise_1k_HDR.jpg"
                        tone-mapping="neutral"
                        shadow-intensity="1"
                        exposure="0.85"
                        loading="eager"
                        tabindex="0"
                        @load="handleModelLoad"
                        @error="
                            modelError =
                                'The 3D preview could not load. Open View Model to explore the model.'
                        "
                    >
                        <div
                            v-for="(hotspot, index) in hotspots"
                            :key="hotspot.placement"
                            :slot="`hotspot-${index + 1}`"
                            class="Hotspot"
                            :class="`Hotspot--${hotspot.placement}`"
                            :data-position="hotspot.position"
                            :data-normal="hotspot.normal"
                            data-visibility-attribute="visible"
                        >
                            <span class="HotspotLeader">
                                <span class="HotspotLabelAnchor">
                                    <span class="HotspotAnnotation">{{
                                        hotspot.name
                                    }}</span>
                                </span>
                            </span>
                        </div>
                        <div slot="progress-bar" />
                    </component>
                    <template #fallback>
                        <p class="sample-model__status" role="status">
                            Loading plant cell model…
                        </p>
                    </template>
                </ClientOnly>
                <p
                    v-if="!isModelLoaded || modelError"
                    class="sample-model__status"
                    role="status"
                >
                    {{ modelError || "Loading plant cell model…" }}
                </p>
            </div>
            <figcaption class="sample-model__caption">
                Drag to rotate · Scroll or pinch to zoom
            </figcaption>
        </figure>

        <NuxtLink
            :to="modelRoute"
            class="sample-model__invitation"
            aria-label="Explore all our 3D models, starting with Plant Cell Structure"
        >
            <span class="sample-model__speech">
                Wanna see<br />all our models?
                <span class="sample-model__cta"
                    >Explore models <span aria-hidden="true">↗</span></span
                >
            </span>
            <img
                class="sample-model__character"
                :src="characterUrl"
                alt=""
                loading="lazy"
                decoding="async"
            />
        </NuxtLink>
    </section>
</template>

<style scoped>
.sample-model {
    position: relative;
    isolation: isolate;
    width: 100%;
    min-width: 0;
    overflow: hidden;
    color: var(--on-secondary);
    font-family: var(--font-belanosima);
}

.sample-model__figure {
    width: 80%;
    margin: 0;
}

.sample-model__stage {
    position: relative;
    height: clamp(25rem, 48vw, 36rem);
}

.sample-model__viewer {
    display: block;
    width: 100%;
    height: 100%;
    background: transparent;
    --poster-color: transparent;
}

.sample-model__viewer:focus-visible {
    outline: 3px solid var(--outline);
    outline-offset: -4px;
    border-radius: 1rem;
}

.sample-model__status {
    position: absolute;
    inset: auto 0 0;
    margin: 0;
    padding: 0.5rem;
    background: var(--secondary);
    text-align: center;
    font-size: 0.9rem;
}

.sample-model__caption {
    margin: 0;
    padding: 0.5rem 0 1rem;
    text-align: center;
    font-size: 0.9rem;
}

.Hotspot {
    --leader-length: 6rem;
    --leader-angle: 0deg;

    width: 0.6rem;
    height: 0.6rem;
    border: 2px solid var(--on-secondary);
    border-radius: 50%;
    background: var(--secondary);
    pointer-events: none;
}

/* Rotate the line around the dot, then keep its endpoint label upright. */
.HotspotLeader {
    position: absolute;
    top: 50%;
    left: 50%;
    width: var(--leader-length);
    height: 0;
    color: var(--on-secondary);
    transform: rotate(var(--leader-angle));
    transform-origin: 0 0;
}

.HotspotLeader::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 1.5px;
    background: currentColor;
    transform: translateY(-50%);
}

.HotspotLabelAnchor {
    position: absolute;
    top: 0;
    left: 100%;
    width: 0;
    height: 0;
    transform: rotate(calc(-1 * var(--leader-angle)));
    transform-origin: 0 0;
}

.HotspotAnnotation {
    position: absolute;
    top: 0;
    left: 0;
    width: max-content;
    max-width: 10rem;
    padding: 0.25rem 0.5rem;
    border-radius: 0.4rem;
    background: var(--secondary);
    color: var(--on-secondary);
    font-size: clamp(0.9rem, 1.7vw, 1.2rem);
    line-height: 1.2;
    text-align: left;
    transform: translateY(-50%);
}

.Hotspot--concept {
    --leader-length: clamp(11rem, 18vw, 14rem);
    --leader-angle: -12deg;
}

.Hotspot--concept .HotspotAnnotation {
    max-width: 6rem;
}

.Hotspot--direction {
    --leader-length: clamp(3.5rem, 7vw, 6rem);
    --leader-angle: 180deg;
}

.Hotspot--direction .HotspotAnnotation {
    max-width: 6rem;
    transform: translate(-100%, -50%);
}

.Hotspot--qr {
    --leader-length: clamp(5rem, 8vw, 7rem);
    --leader-angle: 45deg;
}

.Hotspot--qr .HotspotAnnotation {
    max-width: 8rem;
}

.sample-model__invitation {
    position: absolute;
    z-index: 2;
    top: 12%;
    right: 0;
    width: 24%;
    height: 80%;
    color: inherit;
    text-decoration: none;
}

.sample-model__speech {
    position: absolute;
    z-index: 1;
    top: 0;
    right: 0.5rem;
    width: max-content;
    max-width: 100%;
    font-size: clamp(1.15rem, 2.5vw, 1.8rem);
    line-height: 1.2;
    transform: rotate(-8deg);
    transition: transform 250ms ease;
}

.sample-model__cta {
    display: block;
    margin-top: 0.65rem;
    font-size: 0.85rem;
    text-decoration: underline;
    text-underline-offset: 0.2em;
}

.sample-model__character {
    position: absolute;
    top: 28%;
    right: -55%;
    display: block;
    width: 165%;
    max-width: none;
    height: auto;
    transform: rotate(-37deg);
    transform-origin: 60% 48%;
    transition: transform 250ms ease;
}

.sample-model__invitation:hover .sample-model__character,
.sample-model__invitation:focus-visible .sample-model__character {
    transform: translateX(-0.75rem) rotate(-32deg);
}

.sample-model__invitation:hover .sample-model__speech,
.sample-model__invitation:focus-visible .sample-model__speech {
    transform: translate(-0.35rem, -0.35rem) rotate(-5deg);
}

.sample-model__invitation:focus-visible {
    outline: 3px solid var(--outline);
    outline-offset: -4px;
    border-radius: 1rem;
}

@media (max-width: 40rem) {
    .sample-model__figure {
        width: 100%;
    }

    .sample-model__stage {
        height: clamp(23rem, 100vw, 30rem);
    }

    .HotspotAnnotation {
        max-width: 6.5rem;
        font-size: 0.8rem;
    }

    .Hotspot--direction {
        --leader-length: 1.25rem;
    }

    .Hotspot--direction .HotspotAnnotation {
        max-width: 3.5rem;
    }

    .Hotspot--concept {
        --leader-length: clamp(2rem, calc(50vw - 7rem), 5.5rem);
    }

    .Hotspot--concept .HotspotAnnotation {
        max-width: 4rem;
    }

    .Hotspot--qr {
        --leader-length: 4rem;
        --leader-angle: 65deg;
    }

    .Hotspot--qr .HotspotAnnotation {
        max-width: 4rem;
    }

    .sample-model__invitation {
        position: relative;
        top: auto;
        display: block;
        width: 100%;
        height: 13rem;
        margin-top: 0.5rem;
    }

    .sample-model__speech {
        top: 1.5rem;
        right: 45%;
        max-width: 50%;
        font-size: 1.5rem;
    }

    .sample-model__character {
        top: 0.5rem;
        right: -3rem;
        width: 14rem;
    }
}

@media (max-width: 24rem) {
    .Hotspot--direction {
        --leader-length: 3rem;
        --leader-angle: 90deg;
    }

    .Hotspot--qr {
        --leader-length: 4rem;
        --leader-angle: 90deg;
    }

    .Hotspot--direction .HotspotAnnotation,
    .Hotspot--qr .HotspotAnnotation {
        transform: translate(-50%, -50%);
    }
}

@media (prefers-reduced-motion: reduce) {
    .sample-model__character,
    .sample-model__speech {
        transition: none;
    }

    .sample-model__invitation:hover .sample-model__character,
    .sample-model__invitation:focus-visible .sample-model__character {
        transform: rotate(-37deg);
    }

    .sample-model__invitation:hover .sample-model__speech,
    .sample-model__invitation:focus-visible .sample-model__speech {
        transform: rotate(-8deg);
    }
}
</style>
