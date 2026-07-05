<script setup lang="ts">
import {
    AccordionContent,
    AccordionHeader,
    AccordionItem,
    AccordionRoot,
    AccordionTrigger,
    DialogClose,
    DialogContent,
    DialogOverlay,
    DialogPortal,
    DialogRoot,
    DialogTitle,
    DialogTrigger,
} from "reka-ui";
import { Icon } from "@iconify/vue";
import { siteNavGroups } from "~/utils/site-navigation";

const route = useRoute();
const router = useRouter();
const contentLayout = useContentLayoutState();
const open = ref(false);
const activeView = ref<"main" | "category">("main");

const categoryNodes = computed(() => contentLayout.value.categoryNavNodes);
const isContentRoute = computed(
    () => Boolean(route.params.slug) || Boolean(route.params.category),
);
const hasCategoryNavigation = computed(
    () => isContentRoute.value && categoryNodes.value.length > 0,
);
const categoryTitle = computed(
    () => contentLayout.value.categoryTitle || contentLayout.value.page?.title,
);
const categoryPath = computed(() => contentLayout.value.categoryPath);

watch(
    () => [open.value, route.fullPath, hasCategoryNavigation.value] as const,
    ([isOpen]) => {
        if (!isOpen) return;

        activeView.value = hasCategoryNavigation.value ? "category" : "main";
    },
    { immediate: true },
);

function closeDialog() {
    open.value = false;
}

function categoryItemValue(id: string) {
    return `category:${id}`;
}

function navigateFolder(node: { path?: string }) {
    if (!node.path) return;

    router.push(node.path);
}
</script>

<template>
    <DialogRoot v-model:open="open">
        <DialogTrigger
            aria-label="Open navigation menu"
            class="flex size-9 shrink-0 items-center justify-center rounded-md text-on-surface transition-colors hover:bg-secondary hover:text-on-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-outline lg:hidden"
        >
            <Icon icon="lucide:menu" class="size-5" aria-hidden="true" />
        </DialogTrigger>

        <DialogPortal>
            <DialogOverlay class="fixed inset-0 z-100 bg-black/45 lg:hidden" />

            <Transition
                enter-active-class="transition-transform duration-200 ease-out"
                enter-from-class="translate-x-full"
                leave-active-class="transition-transform duration-150 ease-in"
                leave-to-class="translate-x-full"
            >
                <DialogContent
                    class="fixed top-0 right-0 z-101 flex h-dvh w-[min(21rem,88vw)] flex-col overflow-hidden bg-surface-bright text-on-surface shadow-2xl outline-none lg:hidden"
                >
                    <header
                        class="flex h-14 shrink-0 items-center justify-between border-b border-outline-variant px-4"
                    >
                        <button
                            v-if="activeView === 'category'"
                            type="button"
                            class="inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors hover:bg-secondary hover:text-on-secondary focus-visible:outline-2 focus-visible:outline-outline"
                            @click="activeView = 'main'"
                        >
                            <Icon
                                icon="lucide:arrow-left"
                                class="size-4"
                                aria-hidden="true"
                            />
                            Main menu
                        </button>
                        <DialogTitle
                            v-if="activeView === 'category'"
                            class="sr-only"
                        >
                            {{ categoryTitle }} navigation
                        </DialogTitle>
                        <DialogTitle
                            v-else
                            class="font-righteous text-lg text-on-surface"
                        >
                            Menu
                        </DialogTitle>

                        <DialogClose
                            aria-label="Close navigation menu"
                            class="flex size-9 items-center justify-center rounded-md transition-colors hover:bg-secondary hover:text-on-secondary focus-visible:outline-2 focus-visible:outline-outline"
                        >
                            <Icon icon="lucide:x" class="size-5" />
                        </DialogClose>
                    </header>

                    <div class="min-h-0 flex-1 overflow-y-auto px-4 py-5">
                        <div v-if="activeView === 'category'" class="space-y-4">
                            <NuxtLink
                                :to="categoryPath"
                                class="block rounded-md font-righteous text-xl text-on-surface transition-colors hover:bg-secondary hover:text-on-secondary focus-visible:outline-2 focus-visible:outline-outline"
                                :aria-label="`Go to ${categoryTitle}`"
                                @click="closeDialog"
                            >
                                {{ categoryTitle }}
                            </NuxtLink>
                            <AccordionRoot type="multiple" class="space-y-2">
                                <template
                                    v-for="node in categoryNodes"
                                    :key="node.id"
                                >
                                    <AccordionItem
                                        v-if="node.children?.length"
                                        :value="categoryItemValue(node.id)"
                                        class="overflow-hidden rounded-md bg-surface-bright"
                                    >
                                        <AccordionHeader>
                                            <AccordionTrigger
                                                class="group flex w-full items-center justify-between gap-3 px-3 py-2 text-left font-momo-trust-display focus-visible:outline-2 focus-visible:outline-outline"
                                                :class="
                                                    node.active &&
                                                    'bg-primary text-on-primary'
                                                "
                                                @click="navigateFolder(node)"
                                            >
                                                <span>{{ node.label }}</span>
                                                <Icon
                                                    icon="lucide:chevron-right"
                                                    class="size-4 shrink-0 transition-transform group-data-[state=open]:rotate-90"
                                                    aria-hidden="true"
                                                />
                                            </AccordionTrigger>
                                        </AccordionHeader>
                                        <AccordionContent
                                            class="overflow-hidden data-[state=closed]:animate-[phone-menu-slide-up_180ms_ease-in] data-[state=open]:animate-[phone-menu-slide-down_220ms_ease-out]"
                                        >
                                            <ul class="space-y-1 px-3 py-2">
                                                <li
                                                    v-for="child in node.children"
                                                    :key="child.id"
                                                >
                                                    <NuxtLink
                                                        v-if="child.path"
                                                        :to="child.path"
                                                        class="block rounded-md px-3 py-2 font-belanosima text-on-surface hover:bg-secondary hover:text-on-secondary"
                                                        :class="
                                                            child.active &&
                                                            'bg-primary text-on-primary'
                                                        "
                                                        @click="closeDialog"
                                                    >
                                                        {{ child.label }}
                                                    </NuxtLink>
                                                </li>
                                            </ul>
                                        </AccordionContent>
                                    </AccordionItem>

                                    <NuxtLink
                                        v-else-if="node.path"
                                        :to="node.path"
                                        class="block rounded-md px-3 py-2 font-momo-trust-display text-on-surface hover:bg-secondary hover:text-on-secondary"
                                        :class="
                                            node.active &&
                                            'bg-primary text-on-primary'
                                        "
                                        @click="closeDialog"
                                    >
                                        {{ node.label }}
                                    </NuxtLink>
                                </template>
                            </AccordionRoot>
                        </div>

                        <AccordionRoot
                            v-else
                            type="single"
                            collapsible
                            class="space-y-2"
                        >
                            <AccordionItem
                                v-for="group in siteNavGroups"
                                :key="group.title"
                                :value="group.title"
                                class="overflow-hidden rounded-md bg-surface-bright"
                            >
                                <AccordionHeader>
                                    <AccordionTrigger
                                        class="group flex w-full items-center justify-between gap-3 px-3 py-2 text-left font-righteous focus-visible:outline-2 focus-visible:outline-outline"
                                    >
                                        <span>{{ group.title }}</span>
                                        <Icon
                                            icon="lucide:chevron-right"
                                            class="size-4 shrink-0 transition-transform group-data-[state=open]:rotate-90"
                                            aria-hidden="true"
                                        />
                                    </AccordionTrigger>
                                </AccordionHeader>
                                <AccordionContent
                                    class="overflow-hidden data-[state=closed]:animate-[phone-menu-slide-up_180ms_ease-in] data-[state=open]:animate-[phone-menu-slide-down_220ms_ease-out]"
                                >
                                    <ul class="space-y-1 px-3 py-2">
                                        <li
                                            v-for="link in group.links"
                                            :key="link.to"
                                        >
                                            <NuxtLink
                                                :to="link.to"
                                                class="block rounded-md px-3 py-2 font-belanosima text-on-surface hover:bg-secondary hover:text-on-secondary"
                                                :class="
                                                    route.path === link.to &&
                                                    'bg-primary text-on-primary'
                                                "
                                                @click="closeDialog"
                                            >
                                                {{ link.label }}
                                            </NuxtLink>
                                        </li>
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                        </AccordionRoot>
                    </div>
                </DialogContent>
            </Transition>
        </DialogPortal>
    </DialogRoot>
</template>

<style>
@keyframes phone-menu-slide-down {
    from {
        height: 0;
    }
    to {
        height: var(--reka-accordion-content-height);
    }
}

@keyframes phone-menu-slide-up {
    from {
        height: var(--reka-accordion-content-height);
    }
    to {
        height: 0;
    }
}
</style>
