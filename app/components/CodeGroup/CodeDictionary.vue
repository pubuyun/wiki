<script setup lang="ts">
type DictionaryPrimitive = string | number | boolean | null;
type DictionaryValue =
    DictionaryPrimitive | Record<string, DictionaryPrimitive>;
type Dictionary = Record<string, DictionaryValue>;

const props = defineProps<{
    source: string;
}>();

const parsed = computed(() => {
    try {
        return { error: null, value: parsePythonDictionary(props.source) };
    } catch (error) {
        return {
            error:
                error instanceof Error
                    ? error.message
                    : "Invalid Python dictionary",
            value: null,
        };
    }
});

const entries = computed(() =>
    parsed.value.value ? Object.entries(parsed.value.value) : [],
);

const flatEntries = computed(() =>
    entries.value.filter(
        (entry): entry is [string, DictionaryPrimitive] =>
            !isNestedDictionary(entry[1]),
    ),
);

const groupedEntries = computed(() =>
    entries.value.filter(
        (entry): entry is [string, Record<string, DictionaryPrimitive>] =>
            isNestedDictionary(entry[1]),
    ),
);

function isNestedDictionary(
    value: DictionaryValue,
): value is Record<string, DictionaryPrimitive> {
    return value !== null && typeof value === "object";
}

function displayValue(value: DictionaryPrimitive) {
    if (value === null) return "None";
    if (typeof value === "boolean") return value ? "True" : "False";
    return String(value);
}

function parsePythonDictionary(source: string): Dictionary {
    let cursor = 0;

    function fail(message: string): never {
        throw new Error(`${message} at character ${cursor + 1}`);
    }

    function skipWhitespaceAndComments() {
        while (cursor < source.length) {
            if (/\s/.test(source[cursor]!)) {
                cursor += 1;
                continue;
            }
            if (source[cursor] === "#") {
                while (cursor < source.length && source[cursor] !== "\n") {
                    cursor += 1;
                }
                continue;
            }
            break;
        }
    }

    function parseString() {
        const quote = source[cursor];
        if (quote !== "'" && quote !== '"') fail("Expected a quoted string");
        cursor += 1;
        let result = "";

        while (cursor < source.length) {
            const character = source[cursor++]!;
            if (character === quote) return result;
            if (character !== "\\") {
                result += character;
                continue;
            }

            if (cursor >= source.length) fail("Unterminated escape sequence");
            const escaped = source[cursor++]!;
            const escapes: Record<string, string> = {
                "'": "'",
                '"': '"',
                "\\": "\\",
                n: "\n",
                r: "\r",
                t: "\t",
                b: "\b",
                f: "\f",
            };
            result += escapes[escaped] ?? escaped;
        }

        fail("Unterminated string");
    }

    function parsePrimitive(): DictionaryPrimitive {
        skipWhitespaceAndComments();
        if (source[cursor] === "'" || source[cursor] === '"') {
            return parseString();
        }

        const remainder = source.slice(cursor);
        const keyword = /^(True|False|None)\b/.exec(remainder)?.[1];
        if (keyword) {
            cursor += keyword.length;
            if (keyword === "True") return true;
            if (keyword === "False") return false;
            return null;
        }

        const number = /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][-+]?\d+)?/.exec(
            remainder,
        )?.[0];
        if (number) {
            cursor += number.length;
            return Number(number);
        }

        fail("Expected a Python literal value");
    }

    function parseDictionary(depth: number): Dictionary {
        skipWhitespaceAndComments();
        if (source[cursor] !== "{") fail("Expected '{'");
        cursor += 1;
        const dictionary: Dictionary = {};
        skipWhitespaceAndComments();

        while (source[cursor] !== "}") {
            if (cursor >= source.length) fail("Unterminated dictionary");
            const key = parseString();
            skipWhitespaceAndComments();
            if (source[cursor] !== ":")
                fail("Expected ':' after dictionary key");
            cursor += 1;
            skipWhitespaceAndComments();

            if (source[cursor] === "{") {
                if (depth >= 1)
                    fail("Only one nested dictionary level is allowed");
                dictionary[key] = parseDictionary(depth + 1) as Record<
                    string,
                    DictionaryPrimitive
                >;
            } else {
                dictionary[key] = parsePrimitive();
            }

            skipWhitespaceAndComments();
            if (source[cursor] === ",") {
                cursor += 1;
                skipWhitespaceAndComments();
                if (source[cursor] === "}") break;
                continue;
            }
            if (source[cursor] !== "}") fail("Expected ',' or '}'");
        }

        cursor += 1;
        return dictionary;
    }

    const dictionary = parseDictionary(0);
    skipWhitespaceAndComments();
    if (cursor !== source.length) fail("Unexpected content after dictionary");
    return dictionary;
}
</script>

<template>
    <figure
        class="my-6 overflow-hidden rounded-lg border-2 border-outline bg-surface-elevated shadow-sm"
    >
        <div v-if="parsed.value" class="divide-y-2 divide-outline">
            <dl
                v-if="flatEntries.length"
                class="m-0 divide-y-2 divide-outline bg-surface"
            >
                <div
                    v-for="[key, value] in flatEntries"
                    :key="key"
                    class="grid grid-cols-[minmax(7rem,1fr)_minmax(0,2fr)] items-start gap-4 px-4 py-3"
                >
                    <dt class="font-semibold text-on-surface">
                        {{ key }}
                    </dt>
                    <dd
                        class="m-0 min-w-0 text-right font-mono text-sm break-words text-on-surface"
                    >
                        {{ displayValue(value) }}
                    </dd>
                </div>
            </dl>

            <section
                v-for="[heading, values] in groupedEntries"
                :key="heading"
                class="bg-surface"
            >
                <h3
                    class="m-0 border-b-2 border-outline bg-secondary px-4 py-2 font-belanosima text-base text-on-secondary"
                >
                    {{ heading }}
                </h3>
                <dl class="m-0 divide-y-2 divide-outline">
                    <div
                        v-for="(value, key) in values"
                        :key="key"
                        class="grid grid-cols-[minmax(7rem,1fr)_minmax(0,2fr)] items-start gap-4 px-4 py-3"
                    >
                        <dt class="font-semibold text-on-surface">
                            {{ key }}
                        </dt>
                        <dd
                            class="m-0 min-w-0 text-right font-mono text-sm break-words text-on-surface"
                        >
                            {{ displayValue(value) }}
                        </dd>
                    </div>
                </dl>
            </section>
        </div>
        <div v-else>
            <p
                class="m-0 bg-primary px-4 py-2 text-sm font-semibold text-on-primary"
            >
                Invalid dictionary
            </p>
            <p class="m-0 px-4 pt-3 text-sm text-on-surface" role="alert">
                {{ parsed.error }}
            </p>
            <pre
                class="m-0 overflow-x-auto p-4 text-sm leading-6"
            ><code>{{ props.source }}</code></pre>
        </div>
        <figcaption class="sr-only">key-value cards</figcaption>
    </figure>
</template>
