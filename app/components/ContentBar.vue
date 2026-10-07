<template>
    <nav
        class="sticky top-20 mb-6 w-64 min-w-64 flex-1 flex-col self-start font-belanosima text-base text-on-surface xl:w-80 xl:min-w-80"
        aria-labelledby="toc-title"
    >
        <h2 id="toc-title" class="mb-4 font-momo-trust-display text-base">
            On this page
        </h2>

        <div
            ref="contentScroll"
            class="content-bar-scroll max-h-[calc(100vh-13rem)] overflow-x-hidden overflow-y-auto p-1"
            :style="scrollFadeStyle"
            @scroll="updateScrollGradients"
        >
            <div class="relative">
                <div
                    class="pointer-events-none absolute top-0 left-0 w-3"
                    :style="indicatorStyle"
                    aria-hidden="true"
                >
                    <div class="absolute inset-0 bg-surface-bright" />
                    <div
                        class="absolute inset-x-0 top-0 bg-primary transition-transform duration-200 ease-out"
                        :style="activeIndicatorStyle"
                    />
                </div>

                <ul ref="contentList" class="relative">
                    <li v-for="link in flatToc" :key="link.id">
                        <a
                            :href="`#${link.id}`"
                            :class="linkClass(link)"
                            :aria-current="
                                activeId === link.id ? 'location' : undefined
                            "
                            :data-content-bar-link-id="link.id"
                            @click="scrollToHash($event, link.id)"
                            @focus="revealFocusedLink"
                        >
                            {{ link.text }}
                        </a>
                    </li>
                </ul>
            </div>
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
const contentScroll = ref<HTMLElement>();
const contentList = ref<HTMLElement>();
const canScrollUp = ref(false);
const canScrollDown = ref(false);
const scrollFadeStyle = computed(() => ({
    "--fade-top": canScrollUp.value ? "24px" : "0px",
    "--fade-bottom": canScrollDown.value ? "24px" : "0px",
}));
let hashScrollUntil = 0;
let stopScrollSpy: (() => void) | undefined;
let headingOffsets: Array<{ id: string; top: number }> = [];
let scrollPaddingTop = 0;

function updateScrollGradients() {
    const el = contentScroll.value;
    if (!el) return;
    canScrollUp.value = el.scrollTop > 1;
    canScrollDown.value = el.scrollTop + el.clientHeight < el.scrollHeight - 1;
}

function revealFocusedLink(event: FocusEvent) {
    const viewport = contentScroll.value;
    if (!viewport) return;

    const link = event.target as HTMLElement;
    const linkBounds = link.getBoundingClientRect();
    const viewportBounds = viewport.getBoundingClientRect();
    const viewportStyle = getComputedStyle(viewport);
    const visibleTop =
        viewportBounds.top +
        viewport.clientTop +
        (Number.parseFloat(viewportStyle.scrollPaddingTop) || 0);
    const visibleBottom =
        viewportBounds.top +
        viewport.clientTop +
        viewport.clientHeight -
        (Number.parseFloat(viewportStyle.scrollPaddingBottom) || 0);
    const offset =
        linkBounds.top < visibleTop
            ? linkBounds.top - visibleTop
            : linkBounds.bottom > visibleBottom
              ? linkBounds.bottom - visibleBottom
              : 0;

    // Reveal the link inside the TOC without scrolling its page ancestors.
    if (offset) {
        viewport.scrollTo({
            top: viewport.scrollTop + offset,
            behavior: "instant",
        });
    }
    updateScrollGradients();
}

function measureArticleHeadings() {
    scrollPaddingTop = getScrollPaddingTop();
    headingOffsets = collectArticleHeadings().map((heading) => ({
        id: heading.id,
        top: headingStartOffset(heading),
    }));
}

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
        "block h-7 truncate py-1.5 pr-3 leading-4 transition-colors duration-200 ease-out hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-outline",
        link.depth === 3 ? "pl-9 text-sm" : "pl-4 text-base",
        activeId.value === link.id ? "text-primary" : "text-on-surface",
    ];
}

function indicatorX(link: ToCLink) {
    return link.depth === 3 ? h3IndicatorX : h2IndicatorX;
}

function collectArticleHeadings() {
    const tocIds = new Set(flatToc.value.map((link) => link.id));

    return [
        ...document.querySelectorAll<HTMLElement>(
            "main article h2[id], main article h3[id]",
        ),
    ].filter((heading) => tocIds.has(heading.id));
}

function updateActiveHeading() {
    if (Date.now() < hashScrollUntil) return;

    if (!headingOffsets.length) return;

    const scrollLine =
        window.scrollY + scrollPaddingTop + scrollSpyActivationOffset;
    let current = headingOffsets[0]!;

    for (const heading of headingOffsets) {
        if (heading.top <= scrollLine) {
            current = heading;
        }
    }

    activeId.value = current.id;
}

function lockToHashScrollDestination(id: string) {
    measureArticleHeadings();
    const target = document.getElementById(id);
    const destination =
        flatToc.value.find((link) => link.id === id)?.id ??
        (target
            ? collectArticleHeadings().findLast(
                  (heading) =>
                      heading === target ||
                      Boolean(
                          heading.compareDocumentPosition(target) &
                          Node.DOCUMENT_POSITION_FOLLOWING,
                      ),
              )?.id
            : undefined);
    if (!destination) return;
    hashScrollUntil = Date.now() + hashScrollLockDuration;
    activeId.value = destination;
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
    let frame = 0;
    let needsMeasurement = true;
    let anchorTimer: ReturnType<typeof window.setTimeout> | undefined;
    const update = () => {
        if (frame) return;
        frame = requestAnimationFrame(() => {
            frame = 0;
            if (needsMeasurement) {
                needsMeasurement = false;
                measureArticleHeadings();
            }
            updateActiveHeading();
        });
    };
    const updateLayout = () => {
        needsMeasurement = true;
        updateScrollGradients();
        update();
    };
    const observer = new ResizeObserver(updateLayout);
    const article = document.querySelector("main article");
    if (article) observer.observe(article);
    if (contentScroll.value) observer.observe(contentScroll.value);
    if (contentList.value) observer.observe(contentList.value);
    const updateAfterAnchorScroll = () => {
        window.clearTimeout(anchorTimer);
        anchorTimer = window.setTimeout(update, hashScrollLockDuration + 50);
    };
    const updateForHashScroll = (event: Event) => {
        const { id } = (event as CustomEvent<{ id?: string }>).detail ?? {};
        if (id) {
            lockToHashScrollDestination(id);
            updateAfterAnchorScroll();
        }
    };

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", updateLayout);
    window.addEventListener("hashchange", updateAfterAnchorScroll);
    window.addEventListener("wiki:hash-scroll", updateForHashScroll);
    stopScrollSpy = () => {
        cancelAnimationFrame(frame);
        window.clearTimeout(anchorTimer);
        observer.disconnect();
        window.removeEventListener("scroll", update);
        window.removeEventListener("resize", updateLayout);
        window.removeEventListener("hashchange", updateAfterAnchorScroll);
        window.removeEventListener("wiki:hash-scroll", updateForHashScroll);
    };

    updateLayout();
}

watch(
    () => props.toc,
    async () => {
        hashScrollUntil = 0;
        activeId.value = undefined;
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

<style scoped>
.content-bar-scroll {
    scrollbar-width: none;
    scroll-padding-block: 24px;
    mask-image: linear-gradient(
        to bottom,
        transparent,
        black var(--fade-top),
        black calc(100% - var(--fade-bottom)),
        transparent
    );
}

.content-bar-scroll::-webkit-scrollbar {
    display: none;
}
</style>
