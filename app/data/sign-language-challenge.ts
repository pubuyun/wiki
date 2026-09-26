export const SIGN_VIDEO_BASE_URL =
    "https://static.igem.wiki/teams/6133/wiki/hp/inclusivity/sign-language";

export type SignLanguageWord = {
    id: string;
    label: string;
};

export type SignLanguageCategory = {
    id: "biological-molecules" | "cell-organelle" | "synbio";
    label: string;
    shortLabel: string;
    words: SignLanguageWord[];
};

const words = (entries: Array<[string, string]>): SignLanguageWord[] =>
    entries.map(([id, label]) => ({ id, label }));

export const SIGN_LANGUAGE_CATEGORIES: SignLanguageCategory[] = [
    {
        id: "biological-molecules",
        label: "Biological Molecules",
        shortLabel: "Molecules",
        words: words([
            ["amino_acid", "Amino acid"],
            ["carbohydrate", "Carbohydrate"],
            ["cholesterol", "Cholesterol"],
            ["fatty_acid", "Fatty acid"],
            ["glucose", "Glucose"],
            ["enzyme", "Enzyme"],
            ["hormone", "Hormone"],
            ["lipid", "Lipid"],
            ["protein", "Protein"],
            ["starch", "Starch"],
        ]),
    },
    {
        id: "cell-organelle",
        label: "Cell organelle",
        shortLabel: "Organelles",
        words: words([
            ["cell", "Cell"],
            ["cell_membrane", "Cell membrane"],
            ["cell_wall", "Cell wall"],
            ["chloroplast", "Chloroplast"],
            ["cytoplasm", "Cytoplasm"],
            ["endoplasmic_reticulum", "Endoplasmic reticulum"],
            ["golgi_apparatus", "Golgi apparatus"],
            ["lysosome", "Lysosome"],
            ["mitochondria", "Mitochondria"],
            ["nucleus", "Nucleus"],
            ["ribosome", "Ribosome"],
            ["vacuole", "Vacuole"],
        ]),
    },
    {
        id: "synbio",
        label: "Synbio",
        shortLabel: "Synbio",
        words: words([
            ["agar", "Agar"],
            ["allele", "Allele"],
            ["bacteria", "Bacteria"],
            ["codon", "Codon"],
            ["transcription", "Transcription"],
            ["translation", "Translation"],
            ["culture", "Culture"],
            ["electrophoresis", "Electrophoresis"],
            ["fermentation", "Fermentation"],
            ["gene", "Gene"],
            ["incubate", "Incubate"],
            ["plasmid", "Plasmid"],
        ]),
    },
];
