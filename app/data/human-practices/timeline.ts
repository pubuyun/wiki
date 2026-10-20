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
        description:
            "Understanding the biological mechanism of underarm odor opened a new direction beyond existing treatments. Discussions with modeling and synbio experts helped us develop complementary protein-based strategies and overcome challenges in their experimental validation. Further stakeholder interactions informed our preliminary safety screening and the refinement of our AI-assisted design workflow.",
    },
    {
        id: "safety",
        title: "Product Safety",
        nodes: ["1-1", "1-2", "1-3", "1-4", "2-1", "2-2", "3-2", "4-2", "4-3"],
        description:
            "Reports of irritation and disappointing treatment experiences made safety a priority from the beginning. Medical, industry, and immunology consultations helped us turn this concern into specific development decisions, including reconsidering spray delivery, screening potential protein-related risks, and planning further experimental safety assessment.",
    },
    {
        id: "stability",
        title: "Product Stability",
        nodes: ["3-2", "4-1", "4-2", "5-5"],
        description:
            "KleanK’s concerns about heat exposure prompted us to consider how our proteins would survive beyond the laboratory. Subsequent formulation and packaging consultations helped us reconsider freeze-drying, revise our manufacturing process, and refine our proposed packaging, while identifying the stability and compatibility tests needed for further development.",
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
        description:
            "Our initial survey suggested interest in an alternative deodorant, but understanding its commercial potential required broader engagement. Conversations with individual users, institutional buyers, established companies, and international customers helped us identify potential markets and sales channels. Industry and patent advice then informed our collaboration plans, pricing considerations, and intellectual-property strategy.",
    },
    {
        id: "needs",
        title: "Unmet Needs",
        nodes: ["1-1", "1-3", "2-1", "2-2", "2-3", "3-2", "4-2", "5-4", "5-8"],
        description:
            "Rather than assuming that odor reduction alone would satisfy users, we explored their everyday experiences and expectations. These conversations revealed needs for lasting effectiveness, skin compatibility, affordability, and convenient application. Feedback from different settings and user groups shaped our product requirements and encouraged us to explore alternative formats and more accessible packaging.",
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
        description:
            "Stakeholder conversations showed that underarm odor involves more than biology: misconceptions and social expectations can also affect wellbeing. Our response developed from public education into a community seminar, a reviewed mental-health handbook, and more inclusive product messaging. These experiences also encouraged plans for responsible advertising and education about sustainable consumption.",
    },
    {
        id: "sustainability",
        title: "Sustainability",
        nodes: ["5-4", "5-5", "5-6"],
        description:
            "An international customer’s preference for refillable packaging led us to examine sustainability beyond material selection. Packaging and environmental consultations highlighted the need to balance product protection, resource use, cost, and local recycling conditions. These insights informed our refillable packaging proposal and identified further environmental assessments and consumer education as priorities.",
    },
    {
        id: "inclusivity",
        title: "Inclusivity",
        nodes: ["5-7", "5-8"],
        description:
            "A social science specialist’s observation that our outreach overlooked older adults prompted us to reconsider whom our product might exclude. Research into accessibility barriers informed packaging designs intended for users with limited grip strength or visual impairments. We also planned volunteer testing and adapted outreach to guide further improvements.",
    },
];
