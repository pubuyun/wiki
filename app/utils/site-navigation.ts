export interface SiteNavGroup {
    title: string;
    links: {
        to: string;
        label: string;
    }[];
}

export const siteNavGroups: SiteNavGroup[] = [
    {
        title: "Project",
        links: [
            { to: "/contribution", label: "Contribution" },
            { to: "/description", label: "Description" },
            { to: "/safety-and-security", label: "Safety" },
        ],
    },
    {
        title: "Wet lab",
        links: [
            { to: "/engineering", label: "Engineering" },
            { to: "/parts", label: "Parts" },
        ],
    },
    {
        title: "iHP",
        links: [
            { to: "/human-practices", label: "iHP" },
            { to: "/education", label: "Education" },
            { to: "/entrepreneurship", label: "Entrepreneurship" },
        ],
    },
    {
        title: "Team",
        links: [
            { to: "/members", label: "Members" },
            { to: "/attributions", label: "Attributions" },
        ],
    },
    {
        title: "Dry Lab",
        links: [
            { to: "/model", label: "Model" },
            { to: "/software", label: "Software" },
            { to: "/viewbinder", label: "Binder Viewer" },
        ],
    },
];
