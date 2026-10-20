import type { Plugin } from "vite";
import { fontAssetUrl } from "../font-assets";

export function externalizeKatexFonts(code: string): string {
    return code
        .replace(/font-display\s*:\s*\w+/g, "font-display: swap")
        .replace(/src\s*:\s*([^;}]+)/g, (declaration, sources: string) => {
            const woff2 = sources
                .split(",")
                .filter((source) =>
                    /format\(\s*["']?woff2["']?\s*\)/.test(source),
                )
                .join(",");

            return woff2 ? `src: ${woff2}` : declaration;
        })
        .replace(
            /url\(\s*(["']?)(?:\.\/)?fonts\/([^"')]+\.woff2)\1\s*\)/g,
            (_url, _quote, filename: string) =>
                `url("${fontAssetUrl(filename)}")`,
        );
}

/** Rewrite before Vite resolves CSS URLs so no local fonts become build assets. */
export function katexFontsPlugin(): Plugin {
    return {
        name: "katex-fonts",
        enforce: "pre",
        transform(code, id) {
            if (
                !/[/\\]katex[/\\]dist[/\\]katex(?:\.min)?\.css(?:\?|$)/.test(id)
            ) {
                return;
            }
            return { code: externalizeKatexFonts(code), map: null };
        },
    };
}
