<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { gsap } from "gsap";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { onMounted, onUnmounted, ref } from "vue";
import {
    footerSocialChannels,
    footerSponsors,
    footerTeamLogo,
} from "~/utils/footer-data";

withDefaults(
    defineProps<{
        hasCategorySidebar?: boolean;
    }>(),
    {
        hasCategorySidebar: false,
    },
);

const categorySidebarCollapsed = useState<boolean>(
    "category-sidebar-collapsed",
    () => false,
);

const sidebarExtensionClass = computed(() =>
    categorySidebarCollapsed.value ? "w-12" : "w-66",
);

const wavePaths = [
    {
        id: "accent",
        fill: "fill-accent",
        d: "M 0 0 L 0 -350 C 200 -350 247 -170 578 -170 C 895 -170 1146 -300 1311 -300 C 1422 -300 1548 -200 1698 -200 C 2035 -200 2110 -350 2300 -350 C 2500 -350 2547 -170 2878 -170 C 3195 -170 3446 -300 3611 -300 C 3722 -300 3848 -200 3998 -200 C 4335 -200 4410 -350 4600 -350 L 4600 0 Z",
    },
    {
        id: "footer",
        fill: "fill-surface-elevated",
        d: "M 0 0 L 0 -300 C 138 -190 378 -166 593 -258 C 768 -333 799 -400 1171 -246 C 1432 -144 1655 -450 1985 -450 C 2089 -450 2162 -410 2300 -300 C 2438 -190 2678 -166 2893 -258 C 3068 -333 3099 -400 3471 -246 C 3732 -144 3945 -450 4282 -450 C 4372 -450 4462 -410 4600 -300 L 4600 0 Z",
    },
];

const WAVE_TILE_WIDTH = 2300;
const WAVE_SCROLL_DURATION = 18;
const WAVE_MORPH_DURATION = 6;
const ACCENT_WAVE_MORPH_PATH =
    "M 0 0 L 0 -200 C 301 -200 464 -280 631 -280 C 860 -280 858 -100 1030 -100 C 1242 -100 1299 -380 1473 -380 C 1701 -380 1801 -200 2300 -200 C 2601 -200 2764 -280 2931 -280 C 3160 -280 3158 -100 3330 -100 C 3542 -100 3599 -380 3773 -380 C 4001 -380 4101 -200 4600 -200 L 4600 0 Z";
const ACCENT_WAVE_SECOND_MORPH_PATH =
    "M 0 0 L 0 -300 C 300 -300 410 -100 570 -80 C 730 -60 780 -340 1090 -339 C 1359 -340 1426 -70 1628 -70 C 1971 -70 2002 -300 2300 -300 C 2600 -300 2710 -100 2870 -80 C 3030 -60 3080 -340 3390 -339 C 3659 -340 3726 -70 3928 -70 C 4271 -70 4302 -300 4600 -300 L 4600 0 Z";
const FOOTER_WAVE_MORPH_PATH =
    "M 0 0 L 0 -300 C 199 -496 358 -360 466 -278 C 683 -113 813 -348 1202 -226 C 1520 -113 1579 -376 1809 -378 C 2072 -378 2101 -104 2300 -300 C 2499 -496 2658 -360 2766 -278 C 2983 -113 3113 -348 3502 -226 C 3820 -113 3879 -376 4109 -378 C 4372 -378 4401 -104 4600 -300 L 4600 0 Z";
const FOOTER_WAVE_SECOND_MORPH_PATH =
    "M 0 0 L 0 -200 C 336 -200 357 -366 549 -394 C 849 -416 1019 -37 1234 -70 C 1520 -113 1528 -287 1726 -339 C 1880 -365 1998 -200 2300 -200 C 2636 -200 2657 -366 2849 -394 C 3149 -416 3319 -37 3534 -70 C 3820 -113 3828 -287 4026 -339 C 4180 -365 4298 -200 4600 -200 L 4600 0 Z";

const waveTrack = ref<SVGGElement | null>(null);
let waveAnimation: gsap.core.Tween | undefined;
let accentWaveAnimation: gsap.core.Timeline | undefined;
let footerWaveAnimation: gsap.core.Timeline | undefined;
let removeMotionPreferenceListener: (() => void) | undefined;

onMounted(() => {
    if (!waveTrack.value) return;

    const accentWave = waveTrack.value.querySelector<SVGPathElement>(
        '[data-wave="accent"]',
    );
    const footerWave = waveTrack.value.querySelector<SVGPathElement>(
        '[data-wave="footer"]',
    );
    if (!accentWave || !footerWave) return;

    gsap.registerPlugin(MorphSVGPlugin);
    const originalAccentPath = accentWave.getAttribute("d") ?? "";
    const originalFooterPath = footerWave.getAttribute("d") ?? "";

    const motionPreference = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
    );

    const updateWaveAnimation = () => {
        waveAnimation?.kill();
        accentWaveAnimation?.kill();
        footerWaveAnimation?.kill();
        gsap.set(waveTrack.value, { x: 0 });
        accentWave.setAttribute("d", originalAccentPath);
        footerWave.setAttribute("d", originalFooterPath);

        if (motionPreference.matches) return;

        waveAnimation = gsap.to(waveTrack.value, {
            x: -WAVE_TILE_WIDTH,
            duration: WAVE_SCROLL_DURATION,
            ease: "none",
            repeat: -1,
        });

        accentWaveAnimation = gsap
            .timeline({ repeat: -1 })
            .to(accentWave, {
                morphSVG: { shape: ACCENT_WAVE_MORPH_PATH },
                duration: WAVE_MORPH_DURATION,
                ease: "none",
            })
            .to(accentWave, {
                morphSVG: { shape: ACCENT_WAVE_SECOND_MORPH_PATH },
                duration: WAVE_MORPH_DURATION,
                ease: "none",
            })
            .to(accentWave, {
                morphSVG: { shape: originalAccentPath },
                duration: WAVE_MORPH_DURATION,
                ease: "none",
            });

        footerWaveAnimation = gsap
            .timeline({ repeat: -1 })
            .to(footerWave, {
                morphSVG: { shape: FOOTER_WAVE_MORPH_PATH },
                duration: WAVE_MORPH_DURATION,
                ease: "none",
            })
            .to(footerWave, {
                morphSVG: { shape: FOOTER_WAVE_SECOND_MORPH_PATH },
                duration: WAVE_MORPH_DURATION,
                ease: "none",
            })
            .to(footerWave, {
                morphSVG: { shape: originalFooterPath },
                duration: WAVE_MORPH_DURATION,
                ease: "none",
            });
    };

    motionPreference.addEventListener("change", updateWaveAnimation);
    removeMotionPreferenceListener = () =>
        motionPreference.removeEventListener("change", updateWaveAnimation);
    updateWaveAnimation();
});

onUnmounted(() => {
    waveAnimation?.kill();
    waveAnimation = undefined;
    accentWaveAnimation?.kill();
    accentWaveAnimation = undefined;
    footerWaveAnimation?.kill();
    footerWaveAnimation = undefined;
    removeMotionPreferenceListener?.();
    removeMotionPreferenceListener = undefined;
});

const sponsorTrackCopies = [false, true];

const footerLinkClass =
    "font-semibold underline decoration-1 underline-offset-2 hover:text-accent focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
</script>

<template>
    <footer
        class="relative isolate mt-auto overflow-hidden bg-surface-elevated text-on-surface"
    >
        <div
            class="relative h-24 bg-surface sm:h-32 lg:h-44"
            aria-hidden="true"
        >
            <div
                v-if="hasCategorySidebar"
                class="absolute inset-y-0 left-0 hidden bg-surface-elevated transition-[width] duration-200 ease-out lg:block"
                :class="sidebarExtensionClass"
            />
            <svg
                class="absolute inset-x-0 top-0 z-10 h-full w-full"
                viewBox="0 -500 1700 500"
                preserveAspectRatio="none"
            >
                <g ref="waveTrack">
                    <path
                        v-for="path in wavePaths"
                        :key="path.id"
                        :class="path.fill"
                        :d="path.d"
                        :data-wave="path.id"
                    />
                </g>
            </svg>
        </div>

        <div class="-mt-px bg-surface-elevated px-4 pb-5 sm:px-6 lg:px-8">
            <div
                class="mx-8 border-t border-on-surface sm:mx-6 lg:mx-4"
                aria-hidden="true"
            />

            <div
                class="mx-auto grid max-w-7xl gap-10 pb-8 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,1fr)] xl:gap-14"
            >
                <div class="order-2 min-w-0 space-y-8 xl:order-1">
                    <section aria-labelledby="footer-sponsors-title">
                        <h2
                            id="footer-sponsors-title"
                            class="mb-4 font-momo-trust-display text-3xl font-bold sm:text-4xl"
                        >
                            Sponsors
                        </h2>
                        <div class="sponsor-marquee">
                            <div class="sponsor-track">
                                <div
                                    v-for="isDuplicate in sponsorTrackCopies"
                                    :key="String(isDuplicate)"
                                    class="sponsor-group"
                                    :aria-hidden="
                                        isDuplicate ? 'true' : undefined
                                    "
                                >
                                    <img
                                        v-for="sponsor in footerSponsors"
                                        :key="`${isDuplicate}-${sponsor.name}`"
                                        :src="sponsor.src"
                                        :alt="`${sponsor.name} logo`"
                                        class="h-20 w-56 shrink-0 rounded-md bg-white object-contain p-3 sm:h-24 sm:w-64"
                                        loading="lazy"
                                        decoding="async"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    <section aria-labelledby="footer-contact-title">
                        <h2
                            id="footer-contact-title"
                            class="mb-4 font-momo-trust-display text-3xl font-bold sm:text-4xl"
                        >
                            Contact us
                        </h2>

                        <address
                            class="space-y-3 text-base not-italic sm:text-lg"
                        >
                            <div class="flex items-start gap-3">
                                <Icon
                                    icon="lucide:mail"
                                    class="mt-0.5 size-6 shrink-0 text-accent"
                                    aria-hidden="true"
                                />
                                <span>
                                    <strong>e-mail:</strong>
                                    <span class="ml-1 break-all">
                                        greatbay.scie2026@outlook.com
                                    </span>
                                </span>
                            </div>

                            <div class="flex items-start gap-3">
                                <Icon
                                    icon="lucide:map-pin"
                                    class="mt-0.5 size-6 shrink-0 text-accent"
                                    aria-hidden="true"
                                />
                                <span>
                                    <strong>address:</strong>
                                    No.3, Antuoshan 6th Road, Xiangmihu Street,
                                    Futian, Shenzhen, Guangdong province, China
                                </span>
                            </div>
                        </address>
                    </section>
                </div>

                <section
                    class="order-1 flex min-w-0 flex-col items-center justify-center xl:order-2 xl:items-end"
                    aria-labelledby="footer-team-title"
                >
                    <div
                        class="flex w-fit max-w-full min-w-0 flex-col items-center xl:items-start"
                    >
                        <div
                            class="flex max-w-full min-w-0 items-end justify-center gap-3 xl:gap-4"
                        >
                            <img
                                :src="footerTeamLogo"
                                alt="GreatBay-SCIE team logo"
                                class="size-16 shrink-0 object-contain sm:size-20 xl:size-20 2xl:size-24"
                            />
                            <h2
                                id="footer-team-title"
                                class="footer-team-name min-w-0 border-b-4 border-on-surface pb-1 font-righteous text-3xl leading-none font-bold whitespace-nowrap sm:text-5xl xl:text-5xl 2xl:text-6xl"
                            >
                                GreatBay-SCIE
                            </h2>
                        </div>

                        <div
                            class="mt-8 flex w-full flex-wrap justify-center gap-3 xl:mt-10 xl:flex-nowrap xl:justify-between xl:gap-0"
                            aria-label="GreatBay-SCIE social media"
                        >
                            <a
                                v-for="channel in footerSocialChannels"
                                :key="channel.name"
                                :href="channel.href"
                                :aria-label="`Visit GreatBay-SCIE on ${channel.name}`"
                                :title="channel.name"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="flex size-11 items-center justify-center rounded-md text-white transition-transform hover:-translate-y-1 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-accent motion-reduce:transition-none motion-reduce:hover:translate-y-0 xl:size-12 2xl:size-14"
                                :class="channel.color"
                            >
                                <Icon
                                    :icon="channel.icon"
                                    class="size-6 xl:size-7 2xl:size-8"
                                    aria-hidden="true"
                                />
                            </a>
                        </div>
                    </div>
                </section>
            </div>

            <!-- Required on every iGEM page. -->
            <div
                class="mx-auto max-w-7xl border-t border-on-surface/70 pt-4 text-sm leading-relaxed"
            >
                <p>
                    © 2026 - Content on this site is licensed under a
                    <a
                        :class="footerLinkClass"
                        href="https://creativecommons.org/licenses/by/4.0/"
                        rel="license"
                    >
                        Creative Commons Attribution 4.0 International license </a
                    >.
                </p>
                <p>
                    The repository used to create this website is available at
                    <a
                        :class="footerLinkClass"
                        href="https://gitlab.igem.org/2026/greatbay-scie"
                    >
                        gitlab.igem.org/2026/greatbay-scie </a
                    >.
                </p>
            </div>
        </div>
    </footer>
</template>

<style scoped>
.footer-team-name {
    text-shadow: 0.07em 0.07em 0 var(--accent);
}

.sponsor-marquee {
    width: 100%;
    overflow: hidden;
}

.sponsor-track,
.sponsor-group {
    display: flex;
    gap: 1rem;
}

.sponsor-track {
    width: max-content;
    animation: sponsor-scroll 18s linear infinite;
    will-change: transform;
}

.sponsor-group {
    min-width: min(40rem, calc(100vw - 2rem));
    flex-shrink: 0;
    align-items: center;
    justify-content: space-around;
}

.sponsor-marquee:hover .sponsor-track {
    animation-play-state: paused;
}

@keyframes sponsor-scroll {
    to {
        transform: translateX(calc(-50% - 0.5rem));
    }
}

@media (prefers-reduced-motion: reduce) {
    .sponsor-marquee {
        overflow-x: auto;
    }

    .sponsor-track {
        animation: none;
        will-change: auto;
    }

    .sponsor-group[aria-hidden="true"] {
        display: none;
    }
}
</style>
