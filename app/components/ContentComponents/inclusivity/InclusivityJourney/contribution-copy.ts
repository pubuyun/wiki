export type ContributionItem = {
    title: string;
    italicTitle?: string;
    intro?: string;
    points?: {
        label?: string;
        text: string;
        italicPrefix?: string;
        children?: string[];
    }[];
};

export const contributionCopy: Record<
    "blind" | "deaf" | "autism" | "lowIncome" | "modeling" | "olderAdults",
    ContributionItem[]
> = {
    blind: [
        {
            title: "20 Tactile Biology Graphics",
            intro: "Covering 20 topics across 5 categories:",
            points: [
                {
                    label: "Cell Biology",
                    text: "Plant Cell, Animal Cell, Bacterial Cell, Egg Cell, Sperm Cell, Neuron, Paramecium",
                },
                {
                    label: "Genetics and Molecular Biology",
                    text: "DNA Structure, Female Karyotype, Male Karyotype",
                },
                {
                    label: "Organ Systems",
                    text: "Digestive System, Respiratory System, Urinary System, Female Reproductive System, Male Reproductive System",
                },
                {
                    label: "Organs",
                    text: "Ear Structure, Eye Structure, Heart Structure",
                },
                {
                    label: "Specialized Anatomical Structures",
                    text: "Alveoli, Nephron",
                },
            ],
        },
    ],
    deaf: [
        {
            title: "3 SignBio Series Videos",
            italicTitle: "SignBio",
            intro: "Covering 3 topics:",
            points: [
                { text: "Synthetic Biology" },
                { text: "Cell Structures" },
                { text: "Molecules of Life" },
            ],
        },
        {
            title: "1 Sign Language Version of our Song of SynBio",
            italicTitle: "Song of SynBio",
        },
        { title: "1 Sign Language Game on our iGEM wiki" },
    ],
    autism: [
        {
            title: "4 Superb Course Teaching Kits",
            italicTitle: "Superb Course",
            intro: "Covering 4 topics:",
            points: [
                { text: "Plants" },
                { text: "Animals" },
                { text: "Bacteria" },
                { text: "Human Body" },
            ],
        },
    ],
    lowIncome: [
        {
            title: "1 Handy Lab Experimental Toolkit",
            italicTitle: "Handy Lab",
            intro: "Featuring 6 experiments across 3 scientific disciplines:",
            points: [
                { label: "Physics", text: "Floating Egg, Bending Water" },
                {
                    label: "Chemistry",
                    text: "Red Cabbage pH Indicator, Mini “Volcano”",
                },
                {
                    label: "Biology",
                    text: "Strawberry DNA Extraction, Thirsty Celery.",
                },
            ],
        },
    ],
    modeling: [
        {
            title: "1 Modeling Guidebook",
            intro: "Covering 3 topics:",
            points: [
                {
                    text: "De novo Binder Design using:",
                    italicPrefix: "De novo",
                    children: [
                        "Proteina-Complexa",
                        "Rosetta Foundry (RFDiffusion, LigandMPNN, RosettaFold)",
                    ],
                },
                { text: "Molecular Dynamics" },
                { text: "Property Prediction" },
            ],
        },
        {
            title: "1 Modeling Software with Graphical User Interface",
            intro: "Covering 3 modeling workflows:",
            points: [
                { text: "Structure Prediction" },
                { text: "Ligand Binder" },
                { text: "Protein Binder" },
            ],
        },
    ],
    olderAdults: [
        {
            title: "1 Community-Based Science Engagement Approach",
            points: [
                {
                    text: "Designed and organized a sachet-making activity linking traditional crafts with synthetic biology.",
                },
                {
                    text: "Created science education posters to communicate scientific knowledge and address common misconceptions about GM food.",
                },
            ],
        },
    ],
};
