export const targetProfileDimensions = [
    { key: "Age", label: "Age group", developable: false },
    {
        key: "Educational level",
        label: "Educational level",
        developable: false,
    },
    { key: "Size", label: "Size", developable: false },
    {
        key: "Knowledge of synbio",
        label: "Knowledge of synbio",
        developable: true,
    },
    {
        key: "Interest in synbio",
        label: "Interest in synbio",
        developable: true,
    },
    {
        key: "Engagement with synbio",
        label: "Engagement with synbio",
        developable: true,
    },
] as const;

export type TargetProfileKey = (typeof targetProfileDimensions)[number]["key"];
export type TargetProfile = Record<TargetProfileKey, [number, string]>;
export type FixedTargetProfile = Record<
    "Age" | "Educational level" | "Size",
    number
>;
export type EducationImpactProfile = Record<
    Exclude<TargetProfileKey, keyof FixedTargetProfile>,
    [before: number, after: number, description: string]
>;
export interface TargetProfileDimension {
    key: TargetProfileKey;
    label: string;
    developable: boolean;
    score: number;
    explanation: string;
}

/** Keep chart values and the text alternative in sync; never clamp bad data. */
export function readTargetProfile(
    profile: TargetProfile,
): TargetProfileDimension[] {
    return targetProfileDimensions.map((dimension) =>
        readExplainedDimension(dimension, profile?.[dimension.key]),
    );
}

function readExplainedDimension(
    dimension: (typeof targetProfileDimensions)[number],
    entry: unknown,
): TargetProfileDimension {
    if (
        !Array.isArray(entry) ||
        entry.length !== 2 ||
        typeof entry[0] !== "number" ||
        !Number.isFinite(entry[0]) ||
        entry[0] < 1 ||
        entry[0] > 5 ||
        typeof entry[1] !== "string" ||
        !entry[1].trim()
    ) {
        throw new Error(
            `${dimension.key} must contain a score from 1 to 5 and an explanation: [score, "explanation"].`,
        );
    }
    return { ...dimension, score: entry[0], explanation: entry[1].trim() };
}

export function readEducationImpact(
    fixed: FixedTargetProfile,
    impact: EducationImpactProfile,
) {
    const entries: Partial<Record<TargetProfileKey, [number, number, string]>> =
        impact;
    const dimensions = targetProfileDimensions.map((dimension) => {
        if (dimension.developable) {
            const entry = entries?.[dimension.key];
            if (
                !Array.isArray(entry) ||
                entry.length !== 3 ||
                typeof entry[0] !== "number" ||
                !Number.isFinite(entry[0]) ||
                entry[0] < 1 ||
                entry[0] > 5
            ) {
                throw new Error(
                    `${dimension.key} must contain two scores from 1 to 5 and one description: [before, after, "description"].`,
                );
            }
            return readExplainedDimension(dimension, [entry[1], entry[2]]);
        }
        const score = fixed?.[dimension.key];
        if (
            typeof score !== "number" ||
            !Number.isFinite(score) ||
            score < 1 ||
            score > 5
        ) {
            throw new Error(`${dimension.key} must be a score from 1 to 5.`);
        }
        return { ...dimension, score, explanation: "" };
    });

    return {
        dimensions,
        beforeDimensions: dimensions.map((dimension) =>
            dimension.developable
                ? { ...dimension, score: entries[dimension.key]![0] }
                : dimension,
        ),
    };
}
