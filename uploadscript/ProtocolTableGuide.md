# Protocol tables

Use `content-components-protocol-table` for a protocol with materials, equipment, and procedure columns. Each named slot accepts normal Markdown, including nested lists, blockquotes, formulas, tables, and MDC components. The component renders a native outer HTML table; a Markdown table inside the procedure becomes a native nested table through `ProseTable`.

Do not put a Markdown pipe table inside a cell of another pipe table. Do not leave exported `<br>` sequences in place of the original rows and columns. Restore each inner table from the Feishu source and verify its column order and values.

```markdown
::content-components-protocol-table{title="Example protocol"}

#materials

- Reagent A
- Reagent B

#equipment

- Instrument

#procedure

1. Follow the quantities in this table:

    | Component | Amount       |
    | --------- | ------------ |
    | Reagent A | As specified |
    | Reagent B | As specified |

2. Continue with the next step.

::
```

Indent an inner table to the content column of its containing list item. For `1. `, use three spaces; for `10. `, use four. Leave a blank line before and after the table. Keep any following continuation paragraphs inside the same list item by using the same indentation.

For a nested MDC component, use three colons for its opening and closing markers, as described in [Lightbox image formatting](lightboximage.md). Keep two colons for the surrounding protocol component.

Every protocol needs a descriptive `title`. It supplies the outer table caption and scroll region name. Inner tables receive distinct captions and scroll region names using that title and their sequence number. Column headers use `scope="col"`.

The outer table has a minimum width of 40rem and scrolls within its container on narrow screens. Large inner tables scroll within the procedure cell independently. Both scroll regions are keyboard focusable; use the left and right arrow keys to scroll the focused region. Styles, keyboard handling, and generated inner captions are scoped to protocols; ordinary tables retain their existing behavior.

Keep the exported source files unchanged. Editorial instructions before the protocol content are source annotations, not instructions to the conversion agent or publication copy. Preserve scientific quantities, conditions, and source notes; record scientific ambiguities for the author instead of inferring a correction.
