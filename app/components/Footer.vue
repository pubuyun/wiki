<script setup lang="ts">
import { Icon } from "@iconify/vue";
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
        fill: "fill-primary",
        d: "M 0 -60 L 0 -360 C 201 -360 210 -144 473 -209 C 1089 -180 1148 -274 1330 -290 C 1460 -277 1592 -233 1700 -285 L 1700 -60 Z",
    },
    {
        id: "footer",
        fill: "fill-on-secondary",
        d: "M 0 0 L 0 -300 C 140 -167 378 -166 593 -258 C 768 -314 799 -400 1171 -246 C 1432 -144 1399 -400 1700 -400 L 1700 0 Z",
    },
];

const sponsorTrackCopies = [false, true];

const footerLinkClass =
    "font-semibold underline decoration-1 underline-offset-2 hover:text-primary focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
</script>

<template>
    <footer
        class="relative isolate mt-auto overflow-hidden bg-on-secondary text-secondary"
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
                viewBox="0 -400 1700 400"
                preserveAspectRatio="none"
            >
                <path
                    v-for="path in wavePaths"
                    :key="path.id"
                    :class="path.fill"
                    :d="path.d"
                />
            </svg>
        </div>

        <div class="-mt-px bg-on-secondary px-4 pb-5 sm:px-6 lg:px-8">
            <div
                class="mx-8 border-t border-secondary sm:mx-6 lg:mx-4"
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
                                    class="mt-0.5 size-6 shrink-0 text-primary"
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
                                    class="mt-0.5 size-6 shrink-0 text-primary"
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
                                class="footer-team-name min-w-0 border-b-4 border-secondary pb-1 font-righteous text-3xl leading-none font-bold whitespace-nowrap sm:text-5xl xl:text-5xl 2xl:text-6xl"
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
                                class="flex size-11 items-center justify-center rounded-md text-white transition-transform hover:-translate-y-1 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-primary motion-reduce:transition-none motion-reduce:hover:translate-y-0 xl:size-12 2xl:size-14"
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
                class="mx-auto max-w-7xl border-t border-secondary/70 pt-4 text-sm leading-relaxed"
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
    text-shadow: 0.07em 0.07em 0 var(--primary);
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
