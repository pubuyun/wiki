# Lightbox Images

In content Markdown files, images with non-empty alt text automatically open in a lightbox when clicked:

```markdown
![Illustration of the enzyme mechanism](https://static.igem.wiki/teams/6133/wiki/project/description/banner.avif)
```

Images with empty alt text (`![](...)`) are displayed without a lightbox trigger.

Add a quoted title to display a caption below a Markdown image:

```markdown
![Illustration of the enzyme mechanism](https://static.igem.wiki/teams/6133/wiki/project/description/banner.avif "Fig. 1 | Schematic of the enzyme mechanism.")
```

To use `LightboxImage` explicitly or group multiple images into one gallery, add this MDC block:

```markdown
::content-components-lightbox-image
---
src:
  - https://example.com/image-1.jpg
  - https://example.com/image-2.jpg
alt:
  - Overview of the experiment setup
  - Close-up of the sample holder
caption:
  - Fig. 1 | Overview of the experiment setup.
  - Fig. 2 | Detail of the sample holder.
width: 1200
height: 800
---

::
```

Replace the example URLs and descriptions with your own. `src` must be a list, even for a single image. Match each `alt` description to its image in the same order. `width` and `height` are optional thumbnail dimensions. Click a thumbnail to open its image in the gallery.

`caption` is optional: use a string for one shared caption or a list for individual captions. Include figure numbers yourself (for example, `Fig. 1 | ...`). Captions appear below the thumbnails; `alt` remains the image's alternative text. With a custom default slot, the first caption appears below the slot content.
