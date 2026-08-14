<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { gsap } from "gsap";
import { nextTick, onMounted, onUnmounted, ref } from "vue";
import {
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuTrigger,
} from "reka-ui";

interface DropdownLink {
    to: string;
    label: string;
    icon: string;
}

const props = withDefaults(
    defineProps<{
        title: string;
        to?: string;
        links?: DropdownLink[];
    }>(),
    { links: () => [] },
);

const menuContent = ref<InstanceType<typeof NavigationMenuContent>>();
const menuInner = ref<HTMLElement | null>(null);

let observer: MutationObserver | null = null;
let tl: gsap.core.Timeline | null = null;

function getContentElement(): HTMLElement | null {
    return (menuContent.value?.$el as HTMLElement) ?? null;
}

function animateMenu(isOpen: boolean) {
    const content = getContentElement();
    const inner = menuInner.value;
    if (!content || !inner) return;

    tl?.kill();

    if (isOpen) {
        content.style.zIndex = String(++menuZIndex);
        gsap.set(content, {
            height: "auto",
            overflow: "hidden",
        });

        const targetHeight = content.offsetHeight;

        gsap.set(content, {
            height: 0,
            opacity: 0,
        });

        gsap.set(inner, {
            opacity: 0,
            y: -10,
        });

        tl = gsap.timeline();

        tl.to(content, {
            height: targetHeight,
            opacity: 1,
            duration: 0.4,
            ease: "expo.out",
        })
            .to(
                inner,
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.3,
                    ease: "power3.out",
                },
                0.05,
            )
            .set(content, {
                height: "auto",
            });
    } else {
        // 此时 content 仍然保持打开状态
        // 所以能够真正看到关闭动画

        gsap.set(content, {
            height: content.offsetHeight,
            overflow: "hidden",
        });

        tl = gsap.timeline();

        tl.to(inner, {
            opacity: 0,
            y: -8,
            duration: 0.2,
            ease: "power2.in",
        }).to(
            content,
            {
                height: 0,
                opacity: 0,
                duration: 0.3,
                ease: "expo.inOut",
            },
            "-=0.1",
        );
    }
}

onMounted(async () => {
    await nextTick();
    const content = getContentElement();
    if (!content) return;

    // 初始状态渲染
    if (content.dataset.state === "open") {
        animateMenu(true);
    } else {
        gsap.set(content, { height: 0, opacity: 0, overflow: "hidden" });
        if (menuInner.value) {
            gsap.set(menuInner.value, { opacity: 0, y: -10 });
        }
    }

    // 监听 data-state 变化
    observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (
                mutation.type === "attributes" &&
                mutation.attributeName === "data-state"
            ) {
                const isOpen = content.dataset.state === "open";
                animateMenu(isOpen);
            }
        }
    });
    observer.observe(content, {
        attributes: true,
        attributeFilter: ["data-state"],
    });
});

onUnmounted(() => {
    observer?.disconnect();
    tl?.kill();
});
</script>

<script lang="ts">
let menuZIndex = 50;
</script>

<template>
    <NavigationMenuItem class="relative inline-block">
        <NavigationMenuTrigger
            class="nav-menu-trigger group inline-flex cursor-pointer list-none items-center gap-1 bg-transparent px-1 py-2 text-on-surface outline-offset-4 select-none hover:text-secondary focus-visible:outline-2 focus-visible:outline-outline"
        >
            <span
                class="decoration-2 underline-offset-2 colorblind:group-hover:underline colorblind:group-focus-visible:underline"
                >{{ title }}</span
            >
            <span
                class="text-lg transition-transform duration-200 group-focus-within:rotate-180 group-hover:rotate-180 group-data-[state=open]:rotate-180"
                aria-hidden="true"
                >&#9662;</span
            >
        </NavigationMenuTrigger>

        <NavigationMenuContent
            ref="menuContent"
            force-mount
            class="absolute top-full -left-1/3 w-62 overflow-hidden rounded-2xl bg-surface-bright text-on-surface shadow-sm data-[state=closed]:pointer-events-none! data-[state=open]:pointer-events-auto!"
        >
            <div ref="menuInner" class="mx-auto flex w-fit flex-col">
                <NavigationMenuLink
                    v-for="link in links"
                    :key="link.to"
                    as-child
                >
                    <NuxtLink
                        :to="link.to"
                        @pointerdown.stop
                        class="group flex min-h-16 w-53 items-center gap-3 px-5 py-4 text-xl text-on-surface no-underline -outline-offset-2 first:rounded-t-2xl last:rounded-b-2xl focus-visible:outline-2 focus-visible:outline-outline"
                    >
                        <Icon :icon="link.icon" class="size-6 shrink-0" />
                        <span
                            class="transition-transform duration-150 ease-out group-hover:translate-x-2"
                        >
                            {{ link.label }}
                        </span>
                    </NuxtLink>
                </NavigationMenuLink>
            </div>
        </NavigationMenuContent>
    </NavigationMenuItem>
</template>
