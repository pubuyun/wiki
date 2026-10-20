import { renumberCaptionBody, type CaptionBody } from "./document-captions";

interface DocumentBody {
    children?: unknown[];
    value?: unknown[];
}

const figureComponents = new Set([
    "lightbox-image",
    "lightbox-panels",
    "bilingual-image-panels",
]);

/** Number captioned figures before splitting a document into render sections. */
export function numberDocumentFigures<T extends DocumentBody>(body: T): T {
    let figureNumber = 0;

    function numberCaption(text: unknown, preserveNumber = false): unknown {
        if (typeof text !== "string" || !text.trim()) return text;

        // Some article series share figure numbers across separate pages.
        if (preserveNumber) {
            const explicitNumber = text.match(
                /^\s*Fig(?:ure)?\.?\s*(\d+)[a-z]?\b/i,
            );
            if (explicitNumber) figureNumber = Number(explicitNumber[1]);
            return text;
        }

        const description = text.replace(
            /^\s*(?:\*{1,2})?Fig(?:ure)?\.?\s*\d+\.?(?:\*{1,2})?\s*(?:[|:：—–-]\s*)?/i,
            "",
        );
        return `Fig. ${++figureNumber} | ${description}`;
    }

    function readProp(props: Record<string, unknown>, key: string): unknown {
        if (key in props) return props[key];
        const bound = props[`:${key}`];
        if (typeof bound !== "string") return undefined;
        try {
            return JSON.parse(bound);
        } catch {
            return undefined;
        }
    }

    function visit(node: unknown): unknown {
        if (!node || typeof node !== "object") return node;

        const tuple = Array.isArray(node);
        const element = node as {
            tag?: string;
            props?: Record<string, unknown>;
            children?: unknown[];
        };
        const tag = tuple ? node[0] : element.tag;
        const props = { ...(tuple ? node[1] : element.props) };
        const children = tuple ? node.slice(2) : element.children;
        const component = String(tag ?? "")
            .replace(/([a-z])([A-Z])/g, "$1-$2")
            .toLowerCase()
            .replace(/^content-components-/, "");
        const captionKey = component === "img" ? "title" : "caption";

        if (component === "img" || figureComponents.has(component)) {
            const preserveNumber =
                readProp(props, "preserveFigureNumber") === true;
            // This is a document-transform option, not a rendered attribute.
            delete props.preserveFigureNumber;
            delete props[":preserveFigureNumber"];
            const caption = readProp(props, captionKey);
            if (caption !== undefined) {
                const sources = readProp(props, "src");
                // A plain LightboxImage renders a figure per source; panel and
                // bilingual wrappers render one shared figure for their images.
                const separateImages =
                    component === "lightbox-image" &&
                    !children?.length &&
                    Array.isArray(sources);
                const numbered = separateImages
                    ? sources.map((_, index) =>
                          numberCaption(
                              Array.isArray(caption) ? caption[index] : caption,
                              preserveNumber,
                          ),
                      )
                    : numberCaption(
                          Array.isArray(caption) ? caption[0] : caption,
                          preserveNumber,
                      );

                if (`:${captionKey}` in props) {
                    props[`:${captionKey}`] = JSON.stringify(numbered);
                } else {
                    props[captionKey] = numbered;
                }

                const body = readProp(props, "captionBody") as
                    CaptionBody | undefined;
                if (body && !preserveNumber) {
                    const numberedBody = Array.isArray(numbered)
                        ? numbered.map((text, index) =>
                              renumberCaptionBody(
                                  Array.isArray(body) ? body[index] : body,
                                  text,
                              ),
                          )
                        : renumberCaptionBody(
                              Array.isArray(body) ? body[0] : body,
                              numbered,
                          );
                    props[":captionBody"] = JSON.stringify(numberedBody);
                    delete props.captionBody;
                }
            }
        }

        return tuple
            ? [tag, props, ...(children ?? []).map(visit)]
            : {
                  ...element,
                  props,
                  ...(children ? { children: children.map(visit) } : {}),
              };
    }

    return {
        ...body,
        ...(body.children ? { children: body.children.map(visit) } : {}),
        ...(body.value ? { value: body.value.map(visit) } : {}),
    };
}
