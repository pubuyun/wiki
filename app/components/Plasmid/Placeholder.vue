<template>
    <div
        class="overflow-hidden rounded-xl border border-surface-bright bg-secondary text-on-secondary shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        role="status"
        aria-label="Loading plasmid viewer"
        aria-busy="true"
    >
        <div
            class="h-13.25 border-b border-surface-bright bg-surface-elevated lg:hidden dark:border-zinc-700 dark:bg-zinc-800"
            aria-hidden="true"
        />
        <div
            class="grid lg:h-[clamp(32rem,55vw,38rem)] lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]"
        >
            <div
                class="flex min-h-80 items-center justify-center px-4 sm:px-6 lg:min-h-0"
            >
                <div
                    class="relative aspect-square w-full max-w-[38rem] lg:h-full lg:w-auto"
                >
                    <span
                        class="absolute inset-0 grid place-items-center text-sm"
                    >
                        Loading plasmid map...
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>
