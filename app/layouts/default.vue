<template>
    <div class="relative z-0 flex min-h-screen flex-col">
        <header class="fixed top-0 z-100 flex w-full flex-col">
            <NavigationBar />
        </header>
        <main class="flex-1">
            <slot />
        </main>
        <Footer />
        <aside aria-label="Page utilities">
            <BackToTop />
        </aside>
        <ClickAnimation />
    </div>
</template>
