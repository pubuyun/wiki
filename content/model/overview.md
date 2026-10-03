---
title: Overview
citationIds:
  - "1"
  - "2"
  - "3"
  - "4"
  - "5"
hasReference: false
order: 100
---

## Full Workflow

::content-graph{.mb-8 full-height src="/content/model/index.json"}
::

## Overview

### ECharts Rendering Test

::content-components-echarts
---
description: "Example data: A has a value of 10 and B has a value of 20."
height: "400"
label: Example bar chart
---
```js
option = {
    xAxis: { data: ["A", "B"] },
    yAxis: {},
    series: [{ type: "bar", data: [10, 20] }],
};
```
::

### Two Panels

::content-components-panel-layout
---
height: 24rem
label: Two panels example
---
#left
This layout accepts **Markdown or any MDC component** in either panel. Drag the divider to adjust the widths, or focus it and use the arrow keys.

On smaller screens, the panels stack in reading order and expand to fit their content.

- Images keep their original proportions.
- Select the image to open an enlarged view.

#right
![Illustration of Expelliodor spray and enzyme mechanisms](https://static.igem.wiki/teams/6133/wiki/project/description/banner.avif){height="2019" width="4269"}
::

### One Left, Two Right

::content-components-panel-layout
---
height: 32rem
label: One left, two right example
---
#left
**Panel A** fills the left column. The right column contains two panels, each of which can hold text, an image, a chart, or another component.

Both the column divider and the right row divider can be resized independently.

#right
**Panel B** opens an enlarged image.

  :::content-components-lightbox-image
  ---
  height: 2019
  https://static:
    igem:
      wiki/teams/6133/wiki/project/description/banner:
        avif: null
  src: null
  width: 4269
  alt: Illustration of Expelliodor spray and enzyme mechanisms
  ---
  :::

#right-bottom
**Panel C** contains regular Markdown.

- The layout adapts to the available width.
- The image lightbox continues to work inside a resizable panel.
::

### Two Left, One Right

::content-components-panel-layout
---
height: 24rem
label: Two left, one right example
---
#left
**Panel A** is the upper left panel.

#left-bottom
**Panel B** is the lower left panel. Each column decides whether to split vertically from the presence of its bottom slot.

#right
**Panel C** fills the right column.

![Illustration of Expelliodor spray and enzyme mechanisms](https://static.igem.wiki/teams/6133/wiki/project/description/banner.avif){height="2019" width="4269"}
::

### Four Panels

::content-components-panel-layout
---
height: 32rem
label: Four panels example
---
#left
**Panel A** contains Markdown.

#left-bottom
**Panel B** contains a chart.

  :::content-components-echarts
  ---
  description: A has a value of 10 and B has a value of 20.
  height: "180"
  label: Panel B bar chart
  ---
  ```js
  option = {
      xAxis: { data: ["A", "B"] },
      yAxis: {},
      series: [{ type: "bar", data: [10, 20] }],
  };
  ```
  :::

#right
**Panel C** contains an image.

![Illustration of Expelliodor spray and enzyme mechanisms](https://static.igem.wiki/teams/6133/wiki/project/description/banner.avif){height="2019" width="4269"}

#right-bottom
**Panel D** contains a list.

- Resize the two columns with the central divider.
- Resize each column's rows independently.
- Narrow layouts stack A, B, C, then D.
::

### LaTeX Rendering Test

Inline math uses single dollar signs, for example [[]{.katex-mathml}[[[]{.strut style="height:0.6833em;"}[E]{.mord.mathnormal style="margin-right:0.0576em;"}[]{.mspace style="margin-right:0.2778em;"}[=]{.mrel}[]{.mspace style="margin-right:0.2778em;"}]{.base}[[]{.strut style="height:0.8141em;"}[m]{.mord.mathnormal}[[c]{.mord.mathnormal}[[[[[[]{.pstrut style="height:2.7em;"}[[2]{.mord.mtight}]{.sizing.reset-size6.size3.mtight}]{style="top:-3.063em;margin-right:0.05em;"}]{.vlist style="height:0.8141em;"}]{.vlist-r}]{.vlist-t}]{.msupsub}]{.mord}]{.base}]{.katex-html ariaHidden="true"}]{.katex}.

Display math uses double dollar signs:

[[[]{.katex-mathml}[[[]{.strut style="height:2.3846em;vertical-align:-0.9703em;"}[[∫]{.mop.op-symbol.large-op style="margin-right:0.4445em;position:relative;top:-0.0011em;"}[[[[[[]{.pstrut style="height:2.7em;"}[[[−]{.mord.mtight}[∞]{.mord.mtight}]{.mord.mtight}]{.sizing.reset-size6.size3.mtight}]{style="top:-1.7881em;margin-left:-0.4445em;margin-right:0.05em;"}[[]{.pstrut style="height:2.7em;"}[[[∞]{.mord.mtight}]{.mord.mtight}]{.sizing.reset-size6.size3.mtight}]{style="top:-3.8129em;margin-right:0.05em;"}]{.vlist style="height:1.4143em;"}[​]{.vlist-s}]{.vlist-r}[[[]]{.vlist style="height:0.9703em;"}]{.vlist-r}]{.vlist-t.vlist-t2}]{.msupsub}]{.mop}[]{.mspace style="margin-right:0.1667em;"}[[e]{.mord.mathnormal}[[[[[[]{.pstrut style="height:2.7em;"}[[[−]{.mord.mtight}[[x]{.mord.mathnormal.mtight}[[[[[[]{.pstrut style="height:2.5em;"}[[2]{.mord.mtight}]{.sizing.reset-size3.size1.mtight}]{style="top:-2.931em;margin-right:0.0714em;"}]{.vlist style="height:0.8913em;"}]{.vlist-r}]{.vlist-t}]{.msupsub}]{.mord.mtight}]{.mord.mtight}]{.sizing.reset-size6.size3.mtight}]{style="top:-3.113em;margin-right:0.05em;"}]{.vlist style="height:1.0369em;"}]{.vlist-r}]{.vlist-t}]{.msupsub}]{.mord}[]{.mspace style="margin-right:0.1667em;"}[d]{.mord.mathnormal}[x]{.mord.mathnormal}[]{.mspace style="margin-right:0.2778em;"}[=]{.mrel}[]{.mspace style="margin-right:0.2778em;"}]{.base}[[]{.strut style="height:1.04em;vertical-align:-0.1908em;"}[[[[[[]{.pstrut style="height:3em;"}[[π]{.mord.mathnormal style="margin-right:0.0359em;"}]{.mord style="padding-left:0.833em;"}]{.svg-align style="top:-3em;"}[[]{.pstrut style="height:3em;"}[]{.hide-tail style="min-width:0.853em;height:1.08em;"}]{style="top:-2.8092em;"}]{.vlist style="height:0.8492em;"}[​]{.vlist-s}]{.vlist-r}[[[]]{.vlist style="height:0.1908em;"}]{.vlist-r}]{.vlist-t.vlist-t2}]{.mord.sqrt}]{.base}]{.katex-html ariaHidden="true"}]{.katex}]{.katex-display}

### Philosophy

*Markdown* is intended to be as easy-to-read and easy-to-write as is feasible. :fn-ref{#1}

Readability, *however*, is emphasized above all else. A Markdown-formatted--- Unknown node: hardBreak ---document should be publishable as-is, as plain text, without looking--- Unknown node: hardBreak ---like it's been marked up with tags or formatting instructions. While--- Unknown node: hardBreak ---Markdown's syntax has been influenced by several existing text-to-HTML--- Unknown node: hardBreak ---filters -- including [Setext](http://docutils.sourceforge.net/mirror/setext.html), [atx](http://www.aaronsw.com/2002/atx/), [Textile](http://textism.com/tools/textile/), [reStructuredText](http://docutils.sourceforge.net/rst.html),--- Unknown node: hardBreak ---[Grutatext](http://www.triptico.com/software/grutatxt.html), and [EtText](http://ettext.taint.org/doc/) -- the single biggest source of--- Unknown node: hardBreak ---inspiration for Markdown's syntax is the format of plain text email. :fn-ref{#2}

This line is added by *NuxtStudio*

Title reference test: :reference{#heading-ref-1 destination="#title-reference-target" label="Title Reference Target"}

### Title Reference Target

This heading is the destination of the title reference above.

![](https://static.igem.wiki/teams/6133/wiki/project/description/banner.avif){height="2019" width="4269"}

| Feature     | Description                         | Status   |
| ----------- | ----------------------------------- | -------- |
| MDC Syntax  | Vue components directly in Markdown | Ready    |
| Code Blocks | Native syntax highlighting          | Built-in |
| File-based  | Works like a local Headless CMS     | Active   |

## Block Elements

> This is a blockquote with two paragraphs. Lorem ipsum dolor sit amet,
> consectetuer adipiscing elit. Aliquam hendrerit mi posuere lectus.
> Vestibulum enim wisi, viverra nec, fringilla in, laoreet vitae, risus.
>
> Donec sit amet nisl. Aliquam semper ipsum sit amet velit. Suspendisse
> id sem consectetuer libero luctus adipiscing.> This is a blockquote with two paragraphs. Lorem ipsum dolor sit amet,
> consectetuer adipiscing elit. Aliquam hendrerit mi posuere lectus.
> Vestibulum enim wisi, viverra nec, fringilla in, laoreet vitae, risus.> Donec sit amet nisl. Aliquam semper ipsum sit amet velit. Suspendisse
> id sem consectetuer libero luctus adipiscing.> This is the first level of quoting.
>
> > This is nested blockquote.
>
> Back to the first level. :fn-ref{#3}

### Paragraphs and Line Breaks

A paragraph is simply one or more consecutive lines of text, separated
by one or more blank lines. (A blank line is any line that looks like a
blank line -- a line containing nothing but spaces or tabs is considered
blank.) Normal paragraphs should not be indented with spaces or tabs.

### Headers

Markdown supports two styles of headers, [Setext] [1] and [atx] [2].

Optionally, you may "close" atx-style headers. This is purely
cosmetic -- you can use this if you think it looks better. The
closing hashes don't even need to match the number of hashes
used to open the header. (The number of opening hashes
determines the header level.)

### Blockquotes

Markdown uses email-style `>` characters for blockquoting. If you're
familiar with quoting passages of text in an email message, then you
know how to create a blockquote in Markdown. It looks best if you hard
wrap the text and put a `>` before every line:

Markdown allows you to be lazy and only put the `>` before the first
line of a hard-wrapped paragraph:

Blockquotes can be nested (i.e. a blockquote-in-a-blockquote) by
adding additional levels of `>`:

Blockquotes can contain other Markdown elements, including headers, lists,
and code blocks:

> ## Not a header.
>
> 1. This is the first list item.
> 2. This is the second list item.
>
> Here's some example code:
>
> ```text
> return shell_exec("echo $input | $markdown_script");
> ```

::content-components-collapsible-paragraph
---
id: paragraph-details
title: Paragraph Details
---
The implication of the "one or more consecutive lines of text" rule is
that Markdown supports "hard-wrapped" text paragraphs. This differs
significantly from most other text-to-HTML formatters (including Movable
Type's "Convert Line Breaks" option) which translate every line break
character in a paragraph into a `<br />` tag.

When you *do* want to insert a `<br />` break tag using Markdown, you
end a line with two or more spaces, then type return.
::

::content-components-collapsible-paragraph
---
blur-preview: true
id: paragraph-preview
title: Paragraph Preview
---
A paragraph can span several lines without adding a break after each line.
This preview shows the beginning of the text while the paragraph is folded.
Click the title or the blurred paragraph to read the whole explanation.

Once expanded, clicking the paragraph folds it again. The title works in
both directions as well.
::

## header 3

### Lists

Markdown supports ordered (numbered) and unordered (bulleted) lists. :fn-ref{#4}

Unordered lists use asterisks, pluses, and hyphens -- interchangably
\-- as list markers:

- Red
- Green
- Blue

is equivalent to:

- Red
- Green
- Blue

and:

- Red
- Green
- Blue

Ordered lists use numbers followed by periods:

1. Bird
2. McHale
3. Parish

It's important to note that the actual numbers you use to mark the
list have no effect on the HTML output Markdown produces. The HTML
Markdown produces from the above list is:

If you instead wrote the list in Markdown like this:

1. Bird
2. McHale
3. Parish

or even:

3. Bird
4. McHale
5. Parish

you'd get the exact same HTML output. The point is, if you want to,
you can use ordinal numbers in your ordered Markdown lists, so that
the numbers in your source match the numbers in your published HTML.
But if you want to be lazy, you don't have to.

To make lists look nice, you can wrap items with hanging indents:

- Lorem ipsum dolor sit amet, consectetuer adipiscing elit.
  Aliquam hendrerit mi posuere lectus. Vestibulum enim wisi,
  viverra nec, fringilla in, laoreet vitae, risus.
- Donec sit amet nisl. Aliquam semper ipsum sit amet velit.
  Suspendisse id sem consectetuer libero luctus adipiscing.

But if you want to be lazy, you don't have to:

- Lorem ipsum dolor sit amet, consectetuer adipiscing elit.
  Aliquam hendrerit mi posuere lectus. Vestibulum enim wisi,
  viverra nec, fringilla in, laoreet vitae, risus.
- Donec sit amet nisl. Aliquam semper ipsum sit amet velit.
  Suspendisse id sem consectetuer libero luctus adipiscing.

List items may consist of multiple paragraphs. Each subsequent
paragraph in a list item must be indented by either 4 spaces
or one tab:

1. This is a list item with two paragraphs. Lorem ipsum dolor
   sit amet, consectetuer adipiscing elit. Aliquam hendrerit
   mi posuere lectus. :br Vestibulum enim wisi, viverra nec, fringilla in, laoreet
   vitae, risus. Donec sit amet nisl. Aliquam semper ipsum
   sit amet velit.
2. Suspendisse id sem consectetuer libero luctus adipiscing.

It looks nice if you indent every line of the subsequent
paragraphs, but here again, Markdown will allow you to be
lazy:

- This is a list item with two paragraphs.
  ```text
    This is the second paragraph in the list item. You're
  ```
  : bronly required to indent the first line. Lorem ipsum dolor
  sit amet, consectetuer adipiscing elit.
- Another item in the same list.

To put a blockquote within a list item, the blockquote's `>`--- Unknown node: hardBreak ---delimiters need to be indented: :fn-ref{#5}

- A list item with a blockquote:
  > This is a blockquote
  > inside a list item.

To put a code block within a list item, the code block needs
to be indented *twice* -- 8 spaces or two tabs:

- A list item with a code block:
  ```text
    <code goes here>
  ```

### Code Blocks

Pre-formatted code blocks are used for writing about programming or
markup source code. Rather than forming normal paragraphs, the lines
of a code block are interpreted literally. Markdown wraps a code block
in both `<pre>` and `<code>` tags.

To produce a code block in Markdown, simply indent every line of the
block by at least 4 spaces or 1 tab.

This is a normal paragraph:

```text
This is a code block.
```

Here is an example of AppleScript:

```text
tell application "Foo"
    beep
end tell
```

A code block continues until it reaches a line that is not indented
(or the end of the article).

Within a code block, ampersands (`&`) and angle brackets (`<` and `>`)
are automatically converted into HTML entities. This makes it very
easy to include example HTML source code using Markdown -- just paste
it and indent it, and Markdown will handle the hassle of encoding the
ampersands and angle brackets. For example, this:

```text
<div class="footer">
    &copy; 2004 Foo Corporation
</div>
```

Regular Markdown syntax is not processed within code blocks. E.g.,
asterisks are just literal asterisks within a code block. This means
it's also easy to use Markdown to write about Markdown's own syntax.

```text
tell application "Foo"
    beep
end tell
```

## Span Elements

### Links

Markdown supports two style of links: *inline* and *reference*.

In both styles, the link text is delimited by [square brackets].

To create an inline link, use a set of regular parentheses immediately
after the link text's closing square bracket. Inside the parentheses,
put the URL where you want the link to point, along with an *optional*
title for the link, surrounded in quotes. For example:

This is [an example](http://example.com/) inline link.

[This link](http://example.net/) has no title attribute.

### Emphasis

Markdown treats asterisks (`*`) and underscores (`_`) as indicators of
emphasis. Text wrapped with one `*` or `_` will be wrapped with an
HTML `<em>` tag; double `*`'s or `_`'s will be wrapped with an HTML
`<strong>` tag. E.g., this input:

*single asterisks*

*single underscores*

**double asterisks**

**double underscores**

### Code

To indicate a span of code, wrap it with backtick quotes (`` ` ``).
Unlike a pre-formatted code block, a code span indicates code within a
normal paragraph. For example:

Use the `printf()` function.

## Foot Notes

1. :ref-fn[[Reference ID 1](https://www.baidu.com/)]{#1}
2. :ref-fn[[Reference ID 2](https://www.google.com/)]{#2}
3. :ref-fn[Reference ID 3]{#3}
4. :ref-fn[Reference ID 4]{#4}
5. :ref-fn[Reference ID 5]{#5}
