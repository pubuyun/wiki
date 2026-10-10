<script setup lang="ts">
import advisors from "~/data/advisors.json";

const baseURL = useRuntimeConfig().app.baseURL;
const photoUrl = (path: string) =>
    /^https?:\/\//.test(path)
        ? path
        : `${baseURL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
</script>

<template>
    <section id="advisors" class="advisors-gallery" aria-label="Advisors">
        <div class="advisors-grid">
            <article
                v-for="advisor in advisors"
                :key="advisor.id"
                class="advisor-card"
                :aria-labelledby="`advisor-${advisor.id}`"
            >
                <div class="advisor-photo-frame">
                    <img
                        class="advisor-photo"
                        :src="photoUrl(advisor.photoUrl)"
                        :alt="`Portrait of ${advisor.name}`"
                        :width="advisor.photoWidth"
                        :height="advisor.photoHeight"
                        :style="{ objectPosition: advisor.photoPosition }"
                        loading="lazy"
                        decoding="async"
                    />
                </div>
                <div class="advisor-copy">
                    <div class="advisor-name-row">
                        <h2 :id="`advisor-${advisor.id}`">
                            {{ advisor.name }}
                        </h2>
                        <p class="advisor-role">Advisor</p>
                    </div>
                    <p class="advisor-introduction">
                        {{ advisor.introduction }}
                    </p>
                </div>
            </article>
        </div>
    </section>
</template>

<style scoped>
.advisors-gallery {
    width: min(100%, 80rem);
    margin-inline: auto;
    padding: clamp(2rem, 5vw, 4rem) clamp(1rem, 3vw, 3rem)
        clamp(4rem, 8vw, 8rem);
    scroll-margin-top: 5rem;
}

.advisors-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: clamp(1.25rem, 2.5vw, 2rem);
    grid-auto-rows: 1fr;
}

.advisor-card {
    display: flex;
    flex-direction: column;
    min-width: 0;
    padding: 0.85rem;
    border: 2px solid var(--outline-variant);
    border-radius: 1.5rem;
    background: var(--surface-sidebar);
    color: var(--on-surface);
    box-shadow: 0 0.6rem 1.5rem rgb(4 31 75 / 0.18);
    transition:
        background-color 180ms ease,
        color 180ms ease,
        border-color 180ms ease;
}

.advisor-photo-frame {
    flex: none;
    aspect-ratio: 4 / 3;
    overflow: hidden;
    border: 2px solid var(--surface-navigation);
    border-radius: 0.75rem;
    background: var(--surface);
}

.advisor-photo {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.advisor-copy {
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: 1.25rem 0.6rem 0.85rem;
}

.advisor-name-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
    padding-bottom: 1rem;
    border-bottom: 2px solid var(--accent);
}

.advisor-name-row h2 {
    padding: 0.2rem 0.6rem;
    border-radius: 0.5rem;
    background: #03316d;
    color: var(--accent);
    font-family: var(--font-righteous);
    font-size: 1.75rem;
    line-height: 1.2;
}

.advisor-role {
    padding: 0.3rem 0.65rem;
    border: 1px solid var(--outline-variant);
    border-radius: 999px;
    background: var(--surface-navigation);
    color: var(--on-surface);
    font-family: var(--font-belanosima);
    font-size: 0.85rem;
    line-height: 1.2;
}

.advisor-introduction {
    flex: 1;
    margin-top: 1rem;
    font-family: var(--font-main);
    font-size: 0.95rem;
    line-height: 1.75;
    overflow-wrap: anywhere;
    white-space: pre-line;
}

:global(.high-contrast) .advisor-name-row h2 {
    background: var(--surface);
    color: var(--on-surface);
}

@media (max-width: 64rem) {
    .advisors-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (max-width: 40rem) {
    .advisors-grid {
        grid-template-columns: minmax(0, 1fr);
        gap: 1.75rem;
    }

    .advisor-copy {
        padding-inline: 0.5rem;
    }
}
</style>
