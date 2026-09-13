<template>
    <div
        class="my-8 max-w-full overflow-x-auto rounded-lg focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-outline"
        role="region"
        aria-label="Scrollable data table"
        tabindex="0"
    >
        <table class="w-full border-collapse text-left text-sm shadow-sm">
            <caption class="sr-only">
                Data table
            </caption>
            <slot />
        </table>
    </div>
</template>
