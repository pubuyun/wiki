# Prose Components

> A list of Prose components.

Prose components are replacements for HTML typography tags. Prose components provide a simple way to customize content UI.

To overwrite a prose component, create a component with the same name in your project `components/content/` directory (ex: `components/content/ProseA.vue`).

<note>

Prose components are originally part of [`@nuxtjs/mdc`](https://github.com/nuxt-modules/mdc).

</note>

## `ProseA`

<code-group>

```md [Code]
[Prose Components](/docs/components/prose)
```

<code-preview label="Preview" icon="i-lucide-eye">

[Prose Components](/docs/components/prose)

</code-preview>
</code-group>

## `ProseBlockquote`

<code-group>

```md [Code]
> Block quote
```

<code-preview label="Preview" icon="i-lucide-eye">

> Block quote

</code-preview>
</code-group>

## `ProsePre`

<code-group>

```md [Code]
```js [file.js]{2} meta-info=val
  export default () => {
    console.log('Code block')
  }
  ```
```

<code-preview label="Preview" icon="i-lucide-eye">

```js [file.js]
export default () => {
  console.log('Code block')
}
```

</code-preview>
</code-group>

Component properties will be:

```json
{
  code: "export default () => {\n    console.log('Code block')\n}"
  language: "js"
  filename: "file.js"
  highlights: [2]
  meta: "meta-info=val"
}
```

Check out the [highlight options](/docs/getting-started/configuration#highlight) for more about the syntax highlighting.

<callout type="warning">

If you want to use `]` in the filename, you need to escape it with 2 backslashes: `\\]`. This is necessary since JS will automatically escape the backslash in a string so `\]` will be resolved as `]` breaking our regex.

</callout>

## `ProseCode`

<code-group>

```md [Code]
`code`

`const code: string = 'highlighted code inline'`{lang="ts"}
```

<code-preview label="Preview" icon="i-lucide-eye">

`code`

`const code: string = 'highlighted code inline'`

</code-preview>
</code-group>

## `ProseH1`

<code-group>

```md [Code]
# H1 Heading
```

<code-preview label="Preview" className="pt-4">

# H1 Heading

</code-preview>
</code-group>

## `ProseH2`

<code-group>

```md [Code]
## H2 Heading
```

<code-preview label="Preview" icon="i-lucide-eye">

## H2 Heading

</code-preview>
</code-group>

## `ProseH3`

<code-group>

```md [Code]
### H3 Heading
```

<code-preview label="Preview" icon="i-lucide-eye">

### H3 Heading

</code-preview>
</code-group>

## `ProseH4`

<code-group>

```md [Code]
#### H4 Heading
```

<code-preview label="Preview" icon="i-lucide-eye">

#### H4 Heading

</code-preview>
</code-group>

## `ProseH5`

<code-group>

```md [Code]
##### H5 Heading
```

<code-preview label="Preview" icon="i-lucide-eye">

##### H5 Heading

</code-preview>
</code-group>

## `ProseH6`

<code-group>

```md [Code]
###### H6 Heading
```

<code-preview label="Preview" icon="i-lucide-eye">

###### H6 Heading

</code-preview>
</code-group>

## `ProseHr`

<code-group>

```md [Code]
Divider under.

---

Divider above.
```

<code-preview label="Preview" icon="i-lucide-eye">

Divider under.

---

Divider above.

</code-preview>
</code-group>

## `ProseImg`

<code-group>

```md [Code]
![A Cool Image](https://nuxt.com/assets/design-kit/icon-green.png)
```

<code-preview label="Preview" icon="i-lucide-eye">

![A Cool Image](https://nuxt.com/assets/design-kit/icon-green.png)

</code-preview>
</code-group>

## `ProseUl`

<code-group>

```md [Code]
- Just
- An
- Unordered
- List
```

<code-preview label="Preview" icon="i-lucide-eye">

- Just
- An
- Unordered
- List

</code-preview>
</code-group>

## `ProseLi`

<code-group>

```md [Code]
- List element
```

<code-preview label="Preview" icon="i-lucide-eye">

- List element

</code-preview>
</code-group>

## `ProseOl`

<code-group>

```md [Code]
1. Foo
2. Bar
3. Baz
```

<code-preview label="Preview" icon="i-lucide-eye">

1. Foo
2. Bar
3. Baz

</code-preview>
</code-group>

## `ProseP`

<code-group>

```md [Code]
Just a paragraph.
```

<code-preview label="Preview" icon="i-lucide-eye">

Just a paragraph.

</code-preview>
</code-group>

## `ProseStrong`

<code-group>

```md [Code]
**Just a strong paragraph.**
```

<code-preview label="Preview" icon="i-lucide-eye">

**Just a strong paragraph.**

</code-preview>
</code-group>

## `ProseEm`

<code-group>

```md [Code]
_Just an italic paragraph._
```

<code-preview label="Preview" icon="i-lucide-eye">

*Just an italic paragraph.*

</code-preview>
</code-group>

## `ProseTable`

<code-group>

```md [Code]
| Key | Type      | Description |
| --- | --------- | ----------- |
| 1   | Wonderful | Table       |
| 2   | Wonderful | Data        |
| 3   | Wonderful | Website     |
```

<code-preview label="Preview" icon="i-lucide-eye">
<table>
<thead>
  <tr>
    <th>
      Key
    </th>
    
    <th>
      Type
    </th>
    
    <th>
      Description
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      1
    </td>
    
    <td>
      Wonderful
    </td>
    
    <td>
      Table
    </td>
  </tr>
  
  <tr>
    <td>
      2
    </td>
    
    <td>
      Wonderful
    </td>
    
    <td>
      Data
    </td>
  </tr>
  
  <tr>
    <td>
      3
    </td>
    
    <td>
      Wonderful
    </td>
    
    <td>
      Website
    </td>
  </tr>
</tbody>
</table>
</code-preview>
</code-group>

## `ProseTbody`

Included in **ProseTable** example.

## `ProseTd`

Included in **ProseTable** example.

## `ProseTh`

Included in **ProseTable** example.

## `ProseThead`

Included in **ProseTable** example.

## `ProseTr`

Included in **ProseTable** example.

<callout icon="i-simple-icons-github" to="https://github.com/nuxt-modules/mdc/tree/main/src/runtime/components/prose">

Checkout the source code for these components on GitHub.

</callout>

<style>

html pre.shiki code .sMK4o, html code.shiki .sMK4o{--shiki-light:#39ADB5;--shiki-default:#89DDFF;--shiki-dark:#89DDFF}html pre.shiki code .sfazB, html code.shiki .sfazB{--shiki-light:#91B859;--shiki-default:#C3E88D;--shiki-dark:#C3E88D}html pre.shiki code .sDpXG, html code.shiki .sDpXG{--shiki-light:#E53935;--shiki-light-text-decoration:underline;--shiki-default:#F07178;--shiki-default-text-decoration:underline;--shiki-dark:#F07178;--shiki-dark-text-decoration:underline}html .light .shiki span {color: var(--shiki-light);background: var(--shiki-light-bg);font-style: var(--shiki-light-font-style);font-weight: var(--shiki-light-font-weight);text-decoration: var(--shiki-light-text-decoration);}html.light .shiki span {color: var(--shiki-light);background: var(--shiki-light-bg);font-style: var(--shiki-light-font-style);font-weight: var(--shiki-light-font-weight);text-decoration: var(--shiki-light-text-decoration);}html .default .shiki span {color: var(--shiki-default);background: var(--shiki-default-bg);font-style: var(--shiki-default-font-style);font-weight: var(--shiki-default-font-weight);text-decoration: var(--shiki-default-text-decoration);}html .shiki span {color: var(--shiki-default);background: var(--shiki-default-bg);font-style: var(--shiki-default-font-style);font-weight: var(--shiki-default-font-weight);text-decoration: var(--shiki-default-text-decoration);}html .dark .shiki span {color: var(--shiki-dark);background: var(--shiki-dark-bg);font-style: var(--shiki-dark-font-style);font-weight: var(--shiki-dark-font-weight);text-decoration: var(--shiki-dark-text-decoration);}html.dark .shiki span {color: var(--shiki-dark);background: var(--shiki-dark-bg);font-style: var(--shiki-dark-font-style);font-weight: var(--shiki-dark-font-weight);text-decoration: var(--shiki-dark-text-decoration);}html pre.shiki code .sCNwf, html code.shiki .sCNwf{--shiki-light:#FF5370;--shiki-light-font-style:italic;--shiki-default:#FF9CAC;--shiki-default-font-style:italic;--shiki-dark:#FF9CAC;--shiki-dark-font-style:italic}html pre.shiki code .s7zQu, html code.shiki .s7zQu{--shiki-light:#39ADB5;--shiki-light-font-style:italic;--shiki-default:#89DDFF;--shiki-default-font-style:italic;--shiki-dark:#89DDFF;--shiki-dark-font-style:italic}html pre.shiki code .sJsPd, html code.shiki .sJsPd{--shiki-light:#90A4AE90;--shiki-default:#EEFFFF90;--shiki-dark:#BABED890}html pre.shiki code .spNyl, html code.shiki .spNyl{--shiki-light:#9C3EDA;--shiki-default:#C792EA;--shiki-dark:#C792EA}html pre.shiki code .sTEyZ, html code.shiki .sTEyZ{--shiki-light:#90A4AE;--shiki-default:#EEFFFF;--shiki-dark:#BABED8}html pre.shiki code .s2Zo4, html code.shiki .s2Zo4{--shiki-light:#6182B8;--shiki-default:#82AAFF;--shiki-dark:#82AAFF}html pre.shiki code .swJcz, html code.shiki .swJcz{--shiki-light:#E53935;--shiki-default:#F07178;--shiki-dark:#F07178}html pre.shiki code .sbssI, html code.shiki .sbssI{--shiki-light:#F76D47;--shiki-default:#F78C6C;--shiki-dark:#F78C6C}html pre.shiki code .sBMFI, html code.shiki .sBMFI{--shiki-light:#E2931D;--shiki-default:#FFCB6B;--shiki-dark:#FFCB6B}html pre.shiki code .sQLHv, html code.shiki .sQLHv{--shiki-light:#90A4AE;--shiki-light-text-decoration:underline;--shiki-default:#EEFFFF;--shiki-default-text-decoration:underline;--shiki-dark:#BABED8;--shiki-dark-text-decoration:underline}html pre.shiki code .sHepR, html code.shiki .sHepR{--shiki-light:#39ADB5;--shiki-light-font-weight:bold;--shiki-default:#89DDFF;--shiki-default-font-weight:bold;--shiki-dark:#89DDFF;--shiki-dark-font-weight:bold}html pre.shiki code .so75L, html code.shiki .so75L{--shiki-light:#E53935;--shiki-light-font-weight:bold;--shiki-default:#F07178;--shiki-default-font-weight:bold;--shiki-dark:#F07178;--shiki-dark-font-weight:bold}html pre.shiki code .s5tWE, html code.shiki .s5tWE{--shiki-light:#E53935;--shiki-light-font-style:italic;--shiki-default:#F07178;--shiki-default-font-style:italic;--shiki-dark:#F07178;--shiki-dark-font-style:italic}

</style>

---

- [Source](https://github.com/nuxt-modules/mdc/tree/main/src/runtime/components/prose)
