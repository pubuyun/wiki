<template>
    <nav
        class="sticky top-20 mb-6 w-52 shrink-0 flex-col self-start pr-6 font-belanosima text-base text-textbg xl:w-60"
        aria-labelledby="toc-title"
    >
        <h2
            id="toc-title"
            class="mb-4 font-momo-trust-display text-base text-textbg"
        >
            On this page
        </h2>

        <div class="relative max-h-[calc(100vh-13rem)] overflow-y-auto">
            <div
                class="pointer-events-none absolute top-0 left-0 w-3"
                :style="indicatorStyle"
                aria-hidden="true"
            >
                <div class="absolute inset-0 bg-primary-norm" />
                <div
                    class="absolute inset-x-0 top-0 bg-tertiary transition-transform duration-200 ease-out"
                    :style="activeIndicatorStyle"
                />
            </div>

            <ul class="relative">
                <li v-for="link in flatToc" :key="link.id">
                    <a
                        :href="`#${link.id}`"
                        :class="linkClass(link)"
                        :data-content-bar-link-id="link.id"
                        @click="scrollToHash($event, link.id)"
                    >
                        {{ link.text }}
                    </a>
                </li>
            </ul>
        </div>
    </nav>
</template>

<script setup lang="ts">
const scrollSpyActivationOffset = 8;
const hashScrollLockDuration = 2400;
const tocItemHeight = 28;
const indicatorWidth = 12;
const h2IndicatorX = 0.5;
const h3IndicatorX = 10.5;

interface ToCLink {
    id: string;
    depth: number;
    text: string;
    children?: ToCLink[];
}

const props = defineProps<{
    toc: ToCLink[];
}>();

const { scrollToHash } = useHashScroll();
const activeId = ref<string>();
let hashScrollUntil = 0;
let stopScrollSpy: (() => void) | undefined;

const flatToc = computed(() =>
    props.toc.flatMap((link) => [
        link,
        ...(link.children?.map((child) => ({ ...child, depth: 3 })) ?? []),
    ]),
);

const activeIndex = computed(() => {
    const index = flatToc.value.findIndex((link) => link.id === activeId.value);
    return Math.max(index, 0);
});

const indicatorHeight = computed(() =>
    Math.max(flatToc.value.length * tocItemHeight, tocItemHeight),
);

const indicatorPath = computed(() => {
    if (!flatToc.value.length) {
        return `M${h2IndicatorX} 0 L${h2IndicatorX} ${tocItemHeight}`;
    }

    const height = indicatorHeight.value;
    const points = [`M${indicatorX(flatToc.value[0]!)} 0`];

    flatToc.value.forEach((link, index) => {
        const x = indicatorX(link);
        const bottom = (index + 1) * tocItemHeight;
        const next = flatToc.value[index + 1];

        if (!next) {
            points.push(`L${x} ${height}`);
            return;
        }

        const nextX = indicatorX(next);
        if (nextX === x) {
            points.push(`L${x} ${bottom}`);
            return;
        }

        points.push(`L${x} ${bottom - 6}`);
        points.push(`L${nextX} ${bottom + 6}`);
    });

    return points.join(" ");
});

const indicatorStyle = computed(() => {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${indicatorWidth} ${indicatorHeight.value}'><path d='${indicatorPath.value}' stroke='black' stroke-width='4' stroke-linecap='round' stroke-linejoin='round' fill='none'/></svg>`;
    const maskImage = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

    return {
        height: `${indicatorHeight.value}px`,
        maskImage,
        WebkitMaskImage: maskImage,
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskSize: "100% 100%",
        WebkitMaskSize: "100% 100%",
    };
});

const activeIndicatorStyle = computed(() => ({
    height: `${tocItemHeight}px`,
    transform: `translateY(${activeIndex.value * tocItemHeight}px)`,
}));

function linkClass(link: ToCLink) {
    return [
        "block h-7 truncate py-1.5 pr-3 leading-4 transition-colors duration-200 ease-out hover:text-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary",
        link.depth === 3 ? "pl-9 text-sm" : "pl-4 text-base",
        activeId.value === link.id ? "text-tertiary" : "text-textbg",
    ];
}

function indicatorX(link: ToCLink) {
    return link.depth === 3 ? h3IndicatorX : h2IndicatorX;
}

function collectArticleHeadings() {
    return [
        ...document.querySelectorAll<HTMLElement>("main h2[id], main h3[id]"),
    ];
}

function updateActiveHeading() {
    if (Date.now() < hashScrollUntil) return;

    const headings = collectArticleHeadings();
    if (!headings.length) return;

    const scrollLine =
        window.scrollY + getScrollPaddingTop() + scrollSpyActivationOffset;
    let current = headings[0]!;

    for (const heading of headings) {
        if (headingStartOffset(heading) <= scrollLine) {
            current = heading;
        }
    }

    activeId.value = current.id;
}

function lockToHashScrollDestination(id: string) {
    hashScrollUntil = Date.now() + hashScrollLockDuration;
    activeId.value = id;
}

function getScrollPaddingTop() {
    const value = getComputedStyle(document.documentElement).scrollPaddingTop;
    return Number.parseFloat(value) || 0;
}

function headingStartOffset(heading: HTMLElement) {
    const scrollMarginTop =
        Number.parseFloat(getComputedStyle(heading).scrollMarginTop) || 0;

    return (
        heading.getBoundingClientRect().top + window.scrollY - scrollMarginTop
    );
}

function setupScrollSpy() {
    stopScrollSpy?.();
    const update = () => updateActiveHeading();
    const updateAfterAnchorScroll = () => {
        window.setTimeout(update, hashScrollLockDuration + 50);
    };
    const updateForHashScroll = (event: Event) => {
        const { id } = (event as CustomEvent<{ id?: string }>).detail ?? {};
        if (id) {
            lockToHashScrollDestination(id);
        }
    };

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    window.addEventListener("hashchange", updateAfterAnchorScroll);
    window.addEventListener("wiki:hash-scroll", updateForHashScroll);
    stopScrollSpy = () => {
        window.removeEventListener("scroll", update);
        window.removeEventListener("resize", update);
        window.removeEventListener("hashchange", updateAfterAnchorScroll);
        window.removeEventListener("wiki:hash-scroll", updateForHashScroll);
    };

    update();
}

watch(
    () => props.toc,
    async () => {
        await nextTick();
        setupScrollSpy();
    },
    { deep: true },
);

onMounted(async () => {
    await nextTick();
    setupScrollSpy();
});

onBeforeUnmount(() => {
    stopScrollSpy?.();
});
</script>
