import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import * as echarts from "echarts";
import { compileScript, compileTemplate, parse } from "@vue/compiler-sfc";
import ts from "typescript";
import { defineComponent, h, isVNode, Fragment } from "vue";
import { parseEchartsOption } from "../app/utils/echarts-option.ts";

test("accepts assignment, declarations, and bare object options", () => {
    for (const prefix of [
        "option = ",
        "const option = ",
        "let option = ",
        "var option = ",
        "",
    ]) {
        assert.deepEqual(
            parseEchartsOption(`${prefix}{ series: [] };`, echarts),
            { series: [] },
        );
    }
    const object = { series: [] };
    assert.equal(parseEchartsOption(object, echarts), object);
});

test("preserves callbacks, expressions, comments, and ECharts helpers", () => {
    const option = parseEchartsOption(
        `option = {
        // JavaScript syntax is preserved.
        tooltip: { formatter: (params) => params.value.toFixed(2) },
        series: [{ type: 'bar', data: [1, 2].map(value => value * 2),
            itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'red' }, { offset: 1, color: 'blue' },
            ]) },
        }],
    };`,
        echarts,
    );
    assert.equal(option.tooltip.formatter({ value: 1.234 }), "1.23");
    assert.deepEqual(option.series[0].data, [2, 4]);
    assert.equal(option.series[0].itemStyle.color.type, "linear");
});

test("rejects empty, malformed, and non-object configurations", () => {
    for (const source of [
        "",
        "option = {",
        "option = null",
        "option = []",
        "option = 1",
    ]) {
        assert.throws(() => parseEchartsOption(source, echarts));
    }
});

test("full ECharts import renders chart types beyond the existing Nuxt subset", () => {
    const options = [
        {
            xAxis: { data: ["A", "B"] },
            yAxis: {},
            series: [{ type: "bar", data: [2, 4] }],
        },
        {
            series: [
                {
                    type: "pie",
                    data: [
                        { name: "A", value: 2 },
                        { name: "B", value: 4 },
                    ],
                },
            ],
        },
        {
            xAxis: {},
            yAxis: {},
            series: [
                {
                    type: "scatter",
                    data: [
                        [1, 2],
                        [3, 4],
                    ],
                },
            ],
        },
        { series: [{ type: "gauge", data: [{ value: 42 }] }] },
        {
            radar: {
                indicator: [
                    { name: "A", max: 10 },
                    { name: "B", max: 10 },
                    { name: "C", max: 10 },
                ],
            },
            series: [{ type: "radar", data: [{ value: [2, 4, 6] }] }],
        },
        {
            dataset: {
                source: [
                    ["day", "sales"],
                    ["Mon", 12],
                    ["Tue", 18],
                ],
            },
            xAxis: { type: "category" },
            yAxis: {},
            toolbox: { feature: { restore: {} } },
            dataZoom: [{ type: "slider" }],
            series: [{ type: "bar" }],
        },
    ];
    for (const option of options) {
        const chart = echarts.init(null, null, {
            renderer: "svg",
            ssr: true,
            width: 600,
            height: 400,
        });
        try {
            chart.setOption(
                parseEchartsOption(
                    `option = ${JSON.stringify(option)};`,
                    echarts,
                ),
            );
            assert.match(chart.renderToSVGString(), /<path/);
        } finally {
            chart.dispose();
        }
    }
});

test("MDC wrapper extracts original code through fragments and slot wrappers", () => {
    const source = readFileSync(
        new URL("../app/components/content/Echarts.vue", import.meta.url),
        "utf8",
    );
    const { descriptor } = parse(source);
    const compiled = ts.transpileModule(descriptor.script.content, {
        compilerOptions: { module: ts.ModuleKind.ESNext },
    }).outputText;
    const component = new Function(
        "defineComponent",
        "h",
        "isVNode",
        "ClientOnly",
        "LazyEchartsRenderer",
        compiled
            .replace(/^import .*;\s*$/gm, "")
            .replace("export default", "return"),
    )(defineComponent, h, isVNode, defineComponent({}), defineComponent({}));
    const code =
        "option = { series: [{ type: 'pie', data: [{ value: 4 }] }] };";
    const slot = () => [
        h(Fragment, null, [
            h(defineComponent({}), null, {
                default: () => [
                    h(
                        defineComponent({}),
                        { code },
                        { default: () => "highlighted text" },
                    ),
                ],
            }),
        ]),
    ];
    const render = component.setup(
        { height: 400, renderer: "svg", label: "Test" },
        { slots: { default: slot } },
    );
    const figure = render();
    const renderer = figure.children[0].children.default();
    assert.equal(renderer.props.option, code);
    assert.equal(
        parseEchartsOption(renderer.props.option, echarts).series[0].type,
        "pie",
    );
});

test("changed Vue components compile successfully", () => {
    for (const file of [
        "content/Echarts.vue",
        "EchartsRenderer.client.vue",
        "content/ProsePre.vue",
        "CodeGroup.vue",
    ]) {
        const filename = new URL(`../app/components/${file}`, import.meta.url);
        const { descriptor, errors } = parse(readFileSync(filename, "utf8"), {
            filename: file,
        });
        assert.deepEqual(errors, []);
        const script = compileScript(descriptor, { id: file });
        const transformed = ts.transpileModule(script.content, {
            reportDiagnostics: true,
            compilerOptions: { module: ts.ModuleKind.ESNext },
        });
        assert.equal(transformed.diagnostics.length, 0);
        if (descriptor.template) {
            const template = compileTemplate({
                source: descriptor.template.content,
                filename: file,
                id: file,
                compilerOptions: { bindingMetadata: script.bindings },
            });
            assert.deepEqual(template.errors, []);
        }
    }
});
