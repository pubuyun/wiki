<template>
    <div class="relative z-0 flex min-h-screen flex-col">
        <header class="fixed top-0 z-100 flex w-full flex-col">
            <NavigationBar />
        </header>
        <AccessibilityMenu />
        <main class="flex-1">
            <slot />
        </main>
        <LazyFooter hydrate-on-visible />
        <aside aria-label="Page utilities">
            <BackToTop />
        </aside>
        <ClickAnimation />
    </div>
</template>
