<script lang="ts">
import { defineComponent, h, isVNode, type PropType } from "vue";
import type { EChartsOption } from "echarts";
import { ClientOnly, LazyEchartsRenderer } from "#components";

function readSource(value: unknown): string {
    if (typeof value === "string") return value;
    if (Array.isArray(value)) return value.map(readSource).join("");
    if (!isVNode(value)) return "";
    // MDC supplies the original, unhighlighted text on its ProsePre VNode.
    if (typeof value.props?.code === "string") return value.props.code;
    if (
        value.children &&
        typeof value.children === "object" &&
        !Array.isArray(value.children)
    ) {
        const slot = value.children.default;
        return typeof slot === "function" ? readSource(slot()) : "";
    }
    return readSource(value.children);
}

export default defineComponent({
    props: {
        option: [String, Object] as PropType<string | EChartsOption>,
        code: String,
        height: { type: [String, Number], default: 400 },
        renderer: {
            type: String as PropType<"svg" | "canvas">,
            default: "svg",
        },
        label: { type: String, default: "ECharts chart" },
        description: String,
    },
    setup(props, { slots }) {
        return () => {
            const height =
                typeof props.height === "number" || /^\d+$/.test(props.height)
                    ? `${props.height}px`
                    : props.height;

            return h(
                "figure",
                {
                    class: "not-prose my-6 min-w-0 rounded-xl border border-outline bg-secondary p-4 text-on-secondary",
                },
                [
                    h("div", { class: "min-w-0", style: { height } }, [
                        h(ClientOnly, null, {
                            default: () =>
                                h(LazyEchartsRenderer, {
                                    option:
                                        props.option ??
                                        props.code ??
                                        readSource(slots.default?.()),
                                    height: "100%",
                                    renderer: props.renderer,
                                    label: props.label,
                                    description: props.description,
                                }),
                            fallback: () =>
                                h(
                                    "p",
                                    {
                                        role: "status",
                                        class: "m-0 flex h-full items-center justify-center",
                                    },
                                    "Loading chart...",
                                ),
                        }),
                    ]),
                    props.description
                        ? h(
                              "figcaption",
                              {
                                  class: "mt-3 text-sm leading-relaxed",
                              },
                              props.description,
                          )
                        : null,
                ],
            );
        };
    },
});
</script>
