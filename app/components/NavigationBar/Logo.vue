<template>
    <div class="relative h-full">
        <img src="https://static.igem.wiki/teams/6133/wiki/general/logo.webp" alt="Logo" class="relative h-full" />
        <svg
            class="animate-float absolute inset-0 h-full w-full"
            preserveAspectRatio="none"
            viewBox="10 10 65 58"
        >
            <path
                d="M 12.557 -3.3646 Q 9.71 -13.9898 -5.7448 -9.8487 Q -15.404 -7.2605 -12.2982 4.3306 Q -9.9688 13.0239 3.5541 9.4004 Q 15.1452 6.2946 12.557 -3.3646 Z"
                transform="translate(56,27) scale(0.6)"
                class="fill-bermuda"
            />
            <ellipse cx="52" cy="29" rx="0.7" ry="1.5" class="fill-white" />
            <ellipse cx="55" cy="28.5" rx="0.7" ry="1.5" class="fill-white" />
        </svg>
    </div>
</template>
<style scoped>
@keyframes float {
    0% {
        transform: translate(0, 0);
    }
    50% {
        transform: translate(0.15em, -0.2em);
    }
    100% {
        transform: translate(0, 0);
    }
}

.animate-float {
    animation: float 3s ease-in-out infinite;
}
</style>
