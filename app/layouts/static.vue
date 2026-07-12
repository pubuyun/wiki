<template>
    <div class="relative z-0 flex min-h-screen flex-col">
        <header class="sticky top-0 z-100 flex w-full flex-col">
            <NavigationBar :scroll-opacity="false" />
        </header>
        <main class="flex-1">
            <slot />
        </main>
        <Footer />
        <aside aria-label="Page utilities">
            <BackToTop />
        </aside>
    </div>
</template>
