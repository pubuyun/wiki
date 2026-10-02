# Writing panel layouts in Markdown

Use `::panel-layout` in a Nuxt Content Markdown document to arrange two to four panels. Each panel can contain Markdown, images, or MDC components. Readers can resize the panels on wide layouts; narrow layouts stack the content automatically.

The component is defined in [PanelLayout.vue](app/components/content/PanelLayout.vue). Working examples are in [the model overview document](content/model/overview.md).

## Slot names

Write a slot marker on its own line, without a space after `#`.

| Slot marker     | Position                          | When to include it                     |
| --------------- | --------------------------------- | -------------------------------------- |
| `#left`         | Left panel, or upper left panel   | Always                                 |
| `#left-bottom`  | Lower left panel                  | When the left column needs two panels  |
| `#right`        | Right panel, or upper right panel | Always                                 |
| `#right-bottom` | Lower right panel                 | When the right column needs two panels |

Always supply `#left` and `#right`. Adding a bottom slot splits that column into two rows. No separate layout property is needed.

Place all content inside a named slot. This component does not render an unnamed default slot. A slot can contain multiple paragraphs, lists, images, or components.

## Two panels: one left, one right

```md
::panel-layout
#left
This is the left panel. It supports **bold text**, links, and lists.

#right
This is the right panel.
::
```

## Three panels: one left, two right

The left panel fills the layout height. The right column has independently resizable upper and lower panels.

```md
::panel-layout{height="32rem" label="Model summary and results"}
#left
Explain the model here.

#right
Describe the first result here.

#right-bottom
Describe the second result here.
::
```

## Three panels: two left, one right

```md
::panel-layout{height="28rem" label="Methods and conclusion"}
#left
Describe the first method here.

#left-bottom
Describe the second method here.

#right
Write the conclusion here.
::
```

## Four panels: two left, two right

Each column has its own row divider, so the two row heights can be adjusted independently.

```md
::panel-layout{height="36rem" label="Four model results"}
#left
Result A: upper left.

#left-bottom
Result B: lower left.

#right
Result C: upper right.

#right-bottom
Result D: lower right.
::
```

## Put an image beside text

Use normal Markdown image syntax in any panel. Images keep their proportions. In this project, a Markdown image with nonempty alternative text uses the existing image lightbox.

```md
::panel-layout{height="24rem" label="Project illustration and explanation"}
#left
Explain the illustration here.

#right
![Illustration of Expelliodor spray and enzyme mechanisms](https://static.igem.wiki/teams/6133/wiki/project/description/banner.avif){width="4269" height="2019"}
::
```

Replace the image URL and alternative text with values appropriate to your document. For an image in `public/images/example.png`, use `/images/example.png` as the URL.

## Use LightboxImage directly

For a nested block component, use three colons for its opening and closing markers. Keep two colons for the surrounding layout. `LightboxImage` expects `src` to be an array, even for one image.

```md
::panel-layout{height="32rem" label="Illustration with notes"}
#left
Explain the illustration here.

#right
:::lightbox-image
---

src: - https://static.igem.wiki/teams/6133/wiki/project/description/banner.avif
alt: Illustration of Expelliodor spray and enzyme mechanisms
width: 4269
height: 2019
---

:::

#right-bottom
Add related notes here.
::
```

Use `#left-bottom` instead if the extra panel belongs under the left panel. To create a gallery, add more URLs to `src` and supply an `alt` array with one description per image. Omit or update `width` and `height` when using different images.

## Use other MDC components

Place a component's usual MDC markup inside a slot. For example, a structure viewer can appear beside explanatory text:

```md
::panel-layout{height="36rem" label="Molecular structure and explanation"}
#left
Describe the molecular structure and its features here.

#right
:::structure-viewer{structure-url="/model.pdb" structure-url-format="pdb"}
:::
::
```

Use the same approach for charts or other registered MDC components. The layout controls panel placement and resizing; the nested component keeps its own properties and interaction behavior.

## Optional properties

| Property | Default          | Purpose                                                                                                    |
| -------- | ---------------- | ---------------------------------------------------------------------------------------------------------- |
| `height` | `"32rem"`        | Sets the splitter area height on wide layouts. Use a CSS length such as `"480px"`, `"28rem"`, or `"60vh"`. |
| `label`  | `"Panel layout"` | Gives the whole layout an accessible name. Use a short description of its content.                         |

For example:

```md
::panel-layout{height="480px" label="Comparison of model predictions"}
#left
First prediction.

#right
Second prediction.
::
```

Choose enough height for the content. On wide layouts, content that exceeds its panel height scrolls within that panel.

## Resizing and responsive behavior

- Columns start at equal widths. Split rows also start at equal heights.
- Readers can drag the full-length dividers to resize panels.
- Keyboard users can Tab to a divider and use Left/Right for column widths or Up/Down for row heights.
- Each split keeps at least 20% of the available space for each panel.
- Panels have no added borders. Full-length dividers sit within generous spacing and have rounded ends without gradients. They highlight on hover or keyboard focus, and resize cursors indicate that the layout is adjustable.
- When the layout's available width is below `40rem`, all panels stack and their heights expand to fit the content. The fixed `height` no longer applies, and the dividers are hidden.
- Stacked reading order is `left`, `left-bottom` if present, `right`, then `right-bottom` if present.
- Resized proportions are not saved across page loads.

The responsive threshold depends on the layout's container width, so the panels can stack even on a large screen when document sidebars leave limited space.

## Common mistakes

- Write `#left`, not `# left`. The latter is a Markdown heading rather than a slot marker.
- Put text after a named slot marker, not before the first marker.
- Include the top slot when using its bottom slot; for example, use both `#right` and `#right-bottom`.
- Close nested block components with `:::` before closing the layout with `::`.
- Give `height` a CSS unit; use `height="480px"` rather than `height="480"`.
- Give meaningful images descriptive alternative text.
