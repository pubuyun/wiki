# Code Conversion and Vue Flow Documentation Prompt

You are given source code that must be cleaned and documented as a concise flowchart-and-code presentation for a Nuxt Content site.

Return the converted source code and its matching workflow using the MDC structure defined below. The result must be understandable without access to the original conversation.

## Code conversion rules

1. Translate all Chinese text into clear, natural English. This includes printed messages, user-facing strings, identifiers when appropriate, and descriptive labels.
2. Remove every code comment, including inline comments, block comments, section dividers, commented-out code, and explanatory headers.
3. Preserve the original behavior unless a correction is required to make the code valid and executable.
4. Preserve the requested filename and display it in the code-fence filename annotation.
5. Fix obvious transcription or syntax errors, such as an invalid Python `if __name__ == "__main__":` guard.
6. Keep the result concise and consistently formatted.
7. Do not add explanations inside the source code.
8. Use Nuxt Content's built-in Shiki syntax highlighting. Do not add `highlight.js`, `hljs` classes, custom token colors, or another runtime highlighter.
9. Use the standard Shiki `github-light` background in light mode and `github-dark` background in dark mode. Do not introduce a custom blue code background.

## Flowchart content rules

1. Produce a simplified overview of the program, not a line-by-line translation.
2. Use no more than 10 nodes. Prefer approximately 5–8 nodes whenever possible.
3. Combine closely related configuration, initialization, validation, and discovery operations into broader steps.
4. Replace patterns such as `Files found? -> print warning -> return` with one process such as `Check file existence`. Do not add branches whose only purpose is printing a message or returning early.
5. Keep only decisions that materially change the main workflow.
6. Preserve important iteration as an explicit loop:
    - Use a `decision` node for the loop condition.
    - Label its outgoing branches `Yes` and `No`.
    - Connect the `Yes` branch back to the repeated step.
    - Set the backward edge to `"type": "loop"`.
7. Use short, action-oriented English labels.
8. Do not add a separate diagram title above the graph.
9. Do not manually specify node positions, diagram height, or node dimensions unless explicitly requested. The reusable layout utility calculates them.
10. Default to a left-to-right layout. Omit `direction` to use the default, or explicitly use `"direction": "left-right"` when clarity is needed.
11. Node height is calculated from its label and must expand when text wraps. Do not force a height that causes text overflow.
12. Keep the main success path visually direct and easy to scan.

## Vue Flow JSON rules

The flowchart is Vue Flow JSON consumed by the custom `CodeFlowchart` component. It is not Mermaid, Graphviz, or the format used by `ContentGraph.client.vue`.

1. Put the definition inside a fenced code block whose language is exactly `graph`.
2. The fence content must be strict, valid JSON with top-level `nodes` and `edges` arrays.
3. Use double quotes for all JSON keys and string values.
4. Do not use comments or trailing commas in the JSON.
5. Every node requires a unique string `id`, a supported `type`, and an English `label`.
6. Supported node types are:
    - `start`
    - `end`
    - `process`
    - `decision`
    - `input`
    - `output`
    - `loop`
    - `subprocess`
    - `document`
    - `database`
7. Every edge requires a unique `id`, a valid `source`, and a valid `target`.
8. Edge labels are optional. Use them primarily for decision results such as `Yes` and `No`.
9. Mark a backward or repeating edge with `"type": "loop"`.
10. Do not set Vue Flow renderer types such as `smoothstep` in the source JSON. The flowchart component selects the rendered edge style automatically.
11. The `graph` fence is automatically intercepted and rendered with `CodeFlowchart`; do not call `CodeFlowchart` or `ContentGraph` manually in the MDC document.

## MDC presentation rules

1. Wrap the flowchart and its source code in one `code-group` MDC component.
2. Do not use a separate `code-collapse` component. Collapse behavior is built into `code-group`.
3. Open the component with `::code-group{...}` and close it with `::` on its own line.
4. Put the `graph` fence first so the workflow is the initially selected tab.
5. Use `[Workflow]` as the graph tab label.
6. Put the converted source code in the next fence and use `[Filename.ext]` as its tab label.
7. For multiple implementations or languages, add additional source-code fences before the closing `::`.
8. Use a unique, stable `sync` value when tab selection should persist.
9. `code-group` supports both a single source language and multiple source languages.
10. Source-code tabs are initially collapsed and always provide collapse functionality.
11. Show the expand/collapse button only when a source-code tab is active. Do not show it for the workflow tab.
12. The collapsed code content plus its expand button must have the same total height as the flowchart.
13. The expand button is full-width, appears below the code, uses the project's surface color family, and has no gradient overlay.
14. The flowchart is shown at its complete calculated height and does not have a rounded outer border.
15. Do not manually write buttons, tabs, collapse containers, or graph-rendering components in the MDC output. The `code-group` and `graph` fence handle them.

## Required output structure

Use this exact structural pattern:

````mdc
::code-group{defaultValue="0" sync="unique-workflow-id" label="Workflow and source code"}

```graph [Workflow]
{
  "nodes": [
    {
      "id": "start",
      "type": "start",
      "label": "Start"
    },
    {
      "id": "prepare",
      "type": "input",
      "label": "Prepare paths and input files"
    },
    {
      "id": "select-item",
      "type": "loop",
      "label": "Select next item"
    },
    {
      "id": "run-task",
      "type": "subprocess",
      "label": "Run processing task"
    },
    {
      "id": "more-items",
      "type": "decision",
      "label": "More items?"
    },
    {
      "id": "complete",
      "type": "end",
      "label": "Complete"
    }
  ],
  "edges": [
    {
      "id": "start-prepare",
      "source": "start",
      "target": "prepare"
    },
    {
      "id": "prepare-select",
      "source": "prepare",
      "target": "select-item"
    },
    {
      "id": "select-run",
      "source": "select-item",
      "target": "run-task"
    },
    {
      "id": "run-more",
      "source": "run-task",
      "target": "more-items"
    },
    {
      "id": "more-yes",
      "source": "more-items",
      "target": "select-item",
      "label": "Yes",
      "type": "loop"
    },
    {
      "id": "more-no",
      "source": "more-items",
      "target": "complete",
      "label": "No"
    }
  ]
}
```

```python [BatchProcessor.py]
from pathlib import Path


def process_file(file_path):
    print(f"Processing {file_path.name}")


def main():
    files = list(Path("/data/input").glob("*.json"))

    for file_path in files:
        process_file(file_path)


if __name__ == "__main__":
    main()
```

::
````

For another language, replace the source fence or append another one, for example:

````mdc
```typescript [BatchProcessor.ts]
const files = await findFiles("/data/input")

for (const file of files) {
    await processFile(file)
}
```
````

## Final validation checklist

Before returning the result, verify all of the following:

- All Chinese text has been translated into English.
- All code comments have been removed.
- The converted code remains valid and preserves its behavior.
- The displayed filename is correct.
- The flowchart contains no more than 10 nodes.
- Trivial error-message and early-return branches have been merged into meaningful process nodes.
- Important decisions and loops are still represented.
- The loop has a backward edge with `"type": "loop"`.
- The graph definition is valid Vue Flow JSON, not Mermaid syntax.
- Node IDs and edge IDs are unique.
- Every edge references existing nodes.
- No manual positions, fixed diagram height, separate graph title, or unnecessary dimensions were added.
- The `graph` fence appears before the source-code fence.
- The MDC block uses one `::code-group ... ::` wrapper and no `code-collapse` wrapper.
- The output does not add `highlight.js`, custom highlighting, a blue code background, or manually implemented tabs and buttons.

Return the completed MDC block unless the user explicitly requests a different output format.
