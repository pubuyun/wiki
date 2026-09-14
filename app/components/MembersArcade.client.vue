<script setup lang="ts">
import { gsap } from "gsap";
import Lenis from "lenis";
import hammerUrl from "../../public/hammer.png?url";
import hamsterUrl from "../../public/hamster.svg?url";
import membersData from "../data/members.json";

interface Member {
    id: string;
    chineseName: string;
    englishName: string;
    title: string;
    photoUrl: string;
    animalUrl: string;
    introduction: string;
}

type GamePhase = "ready" | "running" | "complete" | "restart-confirm";

interface Point {
    x: number;
    y: number;
}

const members = membersData as Member[];

// All gameplay and motion tuning lives here so the feel can be adjusted quickly.
const GAME_TUNING = {
    firstSpawnDelayMs: 420,
    baseVisibleMs: 1450,
    minVisibleMs: 560,
    maxVisibleMs: 1650,
    baseGapMs: 520,
    minGapMs: 180,
    maxGapMs: 680,
    revealDifficultyGrowth: 0.032,
    responseTargetMs: 760,
    responseInfluence: 0.32,
    responseSmoothing: 0.28,
    missRecoveryFactor: 0.055,
    maxMissRecovery: 0.2,
    hamsterRiseDuration: 0.24,
    hamsterRetreatDuration: 0.18,
    hamsterHiddenY: 96,
    hamsterSize: 166,
    hamsterOffsetX: 0,
    hamsterOffsetY: -5,
    hamsterClipHalfWidth: 126,
    hamsterClipTopOffset: 178,
    hamsterClipBottomOffset: 14,
    hitHalfWidth: 138,
    hitTopOffset: 178,
    hitBottomOffset: 58,
    hammerFollowDuration: 0.24,
    hammerFollowEase: "power3.out",
    hammerTouchTravelDuration: 0.13,
    hammerHotspotX: 0.28,
    hammerHotspotY: 0.36,
    hammerWindupAngle: 11,
    hammerImpactAngle: -26,
    hammerReboundAngle: -7,
    hammerWindupDuration: 0.075,
    hammerImpactDuration: 0.095,
    hammerReboundDuration: 0.16,
    hammerSettleDuration: 0.12,
    lightFlashInDuration: 0.12,
    lightFlashOutDuration: 0.17,
    profileFlipDuration: 0.58,
    galleryLerp: 0.095,
    galleryWheelMultiplier: 1.15,
    galleryTouchMultiplier: 1.1,
    galleryScrollDuration: 0.85,
} as const;

const SVG_WIDTH = 700;
const SVG_HEIGHT = 900;
const STORAGE_KEY = "members-arcade-unlocked-v1";

const HOLE_POSITIONS = [
    { x: 205, y: 515 },
    { x: 495, y: 515 },
    { x: 205, y: 660 },
    { x: 495, y: 660 },
    { x: 205, y: 805 },
    { x: 495, y: 805 },
] as const;

const LIGHT_POSITIONS = [
    { x: 67, y: 72 },
    { x: 67, y: 124 },
    { x: 67, y: 176 },
    { x: 67, y: 228 },
    { x: 633, y: 72 },
    { x: 633, y: 124 },
    { x: 633, y: 176 },
    { x: 633, y: 228 },
] as const;

const arcadeRoot = ref<HTMLElement>();
const gameStage = ref<HTMLElement>();
const hammer = ref<HTMLImageElement>();
const profileFlipper = ref<HTMLElement>();
const galleryTrack = ref<HTMLElement>();
const galleryContent = ref<HTMLElement>();
const hamsterElements: Array<SVGGraphicsElement | undefined> = [];
const lightElements: Array<SVGGElement | undefined> = [];

const gamePhase = ref<GamePhase>("ready");
const unlockedIds = ref<string[]>([]);
const selectedMemberId = ref<string | null>(null);
const frontMemberId = ref<string | null>(null);
const backMemberId = ref<string | null>(null);
const visibleProfileFace = ref<"front" | "back">("front");
const activeHole = ref<number | null>(null);
const activeMemberId = ref<string | null>(null);
const liveMessage = ref("Select READY to begin the members game.");
const reducedMotion = ref(false);
const isSwinging = ref(false);
const failedAnimalIds = ref<string[]>([]);
const canScrollGalleryLeft = ref(false);
const canScrollGalleryRight = ref(false);

const unlockedSet = computed(() => new Set(unlockedIds.value));
const failedAnimalSet = computed(() => new Set(failedAnimalIds.value));
const revealedCount = computed(() => unlockedIds.value.length);
const revealCounter = computed(
    () => `${revealedCount.value}/${members.length}`,
);
const frontMember = computed(() =>
    members.find((member) => member.id === frontMemberId.value),
);
const backMember = computed(() =>
    members.find((member) => member.id === backMemberId.value),
);
const marqueeLabel = computed(() => {
    if (gamePhase.value === "complete") return "CLEAR!";
    if (gamePhase.value === "restart-confirm") return "RESTART?";
    if (gamePhase.value === "running") return "GO";
    return "READY";
});
const startControlLabel = computed(() => {
    if (gamePhase.value === "complete") return "Clear game; select to restart";
    if (gamePhase.value === "restart-confirm")
        return "Confirm restart and clear revealed members";
    if (gamePhase.value === "running") return "Game in progress";
    return "Start game";
});
const startControlEnabled = computed(() => gamePhase.value !== "running");

let spawnTimer: ReturnType<typeof setTimeout> | undefined;
let retreatTimer: ReturnType<typeof setTimeout> | undefined;
let spawnStartedAt = 0;
let lastHole = -1;
let consecutiveMisses = 0;
let averageResponseMs: number | null = null;
let hammerXTo: ReturnType<typeof gsap.quickTo> | undefined;
let hammerYTo: ReturnType<typeof gsap.quickTo> | undefined;
let hammerSwingTimeline: gsap.core.Timeline | undefined;
let hamsterTimeline: gsap.core.Timeline | undefined;
let lightTimeline: gsap.core.Timeline | undefined;
let profileFlipTween: gsap.core.Tween | undefined;
let profileRotation = 0;
let profileIsFlipping = false;
let queuedProfileId: string | null | undefined;
let galleryLenis: Lenis | undefined;
let galleryTicker: ((time: number) => void) | undefined;
let motionMedia: gsap.MatchMedia | undefined;
let resizeObserver: ResizeObserver | undefined;

const lastPointerRatio = { x: 0.54, y: 0.58 };

function setHamsterRef(element: unknown, index: number) {
    hamsterElements[index] =
        (element as SVGGraphicsElement | null) ?? undefined;
}

function setLightRef(element: unknown, index: number) {
    lightElements[index] = (element as SVGGElement | null) ?? undefined;
}

function isUnlocked(memberId: string) {
    return unlockedSet.value.has(memberId);
}

function memberInitials(name: string) {
    return name
        .split(/\s+/)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

function handleAnimalError(memberId: string) {
    if (failedAnimalSet.value.has(memberId)) return;
    failedAnimalIds.value = [...failedAnimalIds.value, memberId];
}

function randomItem<T>(items: readonly T[]): T | undefined {
    if (!items.length) return undefined;
    return items[Math.floor(Math.random() * items.length)];
}

function getRemainingMembers() {
    return members.filter((member) => !unlockedSet.value.has(member.id));
}

function getDifficultyTiming() {
    const progression =
        1 + revealedCount.value * GAME_TUNING.revealDifficultyGrowth;
    const responseBoost = averageResponseMs
        ? gsap.utils.clamp(
              -0.12,
              GAME_TUNING.responseInfluence,
              ((GAME_TUNING.responseTargetMs - averageResponseMs) /
                  GAME_TUNING.responseTargetMs) *
                  GAME_TUNING.responseInfluence,
          )
        : 0;
    const missRecovery = Math.min(
        GAME_TUNING.maxMissRecovery,
        consecutiveMisses * GAME_TUNING.missRecoveryFactor,
    );
    const speed = Math.max(0.78, progression + responseBoost - missRecovery);

    return {
        visibleMs: gsap.utils.clamp(
            GAME_TUNING.minVisibleMs,
            GAME_TUNING.maxVisibleMs,
            GAME_TUNING.baseVisibleMs / speed,
        ),
        gapMs: gsap.utils.clamp(
            GAME_TUNING.minGapMs,
            GAME_TUNING.maxGapMs,
            GAME_TUNING.baseGapMs / speed,
        ),
    };
}

function clearGameTimers() {
    if (spawnTimer) clearTimeout(spawnTimer);
    if (retreatTimer) clearTimeout(retreatTimer);
    spawnTimer = undefined;
    retreatTimer = undefined;
}

function saveUnlocks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(unlockedIds.value));
}

function restoreUnlocks() {
    try {
        const stored = JSON.parse(
            localStorage.getItem(STORAGE_KEY) ?? "[]",
        ) as unknown;
        if (!Array.isArray(stored)) return;

        const validIds = new Set(members.map((member) => member.id));
        unlockedIds.value = [
            ...new Set(
                stored.filter(
                    (item): item is string =>
                        typeof item === "string" && validIds.has(item),
                ),
            ),
        ];
        if (unlockedIds.value.length === members.length) {
            gamePhase.value = "complete";
            liveMessage.value = "All member characters have been revealed.";
        }
    } catch {
        localStorage.removeItem(STORAGE_KEY);
    }
}

function scheduleNextSpawn(delayMs: number) {
    if (spawnTimer) clearTimeout(spawnTimer);
    spawnTimer = setTimeout(() => spawnHamster(), delayMs);
}

function chooseNextHole() {
    const available = HOLE_POSITIONS.map((_, index) => index).filter(
        (index) => index !== lastHole,
    );
    return randomItem(available) ?? 0;
}

function finishHamsterTurn(holeIndex: number) {
    if (activeHole.value !== holeIndex) return;
    activeHole.value = null;
    activeMemberId.value = null;

    if (revealedCount.value >= members.length) {
        gamePhase.value = "complete";
        clearGameTimers();
        liveMessage.value = "Collection complete. All members are revealed.";
        return;
    }

    if (gamePhase.value === "running") {
        scheduleNextSpawn(getDifficultyTiming().gapMs);
    }
}

function retreatHamster() {
    const holeIndex = activeHole.value;
    if (holeIndex === null) return;

    if (retreatTimer) clearTimeout(retreatTimer);
    retreatTimer = undefined;
    consecutiveMisses += 1;

    const hamsterElement = hamsterElements[holeIndex];
    if (!hamsterElement) {
        finishHamsterTurn(holeIndex);
        return;
    }

    hamsterTimeline?.kill();
    hamsterTimeline = gsap.timeline({
        onComplete: () => finishHamsterTurn(holeIndex),
    });
    hamsterTimeline.to(hamsterElement, {
        y: GAME_TUNING.hamsterHiddenY,
        scaleX: 0.9,
        scaleY: 0.82,
        autoAlpha: 0,
        duration: reducedMotion.value
            ? 0.01
            : GAME_TUNING.hamsterRetreatDuration,
        ease: "power2.in",
    });
}

function spawnHamster() {
    if (gamePhase.value !== "running" || activeHole.value !== null) return;

    const remainingMembers = getRemainingMembers();
    const member = randomItem(remainingMembers);
    if (!member) {
        gamePhase.value = "complete";
        liveMessage.value = "Collection complete. All members are revealed.";
        return;
    }

    const holeIndex = chooseNextHole();
    const hamsterElement = hamsterElements[holeIndex];
    if (!hamsterElement) return;

    lastHole = holeIndex;
    activeHole.value = holeIndex;
    activeMemberId.value = member.id;
    spawnStartedAt = performance.now();

    hamsterTimeline?.kill();
    gsap.set(hamsterElement, {
        x: 0,
        y: GAME_TUNING.hamsterHiddenY,
        rotation: 0,
        scaleX: 0.78,
        scaleY: 0.62,
        autoAlpha: 1,
        transformOrigin: "50% 100%",
    });
    hamsterTimeline = gsap.timeline();
    hamsterTimeline.to(hamsterElement, {
        y: 0,
        scaleX: 1,
        scaleY: 1,
        duration: reducedMotion.value ? 0.01 : GAME_TUNING.hamsterRiseDuration,
        ease: reducedMotion.value ? "none" : "back.out(1.7)",
    });

    retreatTimer = setTimeout(
        () => retreatHamster(),
        getDifficultyTiming().visibleMs,
    );
}

function startGame() {
    if (gamePhase.value === "complete") {
        gamePhase.value = "restart-confirm";
        liveMessage.value =
            "Select RESTART again to clear the collection and play again.";
        return;
    }

    if (gamePhase.value === "restart-confirm") {
        restartGame();
        return;
    }

    if (gamePhase.value !== "ready") return;

    gamePhase.value = "running";
    liveMessage.value =
        "Game started. Move the hammer and strike the visible hamster.";
    scheduleNextSpawn(GAME_TUNING.firstSpawnDelayMs);
}

function restartGame() {
    clearGameTimers();
    hamsterTimeline?.kill();
    activeHole.value = null;
    activeMemberId.value = null;
    unlockedIds.value = [];
    selectedMemberId.value = null;
    frontMemberId.value = null;
    backMemberId.value = null;
    failedAnimalIds.value = [];
    averageResponseMs = null;
    consecutiveMisses = 0;
    lastHole = -1;
    localStorage.removeItem(STORAGE_KEY);

    const hamsters = hamsterElements.filter(
        (element): element is SVGGraphicsElement => Boolean(element),
    );
    gsap.set(hamsters, {
        x: 0,
        y: GAME_TUNING.hamsterHiddenY,
        rotation: 0,
        autoAlpha: 0,
    });
    profileFlipTween?.kill();
    profileRotation = 0;
    profileIsFlipping = false;
    queuedProfileId = undefined;
    visibleProfileFace.value = "front";
    if (profileFlipper.value) gsap.set(profileFlipper.value, { rotationY: 0 });

    gamePhase.value = "running";
    liveMessage.value = "Collection cleared. A new game has started.";
    scheduleNextSpawn(GAME_TUNING.firstSpawnDelayMs);
}

function flashLights() {
    const lights = lightElements.filter((element): element is SVGGElement =>
        Boolean(element),
    );
    if (!lights.length) return;

    lightTimeline?.kill();
    lightTimeline = gsap.timeline();
    for (let flash = 0; flash < 2; flash += 1) {
        lightTimeline
            .to(lights, {
                opacity: 0.28,
                duration: GAME_TUNING.lightFlashInDuration,
                ease: "power2.in",
            })
            .to(lights, {
                opacity: 1,
                duration: GAME_TUNING.lightFlashOutDuration,
                ease: "sine.inOut",
            });
    }
}

function memberById(memberId: string | null) {
    if (!memberId) return undefined;
    return members.find((member) => member.id === memberId);
}

async function showProfile(memberId: string | null) {
    if (profileIsFlipping) {
        queuedProfileId = memberId;
        return;
    }

    selectedMemberId.value = memberId;
    const hiddenFace = visibleProfileFace.value === "front" ? "back" : "front";
    if (hiddenFace === "front") frontMemberId.value = memberId;
    else backMemberId.value = memberId;
    await nextTick();

    if (!profileFlipper.value || reducedMotion.value) {
        visibleProfileFace.value = hiddenFace;
        profileRotation += 180;
        if (profileFlipper.value) {
            gsap.set(profileFlipper.value, { rotationY: profileRotation });
        }
        return;
    }

    profileIsFlipping = true;
    profileFlipTween?.kill();
    profileRotation += 180;
    profileFlipTween = gsap.to(profileFlipper.value, {
        rotationY: profileRotation,
        duration: GAME_TUNING.profileFlipDuration,
        ease: "power3.inOut",
        overwrite: "auto",
        onComplete: () => {
            visibleProfileFace.value = hiddenFace;
            profileIsFlipping = false;
            if (queuedProfileId !== undefined) {
                const queued = queuedProfileId;
                queuedProfileId = undefined;
                void showProfile(queued);
            }
        },
    });
}

function updateGalleryEdges() {
    const track = galleryTrack.value;
    if (!track) return;
    const current = galleryLenis?.animatedScroll ?? track.scrollLeft;
    const limit = galleryLenis?.limit ?? track.scrollWidth - track.clientWidth;
    canScrollGalleryLeft.value = current > 2;
    canScrollGalleryRight.value = limit - current > 2;
}

async function revealMember(memberId: string) {
    if (!unlockedSet.value.has(memberId)) {
        unlockedIds.value = [...unlockedIds.value, memberId];
        saveUnlocks();
    }
    void showProfile(memberId);
    await nextTick();
    const track = galleryTrack.value;
    const item = track?.querySelector<HTMLElement>(
        `[data-member-id="${memberId}"]`,
    );
    if (track && item) {
        const target =
            item.offsetLeft - track.clientWidth / 2 + item.clientWidth / 2;
        if (galleryLenis) {
            galleryLenis.scrollTo(target, {
                immediate: reducedMotion.value,
                duration: GAME_TUNING.galleryScrollDuration,
            });
        } else {
            track.scrollTo({ left: target, behavior: "auto" });
        }
    }
}

function hitActiveHamster() {
    const holeIndex = activeHole.value;
    const memberId = activeMemberId.value;
    if (holeIndex === null || !memberId) return;

    if (retreatTimer) clearTimeout(retreatTimer);
    retreatTimer = undefined;

    const responseMs = performance.now() - spawnStartedAt;
    averageResponseMs =
        averageResponseMs === null
            ? responseMs
            : gsap.utils.interpolate(
                  averageResponseMs,
                  responseMs,
                  GAME_TUNING.responseSmoothing,
              );
    consecutiveMisses = 0;

    const member = members.find((item) => item.id === memberId);
    void revealMember(memberId);
    flashLights();
    liveMessage.value = member
        ? `${member.englishName} revealed. ${revealedCount.value} of ${members.length} members found.`
        : `${revealedCount.value} of ${members.length} members found.`;

    const hamsterElement = hamsterElements[holeIndex];
    if (!hamsterElement) {
        finishHamsterTurn(holeIndex);
        return;
    }

    hamsterTimeline?.kill();
    if (reducedMotion.value) {
        gsap.set(hamsterElement, {
            y: GAME_TUNING.hamsterHiddenY,
            autoAlpha: 0,
        });
        finishHamsterTurn(holeIndex);
        return;
    }

    hamsterTimeline = gsap.timeline({
        defaults: { ease: "power2.out" },
        onComplete: () => finishHamsterTurn(holeIndex),
    });
    hamsterTimeline
        .to(hamsterElement, {
            y: 10,
            scaleX: 1.24,
            scaleY: 0.68,
            rotation: -6,
            duration: 0.075,
        })
        .to(hamsterElement, {
            x: -8,
            rotation: 7,
            duration: 0.06,
        })
        .to(hamsterElement, {
            x: 8,
            rotation: -5,
            duration: 0.055,
        })
        .to(hamsterElement, {
            x: 0,
            y: GAME_TUNING.hamsterHiddenY,
            rotation: 0,
            scaleX: 0.88,
            scaleY: 0.82,
            autoAlpha: 0,
            duration: 0.17,
            ease: "power3.in",
        });
}

function resolveStrike(point: Point) {
    const holeIndex = activeHole.value;
    if (holeIndex === null) return;

    const hole = HOLE_POSITIONS[holeIndex];
    const insideHitArea =
        Math.abs(point.x - hole.x) <= GAME_TUNING.hitHalfWidth &&
        point.y >= hole.y - GAME_TUNING.hitTopOffset &&
        point.y <= hole.y + GAME_TUNING.hitBottomOffset;

    if (insideHitArea) hitActiveHamster();
}

function playHammerSwing(point: Point) {
    if (!hammer.value || isSwinging.value) return;

    if (reducedMotion.value) {
        resolveStrike(point);
        return;
    }

    isSwinging.value = true;
    hammerSwingTimeline?.kill();
    hammerSwingTimeline = gsap.timeline({
        defaults: { overwrite: "auto" },
        onComplete: () => {
            isSwinging.value = false;
        },
    });
    hammerSwingTimeline
        .addLabel("windup")
        .to(
            hammer.value,
            {
                rotation: GAME_TUNING.hammerWindupAngle,
                scale: 1.035,
                duration: GAME_TUNING.hammerWindupDuration,
                ease: "power2.out",
            },
            "windup",
        )
        .addLabel("impact")
        .to(
            hammer.value,
            {
                rotation: GAME_TUNING.hammerImpactAngle,
                scaleX: 1.02,
                scaleY: 0.965,
                duration: GAME_TUNING.hammerImpactDuration,
                ease: "power4.in",
            },
            "impact",
        )
        .call(() => resolveStrike(point), [], "impact+=0.07")
        .to(hammer.value, {
            rotation: GAME_TUNING.hammerReboundAngle,
            scaleX: 0.985,
            scaleY: 1.025,
            duration: GAME_TUNING.hammerReboundDuration,
            ease: "back.out(2.2)",
        })
        .to(hammer.value, {
            rotation: 0,
            scale: 1,
            duration: GAME_TUNING.hammerSettleDuration,
            ease: "sine.out",
        });
}

function getHammerTarget(clientX: number, clientY: number) {
    if (!gameStage.value || !hammer.value) return null;

    const stageRect = gameStage.value.getBoundingClientRect();
    const hammerWidth = hammer.value.offsetWidth;
    const hammerHeight = hammer.value.offsetHeight;
    const localX = gsap.utils.clamp(
        0,
        stageRect.width,
        clientX - stageRect.left,
    );
    const localY = gsap.utils.clamp(
        0,
        stageRect.height,
        clientY - stageRect.top,
    );

    lastPointerRatio.x = stageRect.width ? localX / stageRect.width : 0.5;
    lastPointerRatio.y = stageRect.height ? localY / stageRect.height : 0.5;

    return {
        x: gsap.utils.clamp(
            0,
            Math.max(0, stageRect.width - hammerWidth),
            localX - hammerWidth * GAME_TUNING.hammerHotspotX,
        ),
        y: gsap.utils.clamp(
            0,
            Math.max(0, stageRect.height - hammerHeight),
            localY - hammerHeight * GAME_TUNING.hammerHotspotY,
        ),
    };
}

function moveHammer(clientX: number, clientY: number, immediate = false) {
    if (!hammer.value) return;
    const target = getHammerTarget(clientX, clientY);
    if (!target) return;

    if (immediate || reducedMotion.value || !hammerXTo || !hammerYTo) {
        gsap.set(hammer.value, { x: target.x, y: target.y });
        return;
    }

    hammerXTo(target.x);
    hammerYTo(target.y);
}

function clientPointToSvg(clientX: number, clientY: number): Point {
    const rect = gameStage.value?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
        x: ((clientX - rect.left) / rect.width) * SVG_WIDTH,
        y: ((clientY - rect.top) / rect.height) * SVG_HEIGHT,
    };
}

function handlePointerMove(event: PointerEvent) {
    if (event.pointerType === "touch") return;
    if (
        event.target instanceof Element &&
        event.target.closest("[data-start-control]")
    ) {
        return;
    }
    moveHammer(event.clientX, event.clientY);
}

function handleGamePointerDown(event: PointerEvent) {
    const target = event.target;
    if (target instanceof Element && target.closest("[data-start-control]")) {
        return;
    }
    if (gamePhase.value !== "running") return;

    const svgPoint = clientPointToSvg(event.clientX, event.clientY);
    if (event.pointerType === "touch") {
        const hammerTarget = getHammerTarget(event.clientX, event.clientY);
        if (!hammerTarget || !hammer.value) return;
        gsap.to(hammer.value, {
            x: hammerTarget.x,
            y: hammerTarget.y,
            duration: reducedMotion.value
                ? 0.01
                : GAME_TUNING.hammerTouchTravelDuration,
            ease: "power3.out",
            overwrite: "auto",
            onComplete: () => playHammerSwing(svgPoint),
        });
        return;
    }

    moveHammer(event.clientX, event.clientY);
    playHammerSwing(svgPoint);
}

function strikeHole(holeIndex: number) {
    if (gamePhase.value !== "running" || !gameStage.value || !hammer.value)
        return;

    const hole = HOLE_POSITIONS[holeIndex];
    const rect = gameStage.value.getBoundingClientRect();
    const clientX = rect.left + (hole.x / SVG_WIDTH) * rect.width;
    const clientY = rect.top + ((hole.y - 54) / SVG_HEIGHT) * rect.height;
    const target = getHammerTarget(clientX, clientY);
    if (!target) return;

    gsap.to(hammer.value, {
        x: target.x,
        y: target.y,
        duration: reducedMotion.value
            ? 0.01
            : GAME_TUNING.hammerTouchTravelDuration,
        ease: "power3.out",
        overwrite: "auto",
        onComplete: () => playHammerSwing({ x: hole.x, y: hole.y - 54 }),
    });
}

function selectMember(memberId: string) {
    const nextMemberId = selectedMemberId.value === memberId ? null : memberId;
    void showProfile(nextMemberId);
    const member = members.find((item) => item.id === memberId);
    if (member) {
        liveMessage.value = nextMemberId
            ? `${member.englishName} selected${isUnlocked(memberId) ? "" : "; animal character locked"}.`
            : `${member.englishName} profile closed.`;
    }
}

function scrollGallery(direction: -1 | 1) {
    const track = galleryTrack.value;
    if (!track) return;
    const current = galleryLenis?.animatedScroll ?? track.scrollLeft;
    const target =
        current + direction * Math.max(220, track.clientWidth * 0.72);
    if (galleryLenis) {
        galleryLenis.scrollTo(target, {
            immediate: reducedMotion.value,
            duration: GAME_TUNING.galleryScrollDuration,
        });
    } else {
        track.scrollTo({ left: target, behavior: "auto" });
    }
}

function repositionHammer() {
    if (!gameStage.value) return;
    const rect = gameStage.value.getBoundingClientRect();
    moveHammer(
        rect.left + rect.width * lastPointerRatio.x,
        rect.top + rect.height * lastPointerRatio.y,
        true,
    );
}

onMounted(async () => {
    restoreUnlocks();
    await nextTick();
    if (!arcadeRoot.value || !gameStage.value || !hammer.value) return;

    motionMedia = gsap.matchMedia();
    motionMedia.add(
        { reduceMotion: "(prefers-reduced-motion: reduce)" },
        (context) => {
            reducedMotion.value = Boolean(context.conditions?.reduceMotion);
        },
        arcadeRoot.value,
    );

    gsap.set(
        hamsterElements.filter((element): element is SVGGraphicsElement =>
            Boolean(element),
        ),
        {
            y: GAME_TUNING.hamsterHiddenY,
            autoAlpha: 0,
            transformOrigin: "50% 100%",
        },
    );
    gsap.set(hammer.value, {
        autoAlpha: 1,
        rotation: 0,
        transformOrigin: "87% 88%",
    });
    repositionHammer();

    hammerXTo = gsap.quickTo(hammer.value, "x", {
        duration: GAME_TUNING.hammerFollowDuration,
        ease: GAME_TUNING.hammerFollowEase,
    });
    hammerYTo = gsap.quickTo(hammer.value, "y", {
        duration: GAME_TUNING.hammerFollowDuration,
        ease: GAME_TUNING.hammerFollowEase,
    });

    resizeObserver = new ResizeObserver(() => repositionHammer());
    resizeObserver.observe(gameStage.value);

    if (galleryTrack.value && galleryContent.value) {
        galleryLenis = new Lenis({
            wrapper: galleryTrack.value,
            content: galleryContent.value,
            orientation: "horizontal",
            gestureOrientation: "both",
            smoothWheel: true,
            syncTouch: true,
            lerp: GAME_TUNING.galleryLerp,
            wheelMultiplier: GAME_TUNING.galleryWheelMultiplier,
            touchMultiplier: GAME_TUNING.galleryTouchMultiplier,
            autoRaf: false,
        });
        galleryLenis.on("scroll", updateGalleryEdges);
        galleryTicker = (time: number) => galleryLenis?.raf(time * 1000);
        gsap.ticker.add(galleryTicker);
        resizeObserver.observe(galleryTrack.value);
        resizeObserver.observe(galleryContent.value);
        requestAnimationFrame(updateGalleryEdges);
    }
});

onBeforeUnmount(() => {
    clearGameTimers();
    resizeObserver?.disconnect();
    if (galleryTicker) gsap.ticker.remove(galleryTicker);
    galleryLenis?.destroy();
    motionMedia?.revert();
    hammerXTo?.tween.kill();
    hammerYTo?.tween.kill();
    hammerSwingTimeline?.kill();
    hamsterTimeline?.kill();
    lightTimeline?.kill();
    profileFlipTween?.kill();
});
</script>

<template>
    <section
        ref="arcadeRoot"
        class="members-arcade"
        aria-labelledby="members-arcade-title"
    >
        <h1 id="members-arcade-title" class="sr-only">Meet our members</h1>

        <div class="arcade-layout">
            <div
                ref="gameStage"
                class="game-stage"
                :class="{ 'is-running': gamePhase === 'running' }"
                @pointermove="handlePointerMove"
                @pointerdown="handleGamePointerDown"
            >
                <svg
                    class="machine-svg"
                    viewBox="0 0 700 900"
                    role="group"
                    aria-labelledby="machine-title machine-description"
                >
                    <title id="machine-title">Members reveal game</title>
                    <desc id="machine-description">
                        Select READY, then strike the hamster when it appears in
                        one of six holes to reveal a member character.
                    </desc>

                    <defs>
                        <linearGradient
                            id="machine-body-gradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >
                            <stop
                                offset="0"
                                stop-color="var(--machine-shell-top)"
                            />
                            <stop
                                offset="1"
                                stop-color="var(--machine-shell-bottom)"
                            />
                        </linearGradient>
                        <linearGradient
                            id="playfield-gradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >
                            <stop
                                offset="0"
                                stop-color="var(--playfield-top)"
                            />
                            <stop
                                offset="1"
                                stop-color="var(--playfield-bottom)"
                            />
                        </linearGradient>
                        <linearGradient
                            id="hole-gradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >
                            <stop offset="0" stop-color="#d57924" />
                            <stop offset="0.6" stop-color="#ffa641" />
                            <stop offset="1" stop-color="#ffd05b" />
                        </linearGradient>
                        <filter
                            id="lamp-glow"
                            x="-160%"
                            y="-160%"
                            width="420%"
                            height="420%"
                            color-interpolation-filters="sRGB"
                        >
                            <feGaussianBlur
                                in="SourceAlpha"
                                stdDeviation="8"
                                result="blur"
                            />
                            <feFlood
                                flood-color="#ffe58a"
                                flood-opacity="0.95"
                                result="glow-color"
                            />
                            <feComposite
                                in="glow-color"
                                in2="blur"
                                operator="in"
                                result="soft-glow"
                            />
                            <feMerge>
                                <feMergeNode in="soft-glow" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                        <filter
                            id="screen-soft-glow"
                            x="-20%"
                            y="-80%"
                            width="140%"
                            height="260%"
                        >
                            <feGaussianBlur
                                in="SourceGraphic"
                                stdDeviation="3"
                                result="soft"
                            />
                            <feMerge>
                                <feMergeNode in="soft" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                        <clipPath
                            v-for="(hole, index) in HOLE_POSITIONS"
                            :id="`hamster-clip-${index}`"
                            :key="`clip-${index}`"
                        >
                            <rect
                                :x="hole.x - GAME_TUNING.hamsterClipHalfWidth"
                                :y="hole.y - GAME_TUNING.hamsterClipTopOffset"
                                :width="GAME_TUNING.hamsterClipHalfWidth * 2"
                                :height="
                                    GAME_TUNING.hamsterClipTopOffset +
                                    GAME_TUNING.hamsterClipBottomOffset
                                "
                                rx="22"
                            />
                        </clipPath>
                    </defs>

                    <rect
                        x="9"
                        y="8"
                        width="682"
                        height="884"
                        rx="48"
                        fill="url(#machine-body-gradient)"
                        stroke="var(--machine-edge)"
                        stroke-width="3"
                    />
                    <rect
                        class="machine-rim"
                        x="30"
                        y="25"
                        width="640"
                        height="850"
                        rx="38"
                        fill="var(--machine-rim)"
                    />

                    <g
                        class="start-control"
                        :class="`is-${gamePhase}`"
                        data-start-control
                        role="button"
                        :tabindex="startControlEnabled ? 0 : -1"
                        :aria-label="startControlLabel"
                        :aria-disabled="!startControlEnabled"
                        @click.stop="startGame"
                        @keydown.enter.stop.prevent="startGame"
                        @keydown.space.stop.prevent="startGame"
                    >
                        <rect
                            class="marquee-panel"
                            x="43"
                            y="35"
                            width="614"
                            height="224"
                            rx="37"
                            fill="#0f4296"
                            stroke="transparent"
                            stroke-width="7"
                        />
                        <rect
                            class="marquee-action"
                            x="158"
                            y="78"
                            width="384"
                            height="128"
                            rx="28"
                        />
                        <text
                            x="350"
                            y="158"
                            class="marquee-text"
                            text-anchor="middle"
                        >
                            {{ marqueeLabel }}
                        </text>
                        <text
                            v-if="gamePhase === 'ready'"
                            x="350"
                            y="188"
                            class="marquee-hint"
                            text-anchor="middle"
                        >
                            PRESS TO START
                        </text>
                    </g>

                    <g
                        v-for="(light, index) in LIGHT_POSITIONS"
                        :key="`light-${index}`"
                        :ref="(element) => setLightRef(element, index)"
                        class="machine-light"
                    >
                        <circle
                            class="light-halo"
                            :cx="light.x"
                            :cy="light.y"
                            r="22"
                            fill="#ffdd69"
                            filter="url(#lamp-glow)"
                        />
                        <circle
                            :cx="light.x"
                            :cy="light.y"
                            r="18"
                            fill="#ffdc68"
                        />
                        <circle
                            :cx="light.x - 5"
                            :cy="light.y - 6"
                            r="5"
                            fill="#fff4bf"
                            opacity="0.9"
                        />
                    </g>

                    <rect
                        x="43"
                        y="278"
                        width="614"
                        height="588"
                        rx="40"
                        fill="url(#playfield-gradient)"
                    />
                    <rect
                        x="179"
                        y="311"
                        width="342"
                        height="77"
                        rx="8"
                        fill="#0d3999"
                        stroke="#2655bd"
                        stroke-width="3"
                    />
                    <text
                        x="350"
                        y="366"
                        class="counter-text"
                        text-anchor="middle"
                        filter="url(#screen-soft-glow)"
                    >
                        {{ revealCounter }}
                    </text>

                    <g
                        v-for="(hole, index) in HOLE_POSITIONS"
                        :key="`hole-${index}`"
                        class="hole-control"
                        role="button"
                        tabindex="0"
                        :aria-label="`Strike hole ${index + 1}`"
                        @keydown.enter.stop.prevent="strikeHole(index)"
                        @keydown.space.stop.prevent="strikeHole(index)"
                    >
                        <ellipse
                            :cx="hole.x"
                            :cy="hole.y"
                            rx="112"
                            ry="46"
                            fill="url(#hole-gradient)"
                            stroke="#ffd55e"
                            stroke-width="7"
                        />
                        <g :clip-path="`url(#hamster-clip-${index})`">
                            <g
                                :ref="
                                    (element) => setHamsterRef(element, index)
                                "
                                class="hamster-sprite"
                            >
                                <image
                                    :href="hamsterUrl"
                                    :x="
                                        hole.x -
                                        GAME_TUNING.hamsterSize / 2 +
                                        GAME_TUNING.hamsterOffsetX
                                    "
                                    :y="
                                        hole.y -
                                        GAME_TUNING.hamsterSize +
                                        GAME_TUNING.hamsterOffsetY
                                    "
                                    :width="GAME_TUNING.hamsterSize"
                                    :height="GAME_TUNING.hamsterSize"
                                    preserveAspectRatio="xMidYMid meet"
                                />
                            </g>
                        </g>
                        <path
                            :d="`M ${hole.x - 105} ${hole.y + 3} Q ${hole.x} ${hole.y + 74} ${hole.x + 105} ${hole.y + 3} Q ${hole.x} ${hole.y + 44} ${hole.x - 105} ${hole.y + 3} Z`"
                            fill="#ffb347"
                            opacity="0.96"
                        />
                        <rect
                            class="hole-focus"
                            :x="hole.x - 120"
                            :y="hole.y - 138"
                            width="240"
                            height="192"
                            rx="42"
                            fill="transparent"
                            stroke="#ffffff"
                            stroke-width="5"
                        />
                    </g>
                </svg>

                <img
                    ref="hammer"
                    :src="hammerUrl"
                    alt=""
                    class="hammer"
                    aria-hidden="true"
                    draggable="false"
                />

                <output class="sr-only" aria-live="polite">
                    {{ revealCounter }} members revealed.
                </output>
                <p class="sr-only" aria-live="polite">{{ liveMessage }}</p>
            </div>

            <div class="members-showcase">
                <div class="profile-stage">
                    <div ref="profileFlipper" class="profile-flipper">
                        <div class="profile-face profile-front">
                            <MemberProfileCard
                                :member="frontMember"
                                :unlocked="
                                    Boolean(
                                        frontMember &&
                                        isUnlocked(frontMember.id),
                                    )
                                "
                                :animal-failed="
                                    Boolean(
                                        frontMember &&
                                        failedAnimalSet.has(frontMember.id),
                                    )
                                "
                                @animal-error="handleAnimalError"
                            />
                        </div>
                        <div class="profile-face profile-back">
                            <MemberProfileCard
                                :member="backMember"
                                :unlocked="
                                    Boolean(
                                        backMember && isUnlocked(backMember.id),
                                    )
                                "
                                :animal-failed="
                                    Boolean(
                                        backMember &&
                                        failedAnimalSet.has(backMember.id),
                                    )
                                "
                                @animal-error="handleAnimalError"
                            />
                        </div>
                    </div>
                </div>

                <section
                    class="collection-panel"
                    aria-labelledby="collection-title"
                >
                    <div class="collection-heading">
                        <h2 id="collection-title">Animal collection</h2>
                        <span>{{ revealCounter }}</span>
                    </div>

                    <button
                        type="button"
                        class="gallery-arrow gallery-arrow-left"
                        :class="{ 'is-visible': canScrollGalleryLeft }"
                        :disabled="!canScrollGalleryLeft"
                        aria-label="Scroll collection left"
                        @click="scrollGallery(-1)"
                    >
                        <span aria-hidden="true">‹</span>
                    </button>

                    <div
                        class="gallery-viewport"
                        :class="{
                            'can-scroll-left': canScrollGalleryLeft,
                            'can-scroll-right': canScrollGalleryRight,
                        }"
                    >
                        <div
                            ref="galleryTrack"
                            class="gallery-track"
                            tabindex="0"
                            aria-label="Member animal collection"
                        >
                            <div ref="galleryContent" class="gallery-content">
                                <button
                                    v-for="member in members"
                                    :key="member.id"
                                    type="button"
                                    class="member-token"
                                    :class="{
                                        'is-unlocked': isUnlocked(member.id),
                                        'is-selected':
                                            selectedMemberId === member.id,
                                    }"
                                    :data-member-id="member.id"
                                    :aria-label="`${member.englishName}, ${isUnlocked(member.id) ? 'revealed' : 'animal character locked'}`"
                                    :aria-pressed="
                                        selectedMemberId === member.id
                                    "
                                    @click="selectMember(member.id)"
                                >
                                    <span class="token-art">
                                        <img
                                            v-if="
                                                isUnlocked(member.id) &&
                                                !failedAnimalSet.has(member.id)
                                            "
                                            :src="member.animalUrl"
                                            alt=""
                                            @error="
                                                handleAnimalError(member.id)
                                            "
                                        />
                                        <span
                                            v-else-if="isUnlocked(member.id)"
                                            class="token-initials"
                                            aria-hidden="true"
                                        >
                                            {{
                                                memberInitials(
                                                    member.englishName,
                                                )
                                            }}
                                        </span>
                                        <span
                                            v-else
                                            class="token-question"
                                            aria-hidden="true"
                                            >?</span
                                        >
                                    </span>
                                    <span class="token-name">{{
                                        member.englishName
                                    }}</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        class="gallery-arrow gallery-arrow-right"
                        :class="{ 'is-visible': canScrollGalleryRight }"
                        :disabled="!canScrollGalleryRight"
                        aria-label="Scroll collection right"
                        @click="scrollGallery(1)"
                    >
                        <span aria-hidden="true">›</span>
                    </button>
                </section>
            </div>
        </div>
    </section>
</template>

<style scoped>
.members-arcade {
    --arcade-blue: #164b9f;
    --arcade-bright-blue: #4d77f2;
    --arcade-sky: #5bb7e7;
    --arcade-yellow: #ffdc68;
    --arcade-orange: #ffad42;
    --arcade-paper: #fffef9;
    position: relative;
    min-height: calc(100svh - 4rem);
    padding: clamp(5.25rem, 8vh, 7rem) clamp(1rem, 2.5vw, 3rem)
        clamp(1.5rem, 4vh, 3rem);
    color: #082e68;
}

.arcade-layout {
    display: grid;
    grid-template-columns: minmax(20rem, 0.82fr) minmax(32rem, 1.18fr);
    gap: clamp(1.25rem, 3vw, 3.75rem);
    align-items: center;
    width: min(100%, 118rem);
    min-height: calc(100svh - 10rem);
    margin-inline: auto;
}

.game-stage {
    position: relative;
    isolation: isolate;
    width: min(100%, 44rem);
    aspect-ratio: 7 / 9;
    justify-self: center;
    overflow: hidden;
    border-radius: 6.8%;
    filter: drop-shadow(0 1.35rem 1.6rem rgb(2 27 66 / 0.32));
    touch-action: manipulation;
    user-select: none;
}

.machine-svg {
    display: block;
    width: 100%;
    height: 100%;
}

.machine-rim {
    stroke: rgb(255 255 255 / 0.18);
    stroke-width: 2;
}

.start-control {
    outline: none;
}

.start-control[aria-disabled="false"] {
    cursor: pointer;
}

.start-control:focus-visible .marquee-panel {
    stroke: #ffffff;
}

.marquee-text,
.counter-text {
    fill: #fffef1;
    font-family: "Righteous", sans-serif;
    letter-spacing: 0.035em;
}

.marquee-text {
    font-size: 82px;
}

.counter-text {
    font-size: 55px;
}

.machine-light {
    transform-box: fill-box;
    transform-origin: center;
}

.light-halo {
    animation: lamp-breathe 2.6s ease-in-out infinite alternate;
}

.machine-light:nth-of-type(2n) .light-halo {
    animation-delay: -1.3s;
}

.hole-control {
    outline: none;
}

.hole-focus {
    opacity: 0;
    pointer-events: none;
}

.hole-control:focus-visible .hole-focus {
    opacity: 0.95;
}

.hamster-sprite {
    visibility: hidden;
    opacity: 0;
    transform-box: fill-box;
    transform-origin: 50% 100%;
}

.hammer {
    position: absolute;
    z-index: 5;
    top: 0;
    left: 0;
    width: clamp(7rem, 25%, 12.5rem);
    height: auto;
    opacity: 0;
    pointer-events: none;
    will-change: transform;
    transform-origin: 87% 88%;
    filter: drop-shadow(0 0.65rem 0.48rem rgb(2 29 77 / 0.28));
}

@media (pointer: fine) {
    .game-stage.is-running,
    .game-stage.is-running * {
        cursor: none !important;
    }
}

.members-showcase {
    display: grid;
    min-width: 0;
    gap: clamp(1rem, 2.2vw, 2rem);
}

.profile-card {
    display: grid;
    grid-template-columns: minmax(12rem, 0.38fr) minmax(0, 1fr);
    min-height: clamp(22rem, 42vw, 35rem);
    overflow: hidden;
    border: clamp(0.7rem, 1.2vw, 1.25rem) solid #ffdf83;
    border-radius: clamp(1.5rem, 3vw, 3rem);
    background: #ffdf83;
    box-shadow:
        0.85rem 1rem 0 rgb(35 104 184 / 0.5),
        0 1.4rem 2.2rem rgb(2 30 69 / 0.23);
}

.portrait-column {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: clamp(0.75rem, 1.4vw, 1.3rem);
}

.portrait-frame {
    position: relative;
    min-height: 0;
    overflow: hidden;
    border: 0.65rem solid #3c83d7;
    border-radius: 1.7rem 0.4rem 1.7rem 0.4rem;
    aspect-ratio: 0.78;
    background: #eff8ff;
}

.portrait-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.portrait-corner {
    position: absolute;
    z-index: 1;
    width: 3rem;
    height: 3rem;
    border-radius: 0 0 100% 0;
    background: #ffb548;
}

.corner-one {
    top: -0.1rem;
    left: -0.1rem;
}

.corner-two {
    top: -0.1rem;
    right: -0.1rem;
    transform: rotate(90deg);
    background: #3f7fd1;
}

.corner-three {
    right: -0.1rem;
    bottom: -0.1rem;
    transform: rotate(180deg);
    background: #6ec6e6;
}

.member-title {
    min-height: 1.5em;
    margin: 0;
    padding-inline: 0.25rem;
    font-family: "Belanosima", sans-serif;
    font-size: clamp(1rem, 1.4vw, 1.35rem);
    color: #102e58;
}

.profile-sheet {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(10rem, 0.48fr);
    gap: 1rem;
    min-width: 0;
    margin: clamp(0.35rem, 0.7vw, 0.7rem);
    padding: clamp(1.1rem, 2vw, 2rem);
    overflow: hidden;
    background: var(--arcade-paper);
    box-shadow: inset -0.7rem 0.55rem 0.85rem rgb(82 62 18 / 0.1);
}

.profile-copy {
    position: relative;
    z-index: 1;
    min-width: 0;
}

.profile-label {
    width: fit-content;
    margin: 0;
    border-bottom: 0.16rem solid #438ae2;
    font-family: "Belanosima", sans-serif;
    font-size: clamp(1rem, 1.55vw, 1.5rem);
    line-height: 1.15;
    color: #111111;
}

.member-name {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem 0.75rem;
    margin: 0.5rem 0 clamp(1.4rem, 3vw, 3rem);
    font-family: "Righteous", sans-serif;
    font-size: clamp(1.35rem, 2.25vw, 2.4rem);
    line-height: 1.08;
    color: #0c3476;
}

.introduction-label {
    margin-bottom: 0.65rem;
}

.member-introduction {
    min-height: 7rem;
    margin: 0;
    font-size: clamp(0.95rem, 1.2vw, 1.15rem);
    line-height: 1.65;
    color: #203a55;
    white-space: pre-line;
}

.animal-display {
    display: grid;
    min-width: 0;
    place-items: center;
    align-self: end;
}

.animal-image {
    width: min(100%, 21rem);
    max-height: 22rem;
    object-fit: contain;
    filter: drop-shadow(0 0.7rem 0.5rem rgb(4 48 96 / 0.16));
}

.locked-animal {
    display: grid;
    width: min(100%, 17rem);
    aspect-ratio: 1;
    place-items: center;
    border: 0.35rem dashed #2265b6;
    border-radius: 50%;
    background: rgb(92 176 225 / 0.12);
    color: #164b9f;
}

.locked-animal span {
    font-family: "Righteous", sans-serif;
    font-size: clamp(5rem, 9vw, 9rem);
    line-height: 1;
}

.missing-animal {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    border-style: solid;
    background: #e7f4fa;
}

.missing-animal span {
    font-size: clamp(2.5rem, 5vw, 5rem);
}

.missing-animal small {
    font-size: clamp(0.66rem, 0.9vw, 0.82rem);
    text-align: center;
}

.collection-panel {
    position: relative;
    min-width: 0;
    padding: 0.8rem clamp(2.5rem, 4vw, 4rem) 0.65rem;
    border-radius: clamp(1.25rem, 2.5vw, 2.5rem);
    background: #17599f;
    box-shadow: 0 1rem 1.8rem rgb(2 30 69 / 0.22);
}

.collection-heading {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
    padding: 0 0.35rem 0.35rem;
    color: #ffffff;
}

.collection-heading h2 {
    margin: 0;
    font-family: "Righteous", sans-serif;
    font-size: clamp(1rem, 1.5vw, 1.35rem);
    letter-spacing: 0.035em;
}

.collection-heading span {
    font-family: "Righteous", sans-serif;
}

.gallery-track {
    display: flex;
    gap: clamp(0.6rem, 1.25vw, 1.15rem);
    min-width: 0;
    padding: 0.35rem 0 0.55rem;
    overflow-x: auto;
    overscroll-behavior-inline: contain;
    scrollbar-color: #ffffff transparent;
    scrollbar-width: thin;
    scroll-snap-type: x proximity;
}

.gallery-track:focus-visible {
    outline: 0.2rem solid #ffffff;
    outline-offset: 0.2rem;
}

.gallery-track::-webkit-scrollbar {
    height: 0.42rem;
}

.gallery-track::-webkit-scrollbar-thumb {
    border-radius: 99rem;
    background: #ffffff;
}

.gallery-track::-webkit-scrollbar-track {
    background: transparent;
}

.member-token {
    display: grid;
    flex: 0 0 clamp(5.4rem, 8.5vw, 8.25rem);
    gap: 0.35rem;
    align-content: start;
    padding: 0.3rem;
    border: 0;
    border-radius: 1rem;
    background: transparent;
    color: #ffffff;
    scroll-snap-align: center;
}

.member-token:focus-visible {
    outline: 0.2rem solid #ffffff;
    outline-offset: 0.1rem;
}

.token-art {
    display: grid;
    width: 100%;
    aspect-ratio: 1;
    place-items: center;
    overflow: hidden;
    border: 0.18rem dashed rgb(255 255 255 / 0.88);
    border-radius: 50%;
    background: rgb(12 60 132 / 0.28);
    transition:
        transform 180ms ease,
        border-color 180ms ease,
        box-shadow 180ms ease;
}

.member-token.is-unlocked .token-art {
    border-style: solid;
    border-color: transparent;
    background: #9ee6dd;
}

.member-token.is-selected .token-art {
    border-color: #ffdf68;
    box-shadow: 0 0 0 0.22rem rgb(255 223 104 / 0.38);
    transform: translateY(-0.2rem) scale(1.04);
}

.token-art img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.token-question {
    font-family: "Righteous", sans-serif;
    font-size: clamp(2.8rem, 5vw, 5rem);
    line-height: 1;
}

.token-initials {
    font-family: "Righteous", sans-serif;
    font-size: clamp(1.3rem, 2.2vw, 2.2rem);
    color: #0d3a76;
}

.token-name {
    overflow: hidden;
    font-family: "Belanosima", sans-serif;
    font-size: clamp(0.72rem, 0.9vw, 0.9rem);
    line-height: 1.08;
    text-align: center;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.gallery-arrow {
    position: absolute;
    z-index: 2;
    top: 58%;
    display: grid;
    width: 2.25rem;
    height: 2.25rem;
    padding: 0;
    place-items: center;
    border: 0.13rem solid rgb(255 255 255 / 0.82);
    border-radius: 50%;
    background: rgb(13 58 137 / 0.7);
    color: #ffffff;
    transform: translateY(-50%);
}

.gallery-arrow:hover {
    background: #0d3a89;
}

.gallery-arrow:focus-visible {
    outline: 0.2rem solid #ffdf68;
    outline-offset: 0.15rem;
}

.gallery-arrow span {
    margin-top: -0.1em;
    font-family: Arial, sans-serif;
    font-size: 2rem;
    line-height: 1;
}

.gallery-arrow-left {
    left: 0.75rem;
}

.gallery-arrow-right {
    right: 0.75rem;
}

.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

@keyframes lamp-breathe {
    from {
        opacity: 0.7;
    }
    to {
        opacity: 1;
    }
}

@media (max-width: 74rem) {
    .arcade-layout {
        grid-template-columns: minmax(18rem, 0.72fr) minmax(29rem, 1.28fr);
        gap: 1.25rem;
    }

    .profile-card {
        grid-template-columns: minmax(10.5rem, 0.34fr) minmax(0, 1fr);
    }

    .profile-sheet {
        grid-template-columns: minmax(0, 1fr) minmax(8rem, 0.42fr);
    }
}

@media (max-width: 58rem) {
    .members-arcade {
        padding-top: 5.5rem;
    }

    .arcade-layout {
        grid-template-columns: 1fr;
        min-height: auto;
    }

    .game-stage {
        width: min(100%, 36rem);
    }

    .members-showcase {
        width: min(100%, 50rem);
        margin-inline: auto;
    }

    .profile-card {
        min-height: 28rem;
    }
}

@media (max-width: 39rem) {
    .members-arcade {
        padding-inline: 0.6rem;
    }

    .profile-card {
        grid-template-columns: 1fr;
        min-height: 0;
        border-width: 0.65rem;
        border-radius: 1.6rem;
    }

    .portrait-column {
        display: grid;
        grid-template-columns: minmax(7rem, 0.42fr) minmax(0, 1fr);
        align-items: end;
    }

    .portrait-frame {
        width: min(100%, 10rem);
    }

    .profile-sheet {
        grid-template-columns: minmax(0, 1fr) minmax(7rem, 0.46fr);
        min-height: 18rem;
        margin-top: 0;
        padding: 1rem;
    }

    .member-name {
        display: grid;
        margin-bottom: 1.5rem;
    }

    .member-introduction {
        min-height: 4rem;
    }

    .collection-panel {
        padding-inline: 2.7rem;
    }
}

@media (prefers-reduced-motion: reduce) {
    .light-halo {
        animation: none;
    }

    .token-art {
        transition: none;
    }
}

/* Theme tokens and viewport-safe composition. */
.members-arcade {
    --machine-shell-top: #b8e9f5;
    --machine-shell-bottom: #66bddf;
    --machine-edge: #edfaff;
    --machine-rim: #2d69ae;
    --marquee-panel: #174b92;
    --playfield-top: #86a9ff;
    --playfield-bottom: #5277e2;
    --card-frame: #ffe28d;
    --card-shadow-solid: rgb(43 103 165 / 0.4);
    --card-shadow: rgb(37 72 115 / 0.2);
    --portrait-border: #397dc8;
    --portrait-bg: #f4fbff;
    --paper: #fffdf5;
    --paper-shadow: rgb(82 62 18 / 0.09);
    --profile-text: #132942;
    --profile-heading: #123d75;
    --profile-copy: #29435e;
    --profile-rule: #397fd2;
    --empty-ring: #2d67ad;
    --empty-fill: rgb(111 190 224 / 0.14);
    --accent-orange: #ffad42;
    --collection-bg: #2867a9;
    --collection-fade: #2867a9;
    box-sizing: border-box;
    width: 100%;
    height: 100svh;
    min-height: 0;
    padding: clamp(4.4rem, 8svh, 6rem) clamp(0.65rem, 2.2vw, 2.5rem)
        clamp(0.55rem, 1.5svh, 1.2rem);
    overflow: hidden;
}

:global(.dark) .members-arcade {
    --machine-shell-top: #69c8f4;
    --machine-shell-bottom: #3f9edb;
    --machine-edge: #dff7ff;
    --machine-rim: #164b9f;
    --marquee-panel: #0f4296;
    --playfield-top: #5982ff;
    --playfield-bottom: #3f69e8;
    --card-frame: #ffdf83;
    --card-shadow-solid: rgb(35 104 184 / 0.5);
    --card-shadow: rgb(2 30 69 / 0.23);
    --portrait-border: #3c83d7;
    --portrait-bg: #eff8ff;
    --paper: #fffef9;
    --paper-shadow: rgb(82 62 18 / 0.1);
    --profile-text: #111827;
    --profile-heading: #0c3476;
    --profile-copy: #203a55;
    --profile-rule: #438ae2;
    --empty-ring: #69c7ee;
    --empty-fill: rgb(92 176 225 / 0.12);
    --collection-bg: #17599f;
    --collection-fade: #17599f;
}

.arcade-layout {
    grid-template-columns: minmax(15rem, 0.78fr) minmax(25rem, 1.22fr);
    width: min(100%, 118rem);
    height: 100%;
    min-height: 0;
}

.game-stage {
    width: min(100%, calc((100svh - 6.8rem) * 7 / 9));
    max-height: 100%;
}

.machine-rim {
    fill: var(--machine-rim);
}
.marquee-panel {
    fill: var(--marquee-panel);
}

.marquee-action {
    fill: rgb(8 42 111 / 0.6);
    stroke: rgb(255 255 255 / 0.2);
    stroke-width: 3;
}

.start-control.is-ready .marquee-action,
.start-control.is-complete .marquee-action,
.start-control.is-restart-confirm .marquee-action {
    fill: #ffca50;
    stroke: #fff5bd;
    stroke-width: 6;
    filter: drop-shadow(0 0 0.8rem rgb(255 220 104 / 0.88));
}

.start-control.is-ready .marquee-action {
    animation: ready-button-pulse 1.35s ease-in-out infinite alternate;
}

.start-control.is-ready .marquee-text,
.start-control.is-complete .marquee-text,
.start-control.is-restart-confirm .marquee-text {
    fill: #173e79;
    font-size: 68px;
}

.start-control.is-restart-confirm .marquee-text {
    font-size: 56px;
}

.marquee-hint {
    fill: #173e79;
    font-family: "Belanosima", sans-serif;
    font-size: 16px;
    letter-spacing: 0.15em;
}

.members-showcase {
    grid-template-rows: minmax(0, 1fr) clamp(7rem, 18svh, 10.5rem);
    height: 100%;
    min-height: 0;
}

.profile-stage {
    position: relative;
    min-width: 0;
    min-height: 0;
    perspective: 100rem;
}

.profile-flipper {
    position: relative;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    will-change: transform;
}

.profile-face {
    position: absolute;
    inset: 0;
    display: grid;
    min-width: 0;
    min-height: 0;
    backface-visibility: hidden;
}

.profile-back {
    transform: rotateY(180deg);
}

.collection-panel {
    box-sizing: border-box;
    min-height: 0;
    padding-block: 0.45rem;
    background: var(--collection-bg);
}

.collection-heading {
    padding-bottom: 0.1rem;
}

.gallery-viewport {
    position: relative;
    min-width: 0;
}

.gallery-viewport::before,
.gallery-viewport::after {
    position: absolute;
    z-index: 2;
    top: 0;
    bottom: 0;
    width: clamp(2.2rem, 5vw, 4.5rem);
    content: "";
    opacity: 0;
    pointer-events: none;
    transition: opacity 220ms ease;
}

.gallery-viewport::before {
    left: 0;
    background: linear-gradient(90deg, var(--collection-fade), transparent);
}

.gallery-viewport::after {
    right: 0;
    background: linear-gradient(270deg, var(--collection-fade), transparent);
}

.gallery-viewport.can-scroll-left::before,
.gallery-viewport.can-scroll-right::after {
    opacity: 1;
}

.gallery-track {
    display: block;
    padding: 0.2rem 0 0.35rem;
    overflow-x: auto;
    overflow-y: hidden;
    scroll-snap-type: none;
    touch-action: pan-x;
}

.gallery-content {
    display: flex;
    width: max-content;
    min-width: 100%;
    gap: clamp(0.6rem, 1.25vw, 1.15rem);
}

.member-token {
    flex-basis: clamp(4.7rem, 7.5vw, 7rem);
    min-width: 0;
}

.gallery-arrow {
    opacity: 0;
    pointer-events: none;
    transition:
        opacity 180ms ease,
        background-color 180ms ease;
}

.gallery-arrow.is-visible {
    opacity: 1;
    pointer-events: auto;
}

.gallery-arrow:disabled {
    visibility: hidden;
}

@keyframes ready-button-pulse {
    from {
        filter: drop-shadow(0 0 0.3rem rgb(255 220 104 / 0.62));
    }
    to {
        filter: drop-shadow(0 0 1.1rem rgb(255 235 151 / 1));
    }
}

@media (max-width: 58rem) {
    .members-arcade {
        padding-top: clamp(4.2rem, 8svh, 5.5rem);
    }

    .arcade-layout {
        grid-template-columns: 1fr;
        grid-template-rows: minmax(0, 0.56fr) minmax(0, 0.44fr);
        min-height: 0;
        gap: clamp(0.4rem, 1.2svh, 0.85rem);
    }

    .game-stage {
        width: auto;
        height: 100%;
        max-width: 100%;
    }

    .members-showcase {
        width: min(100%, 50rem);
        grid-template-rows: minmax(0, 1fr) clamp(5.5rem, 13svh, 7rem);
    }

    .collection-heading h2 {
        font-size: 0.85rem;
    }
    .collection-heading span {
        font-size: 0.8rem;
    }
    .token-name {
        font-size: 0.68rem;
    }
}

@media (prefers-reduced-motion: reduce) {
    .start-control.is-ready .marquee-action {
        animation: none;
    }
    .gallery-viewport::before,
    .gallery-viewport::after,
    .gallery-arrow {
        transition: none;
    }
}
</style>
