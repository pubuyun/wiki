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
            {
                to: "/members",
                label: "Members",
                icon: "tdesign:member",
            },
            {
                to: "/attributions",
                label: "Attribution",
                icon: "mdi:form-outline",
            },
        ],
    },
    {
        title: "Project",
        links: [
            {
                to: "/description",
                label: "Description",
                icon: "majesticons:scroll-text-line",
            },
            {
                to: "/contribution",
                label: "Contribution",
                icon: "lucide:blocks",
            },
        ],
    },
    {
        title: "Wetlab",
        links: [
            {
                to: "/engineering",
                label: "Engineering",
                icon: "lineicons:gears-3",
            },
            {
                to: "/experiments",
                label: "Experiments",
                icon: "icon-park-outline:experiment-one",
            },
            {
                to: "/parts",
                label: "Parts",
                icon: "streamline-plump:dna-solid",
            },
            {
                to: "/protocols",
                label: "Protocols",
                icon: "material-symbols:lab-profile-outline-rounded",
            },
            {
                to: "/measurement",
                label: "Measurement",
                icon: "lucide:pencil-ruler",
            },
            {
                to: "/notebook",
                label: "Notebook",
                icon: "tabler:notebook",
            },
            {
                to: "/safety-and-security",
                label: "Safety",
                icon: "mingcute:safety-certificate-line",
            },
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
            {
                to: "/hardware",
                label: "Hardware",
                icon: "material-symbols:package-outline-rounded",
            },
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
            {
                to: "/human-practices",
                label: "iHP",
                icon: "mingcute:comment-line",
            },
            {
                to: "/education",
                label: "Education",
                icon: "boxicons:education",
            },
            {
                to: "/inclusivity",
                label: "Inclusivity",
                icon: "griddy-icons:hands-support",
            },
            {
                to: "/entrepreneurship",
                label: "Entrepreneurship",
                icon: "majesticons:briefcase-line",
            },
            {
                to: "/sustainability",
                label: "Sustainability",
                icon: "material-symbols:cycle-rounded",
            },
        ],
    },
];
