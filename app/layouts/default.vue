<template>
    <div class="relative z-0 flex min-h-screen flex-col">
        <header class="fixed top-0 z-100 flex w-full flex-col">
            <NavigationBar />
        </header>
        <slot />
        <Footer />
        <BackToTop />
        <ClickAnimation />
    </div>
</template>
<script setup lang="ts"></script>
