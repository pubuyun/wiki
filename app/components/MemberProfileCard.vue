<script setup lang="ts">
interface Member {
    id: string;
    chineseName: string;
    englishName: string;
    displayedName: string;
    title: string;
    photoUrl: string;
    animalUrl: string;
    animalScale: number;
    introduction: string;
}

const props = defineProps<{
    member?: Member;
    unlocked: boolean;
    animalFailed: boolean;
}>();

const portraitLoaded = ref(false);
const animalLoaded = ref(false);

watch(
    () => props.member?.id,
    () => {
        portraitLoaded.value = false;
        animalLoaded.value = false;
    },
    { immediate: true },
);

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
        <svg
            class="profile-decoration"
            viewBox="0 0 1000 560"
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
        >
            <rect
                class="envelope-orange"
                x="72"
                y="66"
                width="470"
                height="438"
            />
            <path
                class="ticket ticket-back"
                d="M320 92H930A70 70 0 0 0 1000 162V430A70 70 0 0 0 930 500H320Z"
            />
            <path
                class="ticket ticket-front"
                d="M300 122H900A64 64 0 0 0 964 186V416A64 64 0 0 0 900 480H300Z"
            />
            <path class="envelope-yellow-top" d="M72 66H475L300 232H72Z" />
            <path class="envelope-yellow-bottom" d="M72 504H475L300 344H72Z" />
            <path class="envelope-yellow-fold" d="M72 504V344L218 386V430Z" />
        </svg>

        <div class="portrait-column">
            <div class="portrait-frame">
                <img
                    :key="`${member.id}-portrait`"
                    :src="member.photoUrl"
                    :alt="`Portrait of ${member.englishName}`"
                    class="portrait-image"
                    :class="{ 'is-loaded': portraitLoaded }"
                    @load="portraitLoaded = true"
                />
                <span
                    v-if="!portraitLoaded"
                    class="media-loading portrait-loading"
                    role="status"
                    >Loading</span
                >
            </div>
            <h2
                :id="`member-name-${member.id}`"
                class="member-name"
                :aria-label="`${member.chineseName} ${member.englishName}`"
            >
                <span>{{ member.displayedName }}</span>
            </h2>
        </div>

        <div class="profile-sheet">
            <div class="profile-copy">
                <p v-if="member.introduction" class="member-introduction">
                    {{ member.introduction }}
                </p>
            </div>

            <div
                class="animal-display"
                :style="{ '--animal-scale': member.animalScale }"
            >
                <template v-if="unlocked && !animalFailed">
                    <img
                        :key="`${member.id}-animal`"
                        :src="member.animalUrl"
                        :alt="`${member.englishName}'s animal character`"
                        class="animal-image"
                        :class="{ 'is-loaded': animalLoaded }"
                        @load="animalLoaded = true"
                        @error="emit('animalError', member.id)"
                    />
                    <span
                        v-if="!animalLoaded"
                        class="media-loading animal-loading"
                        role="status"
                        >Loading</span
                    >
                </template>
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
                </div>
            </div>
        </div>
    </article>

    <div
        v-else
        class="profile-empty"
        role="img"
        aria-label="No member selected"
    >
        <span aria-hidden="true">?</span>
    </div>
</template>

<style scoped>
.profile-card {
    --portrait-top: 10%;
    --portrait-left: 5%;
    --portrait-width: 27%;
    --portrait-height: 65%;
    --portrait-crop-top: 25%;
    --portrait-image-height: 133.333%;
    --paper-top: 15%;
    --paper-right: 0%;
    --paper-bottom: 5%;
    --paper-left: 21%;
    --paper-rotation: 4.5deg;
    --paper-background-x: 46%;
    --paper-background-width: 150%;
    --copy-top: 10%;
    --copy-bottom: 10%;
    --copy-left: 22%;
    --copy-width: 34%;
    --animal-top: 15%;
    --animal-right: 0.5%;
    --animal-size: 40%;
    --animal-scale: 1.16;
    --name-tag-left: 20%;
    --name-tag-bottom: -21%;
    --name-tag-min-width: 100%;
    --name-tag-max-width: 175%;
    --name-tag-height: clamp(3.75rem, 7.5vw, 6.25rem);
    --name-tag-rotation: -7deg;
    --name-tag-font-size: clamp(1.35rem, 3.5vw, 3.4rem);

    position: relative;
    isolation: isolate;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    min-height: 0;
    overflow: visible;
    border: 0;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
}

.profile-empty {
    display: grid;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    min-height: 0;
    place-items: center;
    border: clamp(0.22rem, 0.45vw, 0.38rem) dashed var(--empty-ring);
    border-radius: clamp(1.25rem, 2.2vw, 2.5rem);
    background: var(--empty-fill);
    color: var(--empty-ring);
}

.profile-empty span {
    font-family: "Righteous", sans-serif;
    font-size: clamp(4rem, 10vmin, 8rem);
    line-height: 1;
}

.portrait-column {
    position: absolute;
    z-index: 5;
    top: var(--portrait-top);
    left: var(--portrait-left);
    display: grid;
    width: var(--portrait-width);
    height: var(--portrait-height);
    min-height: 0;
    grid-template-rows: minmax(0, 1fr);
}

.portrait-frame {
    position: relative;
    z-index: 1;
    box-sizing: border-box;
    min-height: 0;
    overflow: hidden;
    border: clamp(0.55rem, 1vw, 0.9rem) solid #ffffff;
    border-bottom-width: clamp(1.8rem, 4.4vw, 3.4rem);
    background: #ffffff;
    box-shadow: 0 0.5rem 0.9rem rgb(4 31 75 / 0.2);
}

.portrait-image {
    width: 100%;
    height: var(--portrait-image-height);
    object-fit: cover;
    object-position: center center;
    opacity: 0;
    transform: translateY(calc(0% - var(--portrait-crop-top)));
}

.portrait-image.is-loaded,
.animal-image.is-loaded {
    opacity: 1;
}

.profile-sheet {
    position: absolute;
    z-index: 4;
    top: var(--paper-top);
    right: var(--paper-right);
    bottom: var(--paper-bottom);
    left: var(--paper-left);
    display: block;
    box-sizing: border-box;
    min-width: 0;
    min-height: 0;
    margin: 0;
    padding: 0;
    overflow: visible;
    background: transparent;
    box-shadow: none;
}

.profile-sheet::before {
    position: absolute;
    z-index: 0;
    inset: 0;
    background: var(--paper-background-x) center / var(--paper-background-width)
        100% no-repeat url("/introductionbg.svg");
    content: "";
    pointer-events: none;
    transform: rotate(var(--paper-rotation));
    transform-origin: center;
}

.profile-copy {
    position: absolute;
    z-index: 1;
    top: var(--copy-top);
    bottom: var(--copy-bottom);
    left: var(--copy-left);
    display: grid;
    width: var(--copy-width);
    height: auto;
    min-width: 0;
    min-height: 0;
    place-items: center;
    overflow: auto;
}

.member-name {
    position: absolute;
    z-index: 3;
    right: auto;
    bottom: var(--name-tag-bottom);
    left: var(--name-tag-left);
    display: grid;
    box-sizing: border-box;
    width: max-content;
    min-width: var(--name-tag-min-width);
    max-width: var(--name-tag-max-width);
    min-height: var(--name-tag-height);
    margin: 0;
    padding: 0.3rem clamp(2.8rem, 4vw, 5rem) 0.55rem
        clamp(1.25rem, 2.2vw, 2.5rem);
    place-items: center;
    clip-path: polygon(0 0, 100% 0, 88% 50%, 100% 100%, 0 100%);
    background: #0b3b73;
    color: #ffffff;
    font-family: "Righteous", sans-serif;
    font-size: var(--name-tag-font-size);
    line-height: 1.05;
    text-align: center;
    text-shadow: 0 0.12rem 0 rgb(4 31 75 / 0.18);
    transform: rotate(var(--name-tag-rotation));
    white-space: nowrap;
}

.member-introduction {
    margin: 0;
    font-family: "Belanosima", sans-serif;
    font-size: clamp(0.72rem, 1.3vw, 1.25rem);
    line-height: 1.35;
    color: #12355f;
    text-align: center;
    white-space: pre-line;
}

.animal-display {
    position: absolute;
    z-index: 2;
    top: var(--animal-top);
    right: var(--animal-right);
    display: grid;
    width: var(--animal-size);
    height: auto;
    aspect-ratio: 1;
    min-width: 0;
    min-height: 0;
    overflow: visible;
    place-items: center;
    border-radius: 50%;
    background: transparent;
    transform: scale(var(--animal-scale));
    transform-origin: center;
}

.animal-image {
    width: 100%;
    height: 100%;
    max-width: none;
    max-height: none;
    object-fit: contain;
    opacity: 0;
    filter: drop-shadow(0 0.6rem 0.45rem rgb(4 48 96 / 0.16));
}

.media-loading {
    display: grid;
    place-items: center;
    font-family: "Belanosima", sans-serif;
    color: var(--profile-heading);
}

.portrait-loading {
    position: absolute;
    inset: 0;
    background: var(--portrait-bg);
}

.animal-loading {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: rgb(221 224 225 / 0.94);
}

.locked-animal {
    display: grid;
    width: 100%;
    aspect-ratio: 1;
    place-items: center;
    border: 0;
    border-radius: 50%;
    background: rgb(221 224 225 / 0.9);
    color: #2f71b9;
}

.locked-animal span {
    font-family: "Righteous", sans-serif;
    font-size: clamp(3.5rem, 8vmin, 7rem);
    line-height: 1;
}

.missing-animal {
    display: grid;
    border-style: solid;
}
.missing-animal span {
    font-size: clamp(2rem, 4vw, 4rem);
}
.profile-decoration {
    position: absolute;
    z-index: 1;
    inset: 0;
    display: block;
    width: 100%;
    height: 100%;
    pointer-events: none;
}

.envelope-orange {
    fill: #ffae42;
}

.envelope-yellow-top {
    fill: #ffdf70;
}

.envelope-yellow-bottom {
    fill: #ffe176;
}

.envelope-yellow-fold {
    fill: #ffd13d;
}

.ticket-back {
    fill: #114c9f;
}

.ticket-front {
    fill: #3e83d7;
}

@media (max-width: 58rem) {
    .profile-card {
        --portrait-left: 2%;
        --portrait-width: 32%;
        --paper-left: 23%;
        --copy-left: 20%;
        --copy-width: 35%;
        --animal-size: 39%;
        --animal-scale: 1.1;
        --name-tag-left: 7%;
        --name-tag-min-width: 100%;
        --name-tag-max-width: 165%;
        --name-tag-height: 2.8rem;
        --name-tag-font-size: clamp(0.92rem, 2.6vw, 1.8rem);

        border-width: 0;
        border-radius: 0;
    }

    .portrait-frame {
        border-width: 0.42rem;
        border-bottom-width: 1.75rem;
    }

    .portrait-image {
        object-position: center center;
    }

    .locked-animal {
        border-width: 0.2rem;
    }

    .locked-animal span {
        font-size: clamp(2.6rem, 9vmin, 4rem);
    }
}

@media (max-width: 39rem) {
    .member-name {
        display: grid;
    }
}
</style>
