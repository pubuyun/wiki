import type { Feature, PlasmidRecord, Strand } from "@carabennemsi/plasmid";

export type SnapGeneFeature = Feature & {
    id?: string;
    qualifiers: Record<string, string[]>;
};

export type SnapGeneRecord = Omit<PlasmidRecord, "features"> & {
    features: SnapGeneFeature[];
    metadata: Record<string, string>;
};

const textDecoder = new TextDecoder();
const asciiDecoder = new TextDecoder("ascii");

function parseXml(xml: string, label: string) {
    const document = new DOMParser().parseFromString(xml, "application/xml");
    if (document.querySelector("parsererror")) {
        throw new Error(`The SnapGene ${label} packet contains invalid XML.`);
    }
    return document;
}

function stripMarkup(value: string) {
    const document = new DOMParser().parseFromString(value, "text/html");
    return (document.body.textContent ?? "").replace(/\s+/g, " ").trim();
}

function childElements(element: Element, tagName: string) {
    return Array.from(element.children).filter(
        (child) => child.tagName === tagName,
    );
}

function parseRange(value: string | null) {
    const match = value?.match(/^(\d+)-(\d+)$/);
    if (!match) return undefined;

    return {
        start: Number(match[1]),
        end: Number(match[2]),
    };
}

function parseQualifierValue(element: Element) {
    const value =
        element.getAttribute("text") ??
        element.getAttribute("int") ??
        element.getAttribute("real") ??
        element.getAttribute("predef") ??
        element.getAttribute("bool") ??
        element.textContent ??
        "";

    return stripMarkup(value);
}

function parseFeaturePacket(xml: string): SnapGeneFeature[] {
    const document = parseXml(xml, "features");

    return Array.from(document.querySelectorAll("Feature")).flatMap(
        (element) => {
            const ranges = childElements(element, "Segment")
                .map((segment) => parseRange(segment.getAttribute("range")))
                .filter((range): range is { start: number; end: number } =>
                    Boolean(range),
                );

            if (!ranges.length) return [];

            const qualifiers: Record<string, string[]> = {};
            for (const qualifier of childElements(element, "Q")) {
                const name = qualifier.getAttribute("name")?.trim();
                if (!name) continue;

                const values = childElements(qualifier, "V")
                    .map(parseQualifierValue)
                    .filter(Boolean);
                if (values.length) qualifiers[name] = values;
            }

            const directionality = element.getAttribute("directionality");
            const strand: Strand =
                directionality === "1" ? 1 : directionality === "2" ? -1 : 0;

            return [
                {
                    id: element.getAttribute("recentID") ?? undefined,
                    name:
                        stripMarkup(element.getAttribute("name") ?? "") ||
                        element.getAttribute("type") ||
                        "Feature",
                    type: element.getAttribute("type") ?? undefined,
                    start: ranges[0]!.start,
                    end: ranges.at(-1)!.end,
                    strand,
                    qualifiers,
                },
            ];
        },
    );
}

function parseNotesPacket(xml: string) {
    const document = parseXml(xml, "notes");
    const root = document.documentElement;
    const metadata: Record<string, string> = {};

    for (const child of Array.from(root.children)) {
        const value = stripMarkup(child.textContent ?? "");
        if (value) metadata[child.tagName] = value;
    }

    return metadata;
}

function noteValue(metadata: Record<string, string>, key: string) {
    return Object.entries(metadata).find(
        ([name]) => name.toLowerCase() === key.toLowerCase(),
    )?.[1];
}

export function parseSnapGene(
    buffer: ArrayBuffer,
    fallbackName = "Plasmid",
): SnapGeneRecord {
    const bytes = new Uint8Array(buffer);
    const view = new DataView(buffer);
    let offset = 0;
    let hasCookie = false;
    let sequence = "";
    let circular = true;
    let features: SnapGeneFeature[] = [];
    let metadata: Record<string, string> = {};

    while (offset + 5 <= bytes.length) {
        const packetType = bytes[offset]!;
        const packetLength = view.getUint32(offset + 1, false);
        const packetStart = offset + 5;
        const packetEnd = packetStart + packetLength;

        if (packetEnd > bytes.length) {
            throw new Error("The SnapGene file ends inside a data packet.");
        }

        const packet = bytes.subarray(packetStart, packetEnd);
        if (packetType === 0x09) {
            hasCookie =
                asciiDecoder.decode(packet.subarray(0, 8)) === "SnapGene";
        } else if (packetType === 0x00 && packet.length > 1) {
            circular = Boolean(packet[0]! & 0x01);
            sequence = asciiDecoder.decode(packet.subarray(1)).toUpperCase();
        } else if (packetType === 0x0a) {
            features = parseFeaturePacket(textDecoder.decode(packet));
        } else if (packetType === 0x06) {
            metadata = parseNotesPacket(textDecoder.decode(packet));
        }

        offset = packetEnd;
    }

    if (!hasCookie) throw new Error("This is not a valid SnapGene .dna file.");
    if (!sequence) throw new Error("The SnapGene file has no DNA sequence.");

    const name =
        noteValue(metadata, "CustomMapLabel") ||
        noteValue(metadata, "Alias") ||
        fallbackName;

    return {
        name,
        sequence,
        circular,
        features,
        definition:
            noteValue(metadata, "Description") ||
            noteValue(metadata, "Comments"),
        metadata,
    };
}
