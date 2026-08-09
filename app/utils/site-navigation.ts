export interface SiteNavGroup {
    title: string;
    links: {
        to: string;
        label: string;
        icon: string;
    }[];
}

export const siteNavGroups: SiteNavGroup[] = [
    {
        title: "Team",
        links: [
            { to: "/members", label: "Members" },
            { to: "/attributions", label: "Attribution" },
        ],
    },
    {
        title: "Project",
        links: [
            { to: "/description", label: "Description" },
            { to: "/contribution", label: "Contribution" },
        ],
    },
    {
        title: "Wetlab",
        links: [
            { to: "/engineering", label: "Engineering" },
            { to: "/experiments", label: "Experiments" },
            { to: "/parts", label: "Parts" },
            { to: "/protocols", label: "Protocols" },
            { to: "/measurement", label: "Measurement" },
            { to: "/notebook", label: "Notebook" },
            { to: "/safety-and-security", label: "Safety" },
        ],
    },
    {
        title: "Drylab",
        links: [
            { to: "/model", label: "Model", icon: "carbon:model-alt" },
            {
                to: "/software",
                label: "Software",
                icon: "material-symbols:computer-outline",
            },
            { to: "/hardware", label: "Hardware" },
            {
                to: "/viewbinder",
                label: "Binder Viewer",
                icon: "tabler:files",
            },
        ],
    },
    {
        title: "Human Practice",
        links: [
            { to: "/human-practices", label: "iHP" },
            { to: "/education", label: "Education" },
            { to: "/inclusivity", label: "Inclusivity" },
            { to: "/entrepreneurship", label: "Entrepreneurship" },
            { to: "/sustainability", label: "Sustainability" },
        ],
    },
];
