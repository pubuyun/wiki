<template>
    <div class="relative aspect-[200/201] h-full shrink-0">
        <img
            src="https://static.igem.wiki/teams/6133/wiki/general/logo.webp"
            alt="Logo"
            width="200"
            height="201"
            class="relative h-full w-full"
        />
        <span
            class="brand-decoration animate-float absolute inset-0"
            aria-hidden="true"
        >
            <span class="brand-eye brand-eye-left"></span>
            <span class="brand-eye brand-eye-right"></span>
        </span>
    </div>
</template>

<style scoped>
@keyframes float {
    0% {
        transform: translate(0, 0);
    }
    50% {
        transform: translate(0.1em, -0.15em);
    }
    100% {
        transform: translate(0, 0);
    }
}

.animate-float {
    animation: float 6s ease-in-out infinite;
}

.brand-decoration {
    background: currentColor;
    color: var(--color-accent);
    mask: url("/brand-blob.svg") center / contain no-repeat;
    -webkit-mask: url("/brand-blob.svg") center / contain no-repeat;
}

.brand-eye {
    position: absolute;
    width: 1.4%;
    height: 7%;
    border-radius: 9999px;
    background: white;
}

.brand-eye-left {
    left: 79%;
    top: 48%;
}

.brand-eye-right {
    left: 84%;
    top: 46%;
}
</style>
