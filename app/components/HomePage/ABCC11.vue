<script setup lang="ts">
import Chromosome from "./ABCC11/Chromosome.vue";
import TransporterAnim from "./Mechanism/TransporterAnim.vue";

const baseURL = useRuntimeConfig().app.baseURL.replace(/\/$/, "");
const publicAsset = (fileName: string) => `${baseURL}/${fileName}`;
</script>

<template>
    <section id="abcc11" class="abcc11-scene" aria-labelledby="abcc11-title">
        <h2 id="abcc11-title" class="sr-only">ABCC11 genotype</h2>
        <div class="abcc11-scene__content">
            <Chromosome :genome="1" />
            <TransporterAnim
                class="abcc11-scene__transporter"
                :left-src="publicAsset('abcc11l.png')"
                :middle-src="publicAsset('abcc11m.png')"
                :right-src="publicAsset('abcc11r.png')"
                :open-angle="-5"
                :closed-angle="12"
            />
        </div>
    </section>
</template>

<style scoped>
.abcc11-scene {
    display: grid;
    width: 100%;
    height: 100svh;
    min-height: 30rem;
    padding: clamp(1.5rem, 5vw, 5rem);
    overflow: hidden;
    place-items: center;
    background: #073772;
}

.abcc11-scene__content {
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) minmax(16rem, 0.8fr);
    gap: clamp(1rem, 4vw, 4rem);
    align-items: center;
    width: min(92vw, 90rem);
}

.abcc11-scene :deep(.chromosome-illustration) {
    width: 100%;
    max-height: min(82svh, 48rem);
}

.abcc11-scene__transporter {
    width: 100%;
}

@media (orientation: portrait) {
    .abcc11-scene__content {
        grid-template-columns: 1fr;
        width: min(96vw, 45rem);
    }

    .abcc11-scene :deep(.chromosome-illustration) {
        width: 100%;
        max-height: 52svh;
    }

    .abcc11-scene__transporter {
        justify-self: center;
        width: min(70%, 22rem);
    }
}
</style>
