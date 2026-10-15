import type { MDCElement, MDCRoot } from "@nuxtjs/mdc";

const sourceLanguages = new Set([
    "graph",
    "vueflow",
    "vue-flow",
    "dict",
    "echarts",
    "echart",
]);

export function optimizeCodeTree(tree: MDCRoot) {
    function visit(parent: MDCRoot | MDCElement, needsSource = false) {
        for (const node of parent.children) {
            if (node.type !== "element") continue;

            // The ECharts wrapper also accepts ordinary JSON code in its slot.
            const tag = node.tag.replaceAll("-", "").toLowerCase();
            const readsSource =
                needsSource ||
                tag === "echarts" ||
                tag === "contentcomponentsecharts";

            if (node.tag === "pre" && typeof node.props?.code === "string") {
                const language = String(
                    node.props.language ?? "",
                ).toLowerCase();
                if (readsSource || sourceLanguages.has(language)) {
                    // These renderers consume the source, not the highlighted slot.
                    node.children = [];
                } else {
                    delete node.props.code;
                }
            }

            visit(node, readsSource);
        }
    }

    visit(tree);
    return tree;
}
