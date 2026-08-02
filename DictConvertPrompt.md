# JSON-to-Markdown Dict Conversion Prompt

Use the following prompt to add a JSON or JSONC configuration file to an existing Markdown document in this repository.

````text
You are editing a Markdown file in a Nuxt Content repository.

Inputs:
- Target Markdown file: <MARKDOWN_PATH>
- Section title: <SECTION_TITLE>
- Code-group label: <CODE_GROUP_LABEL>
- Sync key: <UNIQUE_SYNC_KEY>
- Source JSON or JSONC:
<SOURCE_JSON>

Update the target Markdown file using these rules:

1. Insert the content at the most relevant location, or update the matching section if it already exists. Do not duplicate an existing section and do not alter unrelated content.
2. Preserve every JSON key, value, nesting relationship, and key order. Use two-space indentation in the configuration block.
3. Preserve useful source comments. Translate every non-English comment into concise, natural English while keeping its original technical meaning. Do not invent comments or change configuration values during translation.
4. Wrap the result in a Nuxt Content `::code-group`. Put the `Summary` tab first and the `Configuration` tab second, and set `default-value: "0"` so Summary is selected by default.
5. Write the Summary as a standard Python dictionary in a `dict` code fence. Select the most useful human-readable fields from the configuration, normally 3–8 entries. Keep it flat when possible. It may contain at most one nested dictionary level; each top-level nested key becomes a visible group heading.
6. Summary keys should be short title-style English labels. Summary values may clarify ranges, units, or intent for readability, but must remain faithful to the source. Do not include implementation-only detail unless it is essential for understanding the configuration.
7. Write the complete source configuration in a `JSON` code fence. JSONC-style `//` comments are allowed because the block is documentation, even though comments are not part of strict JSON.
8. Use the exact structure below. Replace every placeholder and return only the completed Markdown change, with no additional explanation.

::code-group
---
default-value: "0"
label: <CODE_GROUP_LABEL>
sync: <UNIQUE_SYNC_KEY>
---
```dict [Summary]
{"Key": "Value"}
```

```JSON [Configuration]
{
  "key": "value"
}
```
::
````
