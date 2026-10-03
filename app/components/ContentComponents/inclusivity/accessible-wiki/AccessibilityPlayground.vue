<script setup lang="ts">
import { ref, useId } from "vue";
import { Icon } from "@iconify/vue";
import SearchBar from "~/components/SearchBar.vue";
import ProseEm from "~/components/content/ProseEm.vue";
import CollapsibleParagraph from "~/components/ContentComponents/CollapsibleParagraph.vue";
import {
    AccordionRoot,
    AccordionItem,
    AccordionHeader,
    AccordionTrigger,
    AccordionContent,
    SplitterGroup,
    SplitterPanel,
    SplitterResizeHandle,
    TabsRoot,
    TabsList,
    TabsTrigger,
    TabsContent,
    TreeRoot,
    TreeItem,
} from "reka-ui";

const id = `accessibility-${useId()}`;
const panelSize = ref(50);
const selectedTab = ref("structure");
function focusExample(event: MouseEvent, selector: string) {
    const button = event.currentTarget as HTMLButtonElement;
    const example = button.closest(".example");
    const target = selector
        .split(",")
        .map((candidate) => example?.querySelector<HTMLElement>(candidate))
        .find((element) => element);
    target?.focus();
}
const selectedItem = ref<{
    id: string;
    title: string;
    children?: { id: string; title: string }[];
}>();
const folders = [
    {
        id: "models",
        title: "Models",
        children: [
            { id: "binder", title: "Binder model" },
            { id: "precursor", title: "Precursor model" },
        ],
    },
    {
        id: "notes",
        title: "Notes",
        children: [{ id: "readme", title: "Reading guide" }],
    },
];
const sections = [
    {
        value: "project",
        title: "Project overview",
        text: "An accordion groups related sections. Each heading is a button that reveals its section.",
    },
    {
        value: "methods",
        title: "Methods",
        text: "You can open several sections here. Arrow keys move between headings; opening a section keeps focus on its heading.",
    },
];
</script>

<template>
    <section class="a11y-playground" aria-label="Keyboard component examples">
        <div class="examples">
            <section class="example wide" :aria-labelledby="`${id}-splitter`">
                <h2 :id="`${id}-splitter`">Splitter</h2>
                <p>
                    A movable divider changes how much space two panels take up.
                    Used in View Binder and View Model.
                </p>
                <p class="instructions" :id="`${id}-splitter-help`">
                    Try it: Tab to the divider, then press <kbd>←</kbd> /
                    <kbd>→</kbd> to resize. <kbd>Home</kbd> /
                    <kbd>End</kbd> jumps to the smallest / largest allowed size.
                    You can also drag it.
                </p>
                <button
                    type="button"
                    class="control practice-button"
                    @click="focusExample($event, '.divider')"
                >
                    Focus to Splitter
                </button>
                <SplitterGroup
                    :id="`${id}-panels`"
                    direction="horizontal"
                    class="splitter"
                    :style="{ height: 'auto', overflow: 'visible' }"
                >
                    <SplitterPanel
                        :id="`${id}-list`"
                        :default-size="50"
                        :min-size="25"
                        @resize="panelSize = $event"
                    >
                        <div class="pane">
                            <strong>Model list</strong
                            ><span
                                >{{ Math.round(panelSize) }}% of the space</span
                            >
                        </div>
                    </SplitterPanel>
                    <SplitterResizeHandle
                        :id="`${id}-divider`"
                        class="divider"
                        aria-label="Resize model list and preview"
                        :aria-describedby="`${id}-splitter-help`"
                        ><span aria-hidden="true">⋮</span></SplitterResizeHandle
                    >
                    <SplitterPanel
                        :id="`${id}-preview`"
                        :default-size="50"
                        :min-size="25"
                    >
                        <div class="pane">
                            <strong>Model preview</strong
                            ><span
                                >{{ Math.round(100 - panelSize) }}% of the
                                space</span
                            >
                        </div>
                    </SplitterPanel>
                </SplitterGroup>
            </section>

            <section class="example" :aria-labelledby="`${id}-accordion`">
                <h2 :id="`${id}-accordion`">Accordion</h2>
                <p>
                    A group of expandable sections, like parent documents in the
                    sidebar menu.
                </p>
                <p class="instructions">
                    Try it: <kbd>Enter</kbd> / <kbd>Space</kbd> opens or closes
                    a section. <kbd>↑</kbd> / <kbd>↓</kbd> moves between
                    headings; <kbd>Home</kbd> / <kbd>End</kbd> goes to the first
                    / last.
                </p>
                <button
                    type="button"
                    class="control practice-button"
                    @click="focusExample($event, '.accordion-heading button')"
                >
                    Focus to Accordion
                </button>
                <AccordionRoot type="multiple" class="demo">
                    <AccordionItem
                        v-for="section in sections"
                        :key="section.value"
                        :value="section.value"
                    >
                        <AccordionHeader as="h3" class="accordion-heading"
                            ><AccordionTrigger class="control row"
                                >{{ section.title
                                }}<span class="chevron" aria-hidden="true"
                                    >⌄</span
                                ></AccordionTrigger
                            ></AccordionHeader
                        >
                        <AccordionContent class="revealed">{{
                            section.text
                        }}</AccordionContent>
                    </AccordionItem>
                </AccordionRoot>
            </section>

            <section class="example" :aria-labelledby="`${id}-collapsible`">
                <h2 :id="`${id}-collapsible`">Collapsible</h2>
                <p>
                    One independent show/hide control for extra detail, like a
                    collapsible paragraph.
                </p>
                <p class="instructions">
                    Try it: Focus the button and press <kbd>Enter</kbd> or
                    <kbd>Space</kbd>. Unlike an accordion, there is no group of
                    headings to navigate with arrow keys.
                </p>
                <button
                    type="button"
                    class="control practice-button"
                    @click="focusExample($event, '.compact-collapsible button')"
                >
                    Focus to Collapsible
                </button>
                <CollapsibleParagraph
                    title="Reading note"
                    heading-tag="h3"
                    class="demo compact-collapsible"
                >
                    <p>
                        The note is now visible. Focus stays on the button so
                        you can close it again with the same key.
                    </p>
                </CollapsibleParagraph>
            </section>

            <section class="example" :aria-labelledby="`${id}-dialog`">
                <h2 :id="`${id}-dialog`">Dialog</h2>
                <p>
                    A window over the page for a focused task. This is the
                    wiki’s actual search dialog: you can search the site here.
                </p>
                <p class="instructions">
                    Try it: Open with <kbd>Enter</kbd> / <kbd>Space</kbd>.
                    <kbd>Tab</kbd> and <kbd>Shift</kbd> + <kbd>Tab</kbd> stay
                    inside. <kbd>Esc</kbd> closes it and returns focus to the
                    opening button.
                </p>
                <button
                    type="button"
                    class="control practice-button"
                    @click="focusExample($event, '.dialog-trigger')"
                >
                    Focus to Dialog
                </button>
                <SearchBar :enable-shortcut="false">
                    <template #trigger>
                        <button
                            type="button"
                            class="dialog-trigger search-preview"
                            aria-label="Search wiki from playground"
                        >
                            <Icon icon="lucide:search" aria-hidden="true" />
                            <span>Search wiki…</span>
                        </button>
                    </template>
                </SearchBar>
            </section>

            <section class="example" :aria-labelledby="`${id}-tabs`">
                <h2 :id="`${id}-tabs`">Tabs</h2>
                <p>
                    Switch between related views in the same space, like the
                    right panel in View Binder and View Model.
                </p>
                <p class="instructions">
                    Try it: Tab to the selected tab, then <kbd>←</kbd> /
                    <kbd>→</kbd> to switch views. <kbd>Home</kbd> /
                    <kbd>End</kbd> selects the first / last tab. Tab again to
                    reach the panel.
                </p>
                <button
                    type="button"
                    class="control practice-button"
                    @click="
                        focusExample($event, '[role=tab][aria-selected=true]')
                    "
                >
                    Focus to Tabs
                </button>
                <TabsRoot
                    v-model="selectedTab"
                    activation-mode="automatic"
                    class="demo model-tabs"
                >
                    <TabsList aria-label="Example model views" class="tab-list"
                        ><TabsTrigger class="model-tab" value="structure"
                            >Structure</TabsTrigger
                        ><TabsTrigger class="model-tab" value="details"
                            >Details</TabsTrigger
                        ></TabsList
                    >
                    <TabsContent value="structure" class="tab-panel"
                        >Structure view: this area would show a model. Switch to
                        Details to see a different view without leaving the
                        page.</TabsContent
                    >
                    <TabsContent value="details" class="tab-panel"
                        >Details view: Binder model, example entry. Only the
                        selected tab’s panel is displayed.</TabsContent
                    >
                </TabsRoot>
            </section>

            <section class="example" :aria-labelledby="`${id}-tooltip`">
                <h2 :id="`${id}-tooltip`">Tooltip</h2>
                <p>
                    A short explanation attached to a control, like an inline
                    annotation. The underlined term below uses the wiki’s
                    glossary tooltip.
                </p>
                <p class="instructions">
                    Try it: Tab to “Markdown” to reveal the tip, or hover over
                    it. <kbd>Esc</kbd> dismisses it; <kbd>Tab</kbd> moves on.
                </p>
                <button
                    type="button"
                    class="control practice-button"
                    @click="focusExample($event, '.tooltip-example button')"
                >
                    Focus to Tooltip
                </button>
                <p class="tooltip-example">
                    Our wiki documents are written in
                    <ProseEm>Markdown</ProseEm>.
                </p>
            </section>

            <section class="example" :aria-labelledby="`${id}-tree`">
                <h2 :id="`${id}-tree`">Tree</h2>
                <p>
                    A nested list of folders and items, used to browse models
                    and directories in View Binder.
                </p>
                <p class="instructions">
                    Try it: <kbd>↑</kbd> / <kbd>↓</kbd> moves through visible
                    items. <kbd>→</kbd> opens a folder or enters it;
                    <kbd>←</kbd> closes it or goes to its parent.
                    <kbd>Enter</kbd> / <kbd>Space</kbd> selects a file.
                    <kbd>Home</kbd> / <kbd>End</kbd> goes to the first / last
                    item.
                </p>
                <button
                    type="button"
                    class="control practice-button"
                    @click="
                        focusExample(
                            $event,
                            '[role=treeitem][aria-selected=true], [role=treeitem]',
                        )
                    "
                >
                    Focus to Tree
                </button>
                <TreeRoot
                    as="div"
                    v-slot="{ flattenItems }"
                    v-model="selectedItem"
                    :items="folders"
                    :get-key="(item) => item.id"
                    aria-label="Practice model browser"
                    class="demo tree"
                >
                    <TreeItem
                        v-for="item in flattenItems"
                        :key="item._id"
                        v-slot="{ isExpanded }"
                        v-bind="item.bind"
                        as="button"
                        type="button"
                        class="tree-item"
                        @select="item.hasChildren && $event.preventDefault()"
                        :style="{
                            paddingInlineStart: `${(item.level - 1) * 1.25 + 0.75}rem`,
                        }"
                    >
                        <Icon
                            v-if="item.hasChildren"
                            icon="lucide:chevron-right"
                            class="tree-chevron"
                            :class="{ 'is-expanded': isExpanded }"
                            aria-hidden="true"
                        />
                        <span v-else class="tree-chevron" aria-hidden="true" />
                        <Icon
                            :icon="
                                item.hasChildren
                                    ? isExpanded
                                        ? 'lucide:folder-open'
                                        : 'lucide:folder'
                                    : 'solar:dna-bold'
                            "
                            class="tree-icon"
                            aria-hidden="true"
                        />
                        <span class="tree-label">{{ item.value.title }}</span>
                    </TreeItem>
                </TreeRoot>
                <p role="status" class="tree-status">
                    Selected: {{ selectedItem?.title || "nothing yet" }}.
                </p>
            </section>
        </div>
        <p :id="`${id}-end`" tabindex="-1" class="playground-end">
            End of playground. You can keep reading, or move back to try another
            example.
        </p>
    </section>
</template>

<style scoped>
.a11y-playground {
    margin-block: 2rem;
    color: var(--on-surface);
    line-height: 1.6;
    min-width: 0;
}
.a11y-playground h2 {
    color: var(--accent);
    font-size: 1.3rem;
    font-weight: 700;
    margin: 0 0 0.75rem;
}
.a11y-playground p {
    margin: 0.75rem 0;
}
.examples {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
}
.example {
    min-width: 0;
    padding: clamp(1rem, 2vw, 1.5rem);
    border: 1px solid var(--outline);
    border-radius: 1rem;
    background: var(--surface);
}
.wide {
    grid-column: 1 / -1;
}
.instructions {
    font-size: 0.9rem;
}
.a11y-playground .tooltip-example {
    margin-block-start: 8rem;
}
kbd {
    background: var(--accent);
    color: var(--on-accent);
    display: inline-block;
    padding: 0 0.3rem;
    border: 1px solid currentColor;
    border-bottom-width: 2px;
    border-radius: 0.25rem;
    font: inherit;
    font-size: 0.85em;
}
.control {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-height: 44px;
    padding: 0.55rem 0.85rem;
    border: 1px solid var(--outline);
    border-radius: 0.5rem;
    background: var(--surface-elevated);
    color: var(--on-surface);
    font: inherit;
    font-weight: 600;
    cursor: pointer;
    white-space: normal;
    text-align: start;
}
.control:hover {
    text-decoration: underline;
}
.practice-button {
    display: flex;
    width: fit-content;
    margin-block: 1rem;
    background: var(--accent);
    color: var(--on-accent);
}
.a11y-playground :deep(:focus) {
    outline: 3px solid var(--accent);
    outline-offset: 3px;
}
.demo {
    margin-top: 1rem;
}
.accordion-heading {
    margin: 0;
    font: inherit;
}
.row {
    width: 100%;
    justify-content: space-between;
    margin-top: 0.5rem;
}
.row[data-state="open"] .chevron {
    transform: rotate(180deg);
}
.revealed {
    padding: 1rem;
    border-inline-start: 3px solid var(--outline);
    margin: 0.5rem 0;
}
.splitter {
    min-height: 9rem;
    margin-top: 1.25rem;
    border: 1px solid var(--outline);
    border-radius: 0.5rem;
}
.pane {
    padding: 1rem 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
    overflow-wrap: anywhere;
}
.pane span {
    font-size: 0.85rem;
}
.divider {
    display: grid;
    place-items: center;
    flex: 0 0 24px;
    background: var(--accent);
    color: var(--on-accent);
    cursor: col-resize;
}
.divider:focus-visible {
    outline-color: var(--accent);
}
.tab-list {
    display: flex;
    gap: 0.25rem;
    padding: 0.25rem;
    border-bottom: 1px solid var(--surface-bright);
    background: var(--surface-elevated);
    font-family: var(--font-momo-trust-display);
}
.model-tabs {
    margin-inline-end: 0.75rem;
    margin-bottom: 0.75rem;
    border: 1px solid var(--surface-bright);
    border-radius: 0.75rem;
    background: var(--secondary);
    color: var(--on-secondary);
    box-shadow: 12px 12px 0 var(--primary);
}
.model-tabs .tab-list {
    border-radius: 0.75rem 0.75rem 0 0;
}
.model-tab {
    flex: 1;
    min-width: 0;
    min-height: 44px;
    padding: 0.5rem;
    border-radius: 999px;
    color: var(--primary);
    cursor: pointer;
    font-size: 0.875rem;
    line-height: 1.25;
}
.model-tab:hover {
    background: color-mix(in srgb, var(--primary) 20%, transparent);
}
.tab-list [data-state="active"] {
    background: var(--primary);
    color: var(--on-primary);
}
.tab-panel {
    padding: 1rem;
}
.tree {
    padding: 0.5rem;
    border: 1px solid var(--surface-bright);
    border-radius: 0.75rem;
    background: var(--secondary);
    color: var(--on-secondary);
    font-family: var(--font-momo-trust-display);
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
}
.tree-item {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    min-height: 2rem;
    width: 100%;
    min-width: 0;
    padding: 0.25rem 0.5rem;
    text-align: start;
    font-size: 0.875rem;
    cursor: pointer;
    border-radius: 0.25rem;
    overflow-wrap: anywhere;
}
.tree-item:hover {
    background: color-mix(in srgb, var(--primary) 20%, transparent);
}
.tree-item[data-selected] {
    background: var(--primary);
    color: var(--on-primary);
}
.tree-chevron,
.tree-icon {
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
}
.tree-chevron.is-expanded {
    transform: rotate(90deg);
}
.tree-label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.tree-status {
    font-size: 0.9rem;
}
.playground-end {
    padding: 1rem 0;
    scroll-margin-top: 8rem;
}
.search-preview {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    min-height: 44px;
    padding: 0.5rem 1rem;
    border: 2px solid var(--accent);
    border-radius: 999px;
    background: var(--secondary);
    color: var(--on-secondary);
    cursor: pointer;
    text-align: start;
}
.search-preview svg {
    width: 1.25rem;
    height: 1.25rem;
    flex-shrink: 0;
}
.search-preview:hover {
    background: var(--surface-navigation);
    color: var(--on-surface);
}
.compact-collapsible {
    margin-bottom: 1rem;
}
.compact-collapsible :deep(h3) {
    gap: 0.75rem;
    margin: 0;
}
.compact-collapsible :deep(h3 button > span) {
    font-size: 1rem;
    margin: 0.375rem 0.75rem;
    padding: 0.375rem;
}
.compact-collapsible :deep(h3 button svg) {
    width: 1.25rem;
    height: 1.25rem;
}
.compact-collapsible :deep(h3 > span) {
    margin-block: 1rem;
    min-width: 0.75rem;
}
.compact-collapsible :deep(.content) {
    font-size: 0.95rem;
    border-radius: 1rem;
}
@media (max-width: 700px) {
    .examples {
        grid-template-columns: minmax(0, 1fr);
    }
}
@media (forced-colors: active) {
    .control,
    .divider,
    .tree-item {
        border: 1px solid ButtonText;
    }
}
</style>
