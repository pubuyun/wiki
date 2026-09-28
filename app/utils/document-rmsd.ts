export interface DocumentRmsdItem {
    name: string;
    proteinUrl?: string;
    ligandUrl: string;
    ligandLabel?: string;
}

interface RmsdRecord {
    name: string;
    expname?: string;
    _rmsd_prot_url?: string;
    _rmsd_lig_url?: string;
    _membrane_fit_rmsd_url?: string;
}

const records = import.meta.glob<RmsdRecord>(
    [
        "../data/model/precursor-binder/proteina/selected/*.json",
        "../data/model/precursor-binder/rosetta/selected/*.json",
        "../data/model/transporter-binder/selected/*.json",
        "../data/model/enzyme/*.json",
    ],
    { eager: true, import: "default" },
);

export type DocumentRmsdDataset =
    "precursor-binder" | "transporter-binder" | "enzyme";

export function getDocumentRmsdItems(
    dataset: DocumentRmsdDataset,
): DocumentRmsdItem[] {
    return Object.entries(records)
        .filter(([path]) => path.includes(`/model/${dataset}/`))
        .flatMap(([, record]) => {
            const ligandUrl =
                record._rmsd_lig_url || record._membrane_fit_rmsd_url;
            if (!ligandUrl) return [];
            return [
                {
                    name:
                        dataset === "enzyme"
                            ? record.name
                            : record.expname || record.name,
                    proteinUrl: record._rmsd_prot_url,
                    ligandUrl,
                    ligandLabel: record._membrane_fit_rmsd_url
                        ? "Binder (membrane fit)"
                        : "Ligand",
                },
            ];
        })
        .sort((a, b) => a.name.localeCompare(b.name, "en", { numeric: true }));
}
