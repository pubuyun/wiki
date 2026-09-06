<script setup lang="ts">
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";

import descriptionSvg from "./MoreAboutUs/description.svg?raw";
import engineeringSvg from "./MoreAboutUs/engineering.svg?raw";
import ihpSvg from "./MoreAboutUs/ihp.svg?raw";
import membersSvg from "./MoreAboutUs/members.svg?raw";
import modelSvg from "./MoreAboutUs/model.svg?raw";
import {
    HOME_CHAPTERS,
    homeChapterActivationLabel,
} from "~/utils/home-chapters";
import { siteNavGroups } from "~/utils/site-navigation";

gsap.registerPlugin(ScrollTrigger);

const props = withDefaults(defineProps<{ embedded?: boolean }>(), {
    embedded: false,
});
const emit = defineEmits<{
    timelineReady: [
        payload: {
            timeline: gsap.core.Timeline;
            scene: HTMLElement;
        },
    ];
}>();

const scene = ref<HTMLElement>();
const hoverTimelines = new WeakMap<HTMLElement, gsap.core.Timeline>();
let media: gsap.MatchMedia | undefined;

function navigationLink(to: string) {
    const link = siteNavGroups
        .flatMap((group) => group.links)
        .find((candidate) => candidate.to === to);

    if (!link) throw new Error(`Missing homepage navigation link: ${to}`);
    return link;
}

const featureLinks = [
    {
        key: "description",
        ...navigationLink("/description"),
        label: "Project Description",
        svg: descriptionSvg,
    },
    {
        key: "engineering",
        ...navigationLink("/engineering"),
        svg: engineeringSvg,
    },
    { key: "model", ...navigationLink("/model"), svg: modelSvg },
    {
        key: "ihp",
        ...navigationLink("/human-practices"),
        svg: ihpSvg,
    },
    { key: "members", ...navigationLink("/members"), svg: membersSvg },
] as const;

function iconGeometry(element: HTMLElement) {
    return Array.from(
        element.querySelectorAll<SVGGeometryElement>("[data-draw]"),
    );
}

function geometryLength(element: SVGGeometryElement) {
    return Math.max(element.getTotalLength(), 1);
}

function handleIconEnter(event: Event) {
    const link = event.currentTarget;
    if (!(link instanceof HTMLElement)) return;

    hoverTimelines.get(link)?.kill();

    const geometry = iconGeometry(link);
    const fills = link.querySelectorAll<SVGElement>("[data-fill]");
    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
    ).matches;

    const timeline = gsap.timeline({
        defaults: { overwrite: "auto" },
    });

    timeline.to(
        link,
        {
            scale: reduceMotion ? 1 : 1.055,
            duration: reduceMotion ? 0 : 0.28,
            ease: "power2.out",
        },
        0,
    );

    if (!reduceMotion) {
        timeline.fromTo(
            geometry,
            {
                strokeDasharray: (index, target) =>
                    geometryLength(target as SVGGeometryElement) + 1,
                strokeDashoffset: (index, target) =>
                    geometryLength(target as SVGGeometryElement) + 1,
            },
            {
                strokeDashoffset: 0,
                duration: 0.68,
                ease: "power2.inOut",
                stagger: 0.018,
            },
            0,
        );
        timeline.fromTo(
            fills,
            { fillOpacity: 0.35 },
            { fillOpacity: 1, duration: 0.45, stagger: 0.035 },
            0.16,
        );
    }

    hoverTimelines.set(link, timeline);
}

function handleIconLeave(event: Event) {
    const link = event.currentTarget;
    if (!(link instanceof HTMLElement)) return;

    hoverTimelines.get(link)?.kill();
    gsap.to(link, {
        scale: 1,
        duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? 0
            : 0.25,
        ease: "power2.out",
        overwrite: "auto",
    });
    gsap.to(iconGeometry(link), {
        strokeDashoffset: 0,
        duration: 0.18,
        overwrite: "auto",
    });
}

function refreshScrollTrigger() {
    ScrollTrigger.refresh();
}

onMounted(async () => {
    await nextTick();
    const root = scene.value;
    if (!root) return;

    const geometry = iconGeometry(root);
    const fills = root.querySelectorAll<SVGElement>("[data-fill]");
    const photo = root.querySelector<HTMLElement>("[data-photo]");
    const title = root.querySelector<HTMLElement>("[data-title]");
    const links = root.querySelectorAll<HTMLElement>("[data-feature-link]");
    const decorations = root.querySelectorAll<HTMLElement>("[data-decoration]");

    media = gsap.matchMedia();
    media.add(
        {
            reduceMotion: "(prefers-reduced-motion: reduce)",
            allowMotion: "(prefers-reduced-motion: no-preference)",
        },
        (context) => {
            const reduceMotion = Boolean(context.conditions?.reduceMotion);

            if (!reduceMotion) {
                geometry.forEach((element) => {
                    const length = geometryLength(element) + 1;
                    gsap.set(element, {
                        strokeDasharray: length,
                        strokeDashoffset: length,
                    });
                });
            }

            const timeline = gsap.timeline({
                paused: props.embedded,
                defaults: { ease: "power3.out" },
                scrollTrigger: props.embedded
                    ? undefined
                    : {
                          id: "more-about-us-intro",
                          trigger: root,
                          start: "top 72%",
                          once: true,
                      },
            });

            timeline
                .addLabel(
                    homeChapterActivationLabel(HOME_CHAPTERS.moreAboutUs),
                    0,
                )
                .addLabel(HOME_CHAPTERS.moreAboutUs, 0)
                .from(
                    decorations,
                    {
                        autoAlpha: 0,
                        scale: reduceMotion ? 1 : 0.35,
                        duration: reduceMotion ? 0.01 : 0.8,
                        stagger: reduceMotion ? 0 : 0.06,
                    },
                    0,
                )
                .from(
                    photo,
                    {
                        autoAlpha: 0,
                        x: reduceMotion ? 0 : -72,
                        rotation: reduceMotion ? 0 : -1.5,
                        duration: reduceMotion ? 0.01 : 0.95,
                    },
                    0.05,
                )
                .from(
                    title,
                    {
                        autoAlpha: 0,
                        y: reduceMotion ? 0 : 42,
                        duration: reduceMotion ? 0.01 : 0.72,
                    },
                    0.13,
                )
                .from(
                    links,
                    {
                        autoAlpha: 0,
                        y: reduceMotion ? 0 : 46,
                        scale: reduceMotion ? 1 : 0.88,
                        duration: reduceMotion ? 0.01 : 0.68,
                        stagger: reduceMotion ? 0 : 0.09,
                    },
                    0.22,
                )
                .to(
                    geometry,
                    {
                        strokeDashoffset: 0,
                        duration: reduceMotion ? 0.01 : 1.08,
                        ease: "power2.inOut",
                        stagger: reduceMotion ? 0 : 0.018,
                    },
                    0.28,
                )
                .fromTo(
                    fills,
                    { fillOpacity: 0 },
                    {
                        fillOpacity: 1,
                        duration: reduceMotion ? 0.01 : 0.52,
                        stagger: reduceMotion ? 0 : 0.025,
                    },
                    0.58,
                );

            if (props.embedded) {
                emit("timelineReady", { timeline, scene: root });
            }
        },
        root,
    );
});

onBeforeUnmount(() => {
    media?.revert();
    ScrollTrigger.getById("more-about-us-intro")?.kill();
});
</script>

<template>
    <section
        id="more-about-us"
        ref="scene"
        class="more-about-us"
        :data-home-chapter="HOME_CHAPTERS.moreAboutUs"
        aria-labelledby="more-about-us-title"
    >
        <div
            class="more-about-us__bubbles more-about-us__bubbles--right"
            aria-hidden="true"
        >
            <i data-decoration />
            <i data-decoration />
            <i data-decoration />
            <i data-decoration />
        </div>

        <div class="more-about-us__layout">
            <figure data-photo class="more-about-us__photo-frame">
                <img
                    src="https://static.igem.wiki/teams/6133/wiki/homepage/moreaboutus.avif"
                    alt="Expelliodor mascot holding three fluffy companions"
                    class="more-about-us__photo"
                    loading="lazy"
                    decoding="async"
                    @load="refreshScrollTrigger"
                />
            </figure>

            <div class="more-about-us__content">
                <h2 id="more-about-us-title" data-title>More About Us</h2>

                <nav
                    class="more-about-us__links"
                    aria-label="More about our team and project"
                >
                    <NuxtLink
                        v-for="feature in featureLinks"
                        :key="feature.key"
                        :to="feature.to"
                        :class="`more-about-us__link more-about-us__link--${feature.key}`"
                        data-feature-link
                        :aria-label="`Visit ${feature.label}`"
                        @mouseenter="handleIconEnter"
                        @mouseleave="handleIconLeave"
                        @focus="handleIconEnter"
                        @blur="handleIconLeave"
                    >
                        <!-- The SVGs are local, trusted assets kept raw so GSAP can draw each path. -->
                        <span
                            class="more-about-us__icon"
                            aria-hidden="true"
                            v-html="feature.svg"
                        />
                        <span class="more-about-us__label">{{
                            feature.label
                        }}</span>
                    </NuxtLink>
                </nav>
            </div>
        </div>
    </section>
</template>

<style scoped>
.more-about-us {
    position: relative;
    min-height: 100svh;
    overflow: hidden;
    background: #07366f;
    color: #fff;
    isolation: isolate;
}

.more-about-us__layout {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: minmax(19rem, 36.5%) minmax(0, 63.5%);
    gap: clamp(2.4rem, 4vw, 4rem);
    align-items: center;
    width: min(100%, 90rem);
    min-height: 100svh;
    margin-inline: auto;
    padding: 4.5svh clamp(2rem, 3.5vw, 3.25rem);
    box-sizing: border-box;
}

.more-about-us__photo-frame {
    position: relative;
    width: 100%;
    aspect-ratio: 1222 / 1599;
    margin: 0;
    border-radius: clamp(2rem, 4vw, 3.5rem);
    background: #fff9d9;
    box-shadow: clamp(1rem, 1.8vw, 1.7rem) clamp(1rem, 2.4vw, 2rem) 0 #3d82da;
}

.more-about-us__photo {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: inherit;
    object-fit: cover;
}

.more-about-us__content {
    align-self: stretch;
    display: flex;
    min-width: 0;
    flex-direction: column;
    justify-content: flex-start;
    padding-top: 6.4svh;
}

.more-about-us h2 {
    margin: 0 0 clamp(3.4rem, 7.4svh, 5.2rem);
    font-family: var(--font-righteous), sans-serif;
    font-size: clamp(3rem, 5.35vw, 4.85rem);
    font-weight: 400;
    line-height: 1;
    letter-spacing: 0.01em;
    text-align: center;
    white-space: nowrap;
}

.more-about-us__links {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    row-gap: clamp(1.8rem, 4.2svh, 3.2rem);
    align-items: start;
}

.more-about-us__link {
    display: flex;
    min-width: 0;
    flex-direction: column;
    align-items: center;
    color: #fff;
    text-align: center;
    text-decoration: none;
    transform-origin: 50% 45%;
    will-change: transform;
}

.more-about-us__link:nth-child(1) {
    grid-column: 1 / span 2;
}

.more-about-us__link:nth-child(2) {
    grid-column: 3 / span 2;
}

.more-about-us__link:nth-child(3) {
    grid-column: 5 / span 2;
}

.more-about-us__link:nth-child(4) {
    grid-column: 2 / span 2;
}

.more-about-us__link:nth-child(5) {
    grid-column: 4 / span 2;
}

.more-about-us__link:focus-visible {
    border-radius: 1rem;
    outline: 0.2rem solid #62dfc8;
    outline-offset: 0.35rem;
}

.more-about-us__icon {
    display: grid;
    width: clamp(5.5rem, 8.8vw, 7.7rem);
    height: clamp(5.5rem, 8.8vw, 7.7rem);
    place-items: center;
}

.more-about-us__icon :deep(svg) {
    display: block;
    width: 100%;
    height: 100%;
    overflow: visible;
}

.more-about-us__label {
    max-width: 10rem;
    margin-top: clamp(0.7rem, 1.6svh, 1rem);
    font-family:
        var(--font-momo-trust-display), var(--font-righteous), sans-serif;
    font-size: clamp(1.2rem, 2vw, 1.85rem);
    line-height: 1.08;
    text-wrap: balance;
}

.more-about-us__bubbles {
    position: absolute;
    z-index: 0;
    pointer-events: none;
}

.more-about-us__bubbles i {
    position: absolute;
    display: block;
    border-radius: 50%;
    transform-origin: center;
}

.more-about-us__bubbles--right {
    top: -4rem;
    right: -5rem;
    width: 18rem;
    height: 32rem;
}

.more-about-us__bubbles--right i {
    background: #ffb142;
}

.more-about-us__bubbles--right i:nth-child(1) {
    top: 0;
    right: 0;
    width: 10rem;
    height: 10rem;
}

.more-about-us__bubbles--right i:nth-child(2) {
    top: 7rem;
    right: 4rem;
    width: 10rem;
    height: 10rem;
}

.more-about-us__bubbles--right i:nth-child(3) {
    top: 14rem;
    right: -1rem;
    width: 11rem;
    height: 11rem;
}

.more-about-us__bubbles--right i:nth-child(4) {
    top: 23rem;
    right: 1rem;
    width: 8rem;
    height: 8rem;
}

@media (max-width: 62rem) {
    .more-about-us__layout {
        grid-template-columns: minmax(17rem, 0.8fr) minmax(0, 1.2fr);
        gap: 2.5rem;
        padding-inline: 2rem;
    }

    .more-about-us h2 {
        white-space: normal;
    }
}

@media (max-width: 47.99rem) {
    .more-about-us {
        min-height: auto;
    }

    .more-about-us__layout {
        grid-template-columns: 1fr;
        gap: 3.5rem;
        min-height: auto;
        padding: 5.5rem 1.5rem 7rem;
    }

    .more-about-us__photo-frame {
        width: min(100%, 25rem);
        justify-self: center;
        border-radius: 2.25rem;
        box-shadow: 1rem 1.25rem 0 #3d82da;
    }

    .more-about-us__content {
        padding-top: 0;
    }

    .more-about-us h2 {
        margin-bottom: 3rem;
        font-size: clamp(2.75rem, 13vw, 4.5rem);
        white-space: nowrap;
    }

    .more-about-us__links {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 2.75rem 1.25rem;
    }

    .more-about-us__link:nth-child(n) {
        grid-column: auto;
    }

    .more-about-us__link:last-child {
        grid-column: 1 / -1;
        width: 50%;
        justify-self: center;
    }

    .more-about-us__icon {
        width: clamp(5.75rem, 27vw, 7.25rem);
        height: clamp(5.75rem, 27vw, 7.25rem);
    }

    .more-about-us__label {
        font-size: clamp(1.25rem, 6vw, 1.65rem);
    }

    .more-about-us__bubbles--right {
        right: -10rem;
    }
}

@media (prefers-reduced-motion: reduce) {
    .more-about-us__link {
        will-change: auto;
    }
}
</style>
