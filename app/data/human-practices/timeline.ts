export const timelineStages = [
    {
        title: "Understanding the Problem",
        path: "/human-practices/stage-1-understanding-the-problem",
        cycles: [
            "Inspiration and Public Survey",
            "Dermatologist",
            "Axillary Surgeon",
            "Traditional Chinese Medicine Specialist",
        ],
    },
    {
        title: "Identifying Unmet Needs",
        path: "/human-practices/stage-2-identifying-unmet-needs",
        cycles: [
            "Deodorant Users",
            "People having undergone Axillary Surgery",
            "Gym and Hotel Owners",
        ],
    },
    {
        title: "Developing Solutions",
        path: "/human-practices/stage-3-developing-solutions",
        cycles: [
            "Modeling Expert",
            "First meeting with KleanK",
            "SynBio Expert",
        ],
    },
    {
        title: "Optimising Product",
        path: "/human-practices/stage-4-optimising-product",
        cycles: [
            "Evonik and Second Meeting with KleanK",
            "Skincare Product Expert and Cosmetic Formulation Expert",
            "Immunology Expert",
            "Patent Expert",
            "AI4S Expert",
        ],
    },
    {
        title: "Expanding Impact",
        path: "/human-practices/stage-5-expanding-impact",
        cycles: [
            "Psychiatrist and Dermatologists",
            "Xiang'an Community Seminar",
            "School Wellbeing Counselor",
            "Overseas Market",
            "Amcor",
            "Environmental Experts",
            "Social Science Specialists",
            "Inclusive Packaging",
        ],
    },
];

// Membership comes from the supplied thematic copy. Stage 4 references are
// matched by stakeholder, since its cycle numbers changed in the final text.
// International Potential Customers and Deonatulle is now "Overseas Market".
export const timelineThreads = [
    {
        id: "science",
        title: "Science & Technology",
        nodes: ["1-2", "1-4", "3-1", "3-3", "4-3", "4-5"],
    },
    {
        id: "safety",
        title: "Product Safety",
        nodes: ["1-1", "1-2", "1-3", "1-4", "2-1", "2-2", "3-2", "4-2", "4-3"],
    },
    {
        id: "stability",
        title: "Product Stability",
        nodes: ["3-2", "4-1", "4-2", "5-5"],
    },
    {
        id: "market",
        title: "Market & Industry",
        nodes: [
            "1-1",
            "1-2",
            "1-3",
            "2-1",
            "2-2",
            "2-3",
            "3-2",
            "4-1",
            "4-4",
            "5-3",
            "5-4",
            "5-6",
        ],
    },
    {
        id: "needs",
        title: "Unmet Needs",
        nodes: ["1-1", "1-3", "2-1", "2-2", "2-3", "3-2", "4-2", "5-4", "5-8"],
    },
    {
        id: "awareness",
        title: "Public Awareness",
        nodes: [
            "1-1",
            "2-1",
            "4-1",
            "5-1",
            "5-2",
            "5-3",
            "5-4",
            "5-5",
            "5-7",
            "5-8",
        ],
    },
    {
        id: "sustainability",
        title: "Sustainability",
        nodes: ["5-4", "5-5", "5-6"],
    },
    {
        id: "inclusivity",
        title: "Inclusivity",
        nodes: ["5-7", "5-8"],
    },
];
