<script setup lang="ts">
interface Member {
    id: string;
    chineseName: string;
    englishName: string;
    title: string;
    photoUrl: string;
    animalUrl: string;
    introduction: string;
}

defineProps<{
    member?: Member;
    unlocked: boolean;
    animalFailed: boolean;
}>();

const emit = defineEmits<{
    animalError: [memberId: string];
}>();

function memberInitials(name: string) {
    return name
        .split(/\s+/)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}
</script>

<template>
    <article
        v-if="member"
        class="profile-card"
        :aria-labelledby="`member-name-${member.id}`"
    >
        <div class="portrait-column">
            <div class="portrait-frame">
                <span class="portrait-corner corner-one" />
                <span class="portrait-corner corner-two" />
                <span class="portrait-corner corner-three" />
                <img
                    :src="member.photoUrl"
                    :alt="`Portrait of ${member.englishName}`"
                    class="portrait-image"
                />
            </div>
            <p v-if="member.title" class="member-title">{{ member.title }}</p>
        </div>

        <div class="profile-sheet">
            <div class="profile-copy">
                <p class="profile-label">Name:</p>
                <h2 :id="`member-name-${member.id}`" class="member-name">
                    <span>{{ member.chineseName }}</span>
                    <span>{{ member.englishName }}</span>
                </h2>
                <p class="profile-label introduction-label">
                    Personal introduction:
                </p>
                <p class="member-introduction">{{ member.introduction }}</p>
            </div>

            <div class="animal-display">
                <img
                    v-if="unlocked && !animalFailed"
                    :src="member.animalUrl"
                    :alt="`${member.englishName}'s animal character`"
                    class="animal-image"
                    @error="emit('animalError', member.id)"
                />
                <div
                    v-else-if="!unlocked"
                    class="locked-animal"
                    role="img"
                    :aria-label="`${member.englishName}'s animal character is locked`"
                >
                    <span aria-hidden="true">?</span>
                </div>
                <div
                    v-else
                    class="locked-animal missing-animal"
                    role="img"
                    :aria-label="`${member.englishName}'s animal artwork is unavailable`"
                >
                    <span aria-hidden="true">
                        {{ memberInitials(member.englishName) }}
                    </span>
                    <small>Artwork unavailable</small>
                </div>
            </div>
        </div>
    </article>

    <div v-else class="profile-empty" aria-label="No member selected">
        <span aria-hidden="true">?</span>
    </div>
</template>

<style scoped>
.profile-card {
    display: grid;
    grid-template-columns: minmax(8rem, 0.35fr) minmax(0, 1fr);
    width: 100%;
    height: 100%;
    min-height: 0;
    overflow: hidden;
    border: clamp(0.55rem, 1vw, 1rem) solid var(--card-frame);
    border-radius: clamp(1.25rem, 2.2vw, 2.5rem);
    background: var(--card-frame);
    box-shadow:
        0.7rem 0.8rem 0 var(--card-shadow-solid),
        0 1.2rem 2rem var(--card-shadow);
}

.profile-empty {
    display: grid;
    width: min(42%, 18rem);
    aspect-ratio: 1;
    place-items: center;
    margin: auto;
    border: clamp(0.22rem, 0.45vw, 0.38rem) dashed var(--empty-ring);
    border-radius: 50%;
    background: var(--empty-fill);
    color: var(--empty-ring);
}

.profile-empty span {
    font-family: "Righteous", sans-serif;
    font-size: clamp(4rem, 10vmin, 8rem);
    line-height: 1;
}

.portrait-column {
    display: flex;
    min-height: 0;
    flex-direction: column;
    gap: 0.5rem;
    padding: clamp(0.55rem, 1vw, 1rem);
}

.portrait-frame {
    position: relative;
    min-height: 0;
    flex: 1;
    overflow: hidden;
    border: clamp(0.3rem, 0.6vw, 0.55rem) solid var(--portrait-border);
    border-radius: 1.4rem 0.35rem 1.4rem 0.35rem;
    background: var(--portrait-bg);
}

.portrait-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.portrait-corner {
    position: absolute;
    z-index: 1;
    width: clamp(1.7rem, 3vw, 3rem);
    aspect-ratio: 1;
    border-radius: 0 0 100% 0;
    background: var(--accent-orange);
}

.corner-one {
    top: -0.1rem;
    left: -0.1rem;
}
.corner-two {
    top: -0.1rem;
    right: -0.1rem;
    transform: rotate(90deg);
    background: var(--portrait-border);
}
.corner-three {
    right: -0.1rem;
    bottom: -0.1rem;
    transform: rotate(180deg);
    background: var(--machine-shell-top);
}

.member-title {
    margin: 0;
    font-family: "Belanosima", sans-serif;
    color: var(--profile-heading);
}

.profile-sheet {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(7rem, 0.42fr);
    gap: clamp(0.4rem, 1vw, 1rem);
    min-width: 0;
    min-height: 0;
    margin: clamp(0.25rem, 0.55vw, 0.55rem);
    padding: clamp(0.7rem, 1.3vw, 1.5rem);
    overflow: hidden;
    background: var(--paper);
    box-shadow: inset -0.6rem 0.5rem 0.8rem var(--paper-shadow);
}

.profile-copy {
    min-width: 0;
    overflow: auto;
}

.profile-label {
    width: fit-content;
    margin: 0;
    border-bottom: 0.14rem solid var(--profile-rule);
    font-family: "Belanosima", sans-serif;
    font-size: clamp(0.8rem, 1.25vw, 1.35rem);
    line-height: 1.1;
    color: var(--profile-text);
}

.member-name {
    display: flex;
    flex-wrap: wrap;
    gap: 0.2rem 0.65rem;
    margin: 0.35rem 0 clamp(0.7rem, 2vh, 1.8rem);
    font-family: "Righteous", sans-serif;
    font-size: clamp(1rem, 1.8vw, 2rem);
    line-height: 1.05;
    color: var(--profile-heading);
}

.introduction-label {
    margin-bottom: 0.45rem;
}
.member-introduction {
    margin: 0;
    font-size: clamp(0.78rem, 1vw, 1rem);
    line-height: 1.45;
    color: var(--profile-copy);
    white-space: pre-line;
}

.animal-display {
    display: grid;
    min-width: 0;
    min-height: 0;
    place-items: center;
}

.animal-image {
    width: 100%;
    max-height: 100%;
    object-fit: contain;
    filter: drop-shadow(0 0.6rem 0.45rem rgb(4 48 96 / 0.16));
}

.locked-animal {
    display: grid;
    width: min(100%, 15rem);
    aspect-ratio: 1;
    place-items: center;
    border: 0.3rem dashed var(--empty-ring);
    border-radius: 50%;
    background: var(--empty-fill);
    color: var(--empty-ring);
}

.locked-animal span {
    font-family: "Righteous", sans-serif;
    font-size: clamp(3.5rem, 8vmin, 7rem);
    line-height: 1;
}

.missing-animal {
    display: flex;
    flex-direction: column;
    border-style: solid;
}
.missing-animal span {
    font-size: clamp(2rem, 4vw, 4rem);
}
.missing-animal small {
    text-align: center;
}

@media (max-width: 58rem) {
    .profile-card {
        grid-template-columns: minmax(6.5rem, 0.32fr) minmax(0, 1fr);
    }
}

@media (max-width: 39rem) {
    .profile-card {
        grid-template-columns: minmax(5.5rem, 0.28fr) minmax(0, 1fr);
    }
    .profile-sheet {
        grid-template-columns: minmax(0, 1fr) minmax(5.5rem, 0.38fr);
    }
    .member-name {
        display: grid;
    }
}
</style>
