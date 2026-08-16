# Adding a Homepage Chapter

Homepage navigation uses two GSAP labels for each chapter:

- `active:` changes the navigator title as soon as the new scene/content begins.
- `pause:` is the stable destination used by **Next** and **Prev**.

## 1. Register the chapter

Add the title in `app/utils/home-chapters.ts`. Its position in `HOME_CHAPTERS` determines the displayed chapter number.

```ts
myChapter: "pause:My chapter title",
```

## 2. Add both timeline labels

```ts
import {
    HOME_CHAPTERS,
    homeChapterActivationLabel,
} from "~/utils/home-chapters";

timeline
    // Switch the title when this content starts entering.
    .addLabel(homeChapterActivationLabel(HOME_CHAPTERS.myChapter), "sceneEnter")
    // Add the entrance animation here.
    .to(content, { autoAlpha: 1, duration: 0.4 }, "sceneEnter")
    // Stop only after the frame is complete and readable.
    .addLabel(HOME_CHAPTERS.myChapter);
```

Place `active:` at the semantic handoff to the new content. Place `pause:` after text and important visuals have settled. Do not put `pause:` on a fade-out, actor replacement, or other transient frame.

For an embedded child timeline, keep both labels on the child; `ProductSolution.vue` promotes `active:` and `pause:` labels to its ScrollTrigger master timeline.

For a non-scroll-driven static scene, add `:data-home-chapter="HOME_CHAPTERS.myChapter"` to its root element. The marker acts as both its active position and pause destination.
