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
        return () =>
            h(
                "figure",
                {
                    class: "not-prose my-6 min-w-0 rounded-xl border border-outline bg-secondary p-4 text-on-secondary",
                },
                [
                    h(ClientOnly, null, {
                        default: () =>
                            h(LazyEchartsRenderer, {
                                option:
                                    props.option ??
                                    props.code ??
                                    readSource(slots.default?.()),
                                height: props.height,
                                renderer: props.renderer,
                                label: props.label,
                                description: props.description,
                            }),
                        fallback: () =>
                            h(
                                "p",
                                {
                                    role: "status",
                                    class: "flex items-center justify-center",
                                    style: {
                                        height:
                                            typeof props.height === "number" ||
                                            /^\d+$/.test(props.height)
                                                ? `${props.height}px`
                                                : props.height,
                                    },
                                },
                                "Loading chart...",
                            ),
                    }),
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
    },
});
</script>
