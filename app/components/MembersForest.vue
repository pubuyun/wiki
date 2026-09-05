<script setup lang="ts">
import { gsap } from "gsap";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import forestSvg from "../../public/mpbackground.svg?raw";

interface DepthLayer {
    name: string;
    depth: number;
}

// One normalized depth scale: 0 is the horizon, 1 is closest to the camera.
const layers: DepthLayer[] = [
    { name: "mountains", depth: 0.08 },
    { name: "hills", depth: 0.18 },
    { name: "far-trees", depth: 0.36 },
    { name: "near-trees", depth: 0.52 },
    { name: "great-tree", depth: 0.74 },
    { name: "shrubs", depth: 0.87 },
    { name: "front-shrubs", depth: 1 },
];
const FOCAL_LAYER_NAME = "great-tree";
const FOCAL_DEPTH =
    layers.find((layer) => layer.name === FOCAL_LAYER_NAME)?.depth ?? 0.74;

// Virtual camera controls. Increase MAX_X/MAX_Y for more depth.
const CAMERA_MAX_X = 70;
const CAMERA_MAX_Y = 18;
const CAMERA_DAMPING = 1.8;
const POINTER_DAMPING = 3.4;
const POINTER_RESPONSE_STRENGTH = 4;
const POINTER_PARALLAX_Y = 0.42;
const DEPTH_SCALE_RANGE = 0.026;
const SCENE_TILE_WIDTH = 3840;

// Every organic plane samples this one wind field with a small depth delay.
const WIND_CYCLE_SECONDS = 13.5;
const WIND_SPEED = 5;
const WIND_PROPAGATION_LAG = 0.48;
const WIND_PIVOT_Y = 2160;
const GREAT_TREE_PIVOT_X = 2500;
const GREAT_TREE_SWAY = 0.075;
const FOG_DRIFT = 11;

const forestPalettes = {
    light: {
        // main.css: surface, surface-navigation, on-surface, surface-bright.
        sky: "#e5f0f8",
        farAtmosphere: "#9ed3f3",
        nearForest: "#334e5f",
        fog: "#eff9fe",
    },
    dark: {
        sky: "#083565",
        farAtmosphere: "#63899a",
        nearForest: "#033f4f",
        fog: "#9bb2b8",
    },
} as const;

const scene = ref<HTMLElement>();
const darkMode = useState<boolean>("dark-mode", () => true);
let cleanup: (() => void) | undefined;

function mixHexColors(from: string, to: string, amount: number) {
    const start = Number.parseInt(from.slice(1), 16);
    const end = Number.parseInt(to.slice(1), 16);
    const channel = (shift: number) =>
        Math.round(
            ((start >> shift) & 0xff) * (1 - amount) +
                ((end >> shift) & 0xff) * amount,
        );
    return `#${[16, 8, 0]
        .map((shift) => channel(shift).toString(16).padStart(2, "0"))
        .join("")}`;
}

const variables = computed<Record<string, string>>(() => {
    const palette = forestPalettes[darkMode.value ? "dark" : "light"];
    const colors: Record<string, string> = {
        "--forest-sky": palette.sky,
        "--forest-fog": palette.fog,
    };
    for (const layer of layers) {
        // Distant planes are lighter and less saturated; near planes become darker.
        const atmosphericDepth = layer.depth ** 0.82;
        colors[`--${layer.name}-color`] = mixHexColors(
            palette.farAtmosphere,
            palette.nearForest,
            atmosphericDepth,
        );
    }
    return colors;
});

function createWindShape(
    path: SVGPathElement,
    strength: number,
    phase: number,
    responseLine = 2300,
    falloff = 650,
) {
    const pathData = path.getAttribute("d");
    if (!pathData) return "";

    const rawPath = MorphSVGPlugin.stringToRawPath(pathData);
    const windPath = rawPath.map((segment) => segment.slice());
    for (const segment of windPath) {
        for (let index = 0; index < segment.length; index += 2) {
            const x = segment[index];
            const y = segment[index + 1];
            const influence = gsap.utils.clamp(
                0,
                1,
                (responseLine - y) / falloff,
            );
            segment[index] +=
                (Math.sin((x / SCENE_TILE_WIDTH) * Math.PI * 16 + phase) *
                    0.58 +
                    0.42) *
                strength *
                influence;
            segment[index + 1] +=
                Math.cos((x / SCENE_TILE_WIDTH) * Math.PI * 12 + phase) *
                strength *
                0.2 *
                influence;
        }
    }
    return MorphSVGPlugin.rawPathToString(windPath);
}

function sampleWind(phase: number) {
    return (
        Math.sin(phase) * 0.68 +
        Math.sin(phase * 0.47 + 1.15) * 0.22 +
        Math.sin(phase * 1.83 - 0.35) * 0.1
    );
}

function createContinuousShrubPath(depth: number) {
    const isFront = depth > 0.95;
    const lobeCount = isFront ? 32 : 40;
    const lobeWidth = SCENE_TILE_WIDTH / lobeCount;
    const baseY = isFront ? 2020 : 1810;
    const rollingHeight = isFront ? 95 : 62;
    const lobeHeight = isFront ? 175 : 118;
    const phase = isFront ? 0.7 : 0.15;
    const baseline = (x: number) =>
        baseY +
        Math.sin((x / SCENE_TILE_WIDTH) * Math.PI * 6 + phase) * rollingHeight +
        Math.sin((x / SCENE_TILE_WIDTH) * Math.PI * 14 + phase * 0.6) *
            rollingHeight *
            0.32;

    let path = `M 0 2400 L 0 ${baseline(0).toFixed(2)}`;
    for (let index = 0; index < lobeCount; index += 1) {
        const startX = index * lobeWidth;
        const endX = (index + 1) * lobeWidth;
        const startY = baseline(startX);
        const endY = baseline(endX);
        const height =
            lobeHeight *
            (0.72 +
                Math.sin(index * 1.73 + phase) * 0.18 +
                (index % 3) * 0.055);
        path += ` C ${(startX + lobeWidth * 0.14).toFixed(2)} ${(startY - height).toFixed(2)} ${(endX - lobeWidth * 0.14).toFixed(2)} ${(endY - height).toFixed(2)} ${endX.toFixed(2)} ${endY.toFixed(2)}`;
    }
    return `${path} L ${SCENE_TILE_WIDTH} 2400 Z`;
}

onMounted(() => {
    if (!scene.value) return;
    gsap.registerPlugin(MorphSVGPlugin);

    const createTile = (windPlane: SVGGElement, offset: number) => {
        const tile = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "g",
        );
        tile.classList.add("forest-tile");
        tile.setAttribute("transform", `translate(${offset} 0)`);
        tile.append(windPlane);
        return tile;
    };

    const planes = layers.flatMap((layer) => {
        const cameraPlane = scene.value?.querySelector<SVGGElement>(
            `#forest-${layer.name}`,
        );
        const originalWindPlane =
            cameraPlane?.querySelector<SVGGElement>(".forest-sway");
        if (!cameraPlane || !originalWindPlane) return [];

        if (layer.depth >= 0.85) {
            originalWindPlane
                .querySelector<SVGPathElement>("path")
                ?.setAttribute("d", createContinuousShrubPath(layer.depth));
        }

        const leftWindPlane = originalWindPlane.cloneNode(true) as SVGGElement;
        const rightWindPlane = originalWindPlane.cloneNode(true) as SVGGElement;
        for (const clone of [leftWindPlane, rightWindPlane]) {
            clone
                .querySelectorAll("[id]")
                .forEach((element) => element.removeAttribute("id"));
        }
        cameraPlane.replaceChildren(
            createTile(leftWindPlane, -SCENE_TILE_WIDTH),
            createTile(originalWindPlane, 0),
            createTile(rightWindPlane, SCENE_TILE_WIDTH),
        );
        const windPlanes = [leftWindPlane, originalWindPlane, rightWindPlane];
        const fogElements = windPlanes.flatMap((windPlane) =>
            Array.from(
                windPlane.querySelectorAll<SVGGraphicsElement>(".forest-fog"),
                (element) => ({
                    element,
                    baseOpacity: Number(
                        element.getAttribute("opacity") ?? 0.08,
                    ),
                }),
            ),
        );

        cameraPlane.dataset.depth = String(layer.depth);
        const scale = 1 + layer.depth * DEPTH_SCALE_RANGE;
        const render = (x: number, y: number) => {
            cameraPlane.setAttribute(
                "transform",
                `translate(${x.toFixed(3)} ${y.toFixed(3)}) translate(1920 1080) scale(${scale.toFixed(5)}) translate(-1920 -1080)`,
            );
        };
        render(0, 0);
        return [
            {
                ...layer,
                relativeDepth: layer.depth - FOCAL_DEPTH,
                cameraPlane,
                windPlanes,
                fogElements,
                render,
            },
        ];
    });

    const media = gsap.matchMedia();
    media.add(
        "(prefers-reduced-motion: no-preference)",
        () => {
            const windMorphs: {
                tween: gsap.core.Tween;
                depth: number;
            }[] = [];

            const addWindMorph = (
                path: SVGPathElement,
                depth: number,
                strength: number,
                phase: number,
                responseLine?: number,
                falloff?: number,
            ) => {
                const leewardShape = createWindShape(
                    path,
                    -strength * 0.34,
                    phase,
                    responseLine,
                    falloff,
                );
                const windwardShape = createWindShape(
                    path,
                    strength,
                    phase,
                    responseLine,
                    falloff,
                );
                if (!leewardShape || !windwardShape) return;

                const tween = gsap.fromTo(
                    path,
                    { morphSVG: leewardShape },
                    {
                        morphSVG: windwardShape,
                        duration: 1,
                        ease: "none",
                        paused: true,
                        immediateRender: true,
                    },
                );
                tween.progress(0.5);
                windMorphs.push({ tween, depth });
            };

            for (const plane of planes) {
                const canopyStrength =
                    plane.name === FOCAL_LAYER_NAME
                        ? 7
                        : gsap.utils.interpolate(8, 18, plane.depth);
                for (const windPlane of plane.windPlanes) {
                    for (const canopyPath of windPlane.querySelectorAll<SVGPathElement>(
                        ".forest-canopy",
                    )) {
                        addWindMorph(
                            canopyPath,
                            plane.depth,
                            canopyStrength,
                            plane.depth * 1.7,
                            1250,
                            1100,
                        );
                    }
                }

                if (plane.depth >= 0.85) {
                    const shrubPaths = plane.windPlanes.flatMap((windPlane) => {
                        const path =
                            windPlane.querySelector<SVGPathElement>("path");
                        return path ? [path] : [];
                    });
                    for (const shrubPath of shrubPaths) {
                        const morphStrength = gsap.utils.interpolate(
                            22,
                            42,
                            plane.depth,
                        );
                        const shapePhase = plane.depth * 1.7;
                        addWindMorph(
                            shrubPath,
                            plane.depth,
                            morphStrength,
                            shapePhase,
                        );
                    }
                }
            }

            const camera = { x: 0, y: 0 };
            const pointer = { x: 0, y: 0 };
            const pointerTarget = { x: 0, y: 0 };
            let windElapsed = 0;
            let scrollPosition = window.scrollY;
            let frame = 0;
            let lastTime = performance.now();

            const renderCamera = (time: number) => {
                const delta = Math.min(
                    0.05,
                    Math.max(0.001, (time - lastTime) / 1000),
                );
                lastTime = time;
                const pointerFollow = 1 - Math.exp(-POINTER_DAMPING * delta);
                pointer.x += (pointerTarget.x - pointer.x) * pointerFollow;
                pointer.y += (pointerTarget.y - pointer.y) * pointerFollow;
                windElapsed += delta * WIND_SPEED;
                const scrollProgress = gsap.utils.clamp(
                    0,
                    1,
                    scrollPosition / window.innerHeight,
                );
                const targetX = pointer.x * POINTER_RESPONSE_STRENGTH;
                const targetY = gsap.utils.clamp(
                    -1,
                    1,
                    pointer.y * POINTER_PARALLAX_Y * POINTER_RESPONSE_STRENGTH -
                        scrollProgress * 0.28,
                );
                const follow = 1 - Math.exp(-CAMERA_DAMPING * delta);
                camera.x += (targetX - camera.x) * follow;
                camera.y += (targetY - camera.y) * follow;

                for (const plane of planes) {
                    const windPhase =
                        (windElapsed / WIND_CYCLE_SECONDS) * Math.PI * 2 -
                        plane.depth * WIND_PROPAGATION_LAG;
                    const wind = sampleWind(windPhase);

                    if (plane.name === FOCAL_LAYER_NAME) {
                        const rotation = wind * GREAT_TREE_SWAY;
                        for (const windPlane of plane.windPlanes) {
                            windPlane.setAttribute(
                                "transform",
                                `rotate(${rotation.toFixed(4)} ${GREAT_TREE_PIVOT_X} ${WIND_PIVOT_Y})`,
                            );
                        }
                    } else if (plane.depth >= 0.3) {
                        const flexibility = gsap.utils.clamp(
                            0,
                            1,
                            (plane.depth - 0.3) / 0.7,
                        );
                        const travel =
                            wind *
                            gsap.utils.interpolate(0.7, 4.2, flexibility);
                        const lift =
                            wind *
                            gsap.utils.interpolate(0.15, 1.1, flexibility);
                        const rotation =
                            wind *
                            (plane.depth >= 0.85
                                ? gsap.utils.interpolate(
                                      0.025,
                                      0.05,
                                      flexibility,
                                  )
                                : gsap.utils.interpolate(
                                      0.12,
                                      0.42,
                                      flexibility,
                                  ));
                        for (const windPlane of plane.windPlanes) {
                            windPlane.setAttribute(
                                "transform",
                                `translate(${travel.toFixed(3)} ${lift.toFixed(3)}) rotate(${rotation.toFixed(4)} 1920 ${WIND_PIVOT_Y})`,
                            );
                        }
                    }

                    for (const fog of plane.fogElements) {
                        const fogWind = sampleWind(windPhase - 0.22);
                        fog.element.setAttribute(
                            "transform",
                            `translate(${(
                                fogWind *
                                FOG_DRIFT *
                                (1 - plane.depth)
                            ).toFixed(3)} 0)`,
                        );
                        fog.element.setAttribute(
                            "opacity",
                            (fog.baseOpacity * (1 + fogWind * 0.08)).toFixed(3),
                        );
                    }

                    // Signed depth pivots every moving plane around the fixed great tree.
                    const offsetX =
                        camera.x * CAMERA_MAX_X * plane.relativeDepth;
                    const renderedX = gsap.utils.wrap(
                        -SCENE_TILE_WIDTH / 2,
                        SCENE_TILE_WIDTH / 2,
                        offsetX,
                    );
                    plane.render(
                        renderedX,
                        camera.y * CAMERA_MAX_Y * plane.relativeDepth,
                    );
                }

                for (const morph of windMorphs) {
                    const phase =
                        (windElapsed / WIND_CYCLE_SECONDS) * Math.PI * 2 -
                        morph.depth * WIND_PROPAGATION_LAG;
                    morph.tween.progress(
                        gsap.utils.clamp(
                            0.08,
                            0.92,
                            0.5 + sampleWind(phase) * 0.42,
                        ),
                    );
                }
                frame = requestAnimationFrame(renderCamera);
            };

            const readScroll = () => {
                scrollPosition = window.scrollY;
            };
            const readPointer = (event: PointerEvent) => {
                pointerTarget.x = gsap.utils.clamp(
                    -1,
                    1,
                    (event.clientX / window.innerWidth - 0.5) * 2,
                );
                pointerTarget.y = gsap.utils.clamp(
                    -1,
                    1,
                    (event.clientY / window.innerHeight - 0.5) * 2,
                );
            };
            const clearPointer = () => {
                pointerTarget.x = 0;
                pointerTarget.y = 0;
            };
            const updateVisibility = () => {
                if (!document.hidden) lastTime = performance.now();
            };

            window.addEventListener("scroll", readScroll, { passive: true });
            window.addEventListener("pointermove", readPointer, {
                passive: true,
            });
            document.documentElement.addEventListener(
                "pointerleave",
                clearPointer,
            );
            window.addEventListener("blur", clearPointer);
            document.addEventListener("visibilitychange", updateVisibility);
            frame = requestAnimationFrame(renderCamera);

            return () => {
                cancelAnimationFrame(frame);
                window.removeEventListener("scroll", readScroll);
                window.removeEventListener("pointermove", readPointer);
                document.documentElement.removeEventListener(
                    "pointerleave",
                    clearPointer,
                );
                window.removeEventListener("blur", clearPointer);
                document.removeEventListener(
                    "visibilitychange",
                    updateVisibility,
                );
            };
        },
        scene.value,
    );
    cleanup = () => media.revert();
});

onBeforeUnmount(() => cleanup?.());
</script>

<template>
    <div
        ref="scene"
        class="members-forest"
        :style="variables"
        aria-hidden="true"
        v-html="forestSvg"
    />
</template>

<style scoped>
.members-forest {
    --forest-nav-clearance: 3.5rem;
    position: fixed;
    inset: 0;
    z-index: -1;
    overflow: hidden;
    pointer-events: none;
    background: var(--forest-sky);
}

.members-forest :deep(svg) {
    position: absolute;
    top: var(--forest-nav-clearance);
    right: -9%;
    bottom: 0;
    left: -9%;
    width: 118%;
    height: calc(116% - var(--forest-nav-clearance));
    display: block;
}

.members-forest :deep(rect),
.members-forest :deep(path),
.members-forest :deep(ellipse) {
    transition: fill 700ms ease;
}

@media (prefers-reduced-motion: reduce) {
    .members-forest :deep(.forest-depth),
    .members-forest :deep(.forest-sway) {
        transform: none !important;
    }
}
</style>
