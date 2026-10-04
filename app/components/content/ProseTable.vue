<template>
    <div
        class="my-8 max-w-full overflow-x-auto rounded-lg border border-outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-outline"
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

<style scoped>
/* The rounded container draws the perimeter; cells draw the internal grid. */
:deep(tr > :first-child) {
    border-left: 0;
}

:deep(tr > :last-child) {
    border-right: 0;
}

:deep(thead > tr:first-child > *) {
    border-top: 0;
}

:deep(tbody:last-child > tr:last-child > *) {
    border-bottom: 0;
}
</style>
