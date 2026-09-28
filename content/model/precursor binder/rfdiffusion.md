---
title: RFDiffusion
description: RFdiffusion generation, sequence redesign, folding, and candidate ranking.
order: 210
---

## Binder Performance

:charts-model-precursor-binder-binders-heat-map{binders="rosetta"}

## Ligand Binder Input

::code-group
---
default-value: "0"
label: Ligand binder input
sync: rfdiffusion-ligand-input
---
```dict [Summary]
{"Ligand": "Cys-Gly-3M3SH", "Length": "40 to 210 aa", "Buried": "all"}
```

```JSON [Configuration]
{
  "Cys-Gly-3M3SH": {
    "input": "./lcg3m3sh.pdb",
    "ligand": "LIG",             // Residue name
    "length": "40-210",         // Length range of the generated protein binder
    "select_buried": {
      "LIG": "C0,C1,C2,C3,C4,C5,C6,C7,C8,C9,C10,C11,O0,O1,O2,O3,N0,N1,S0"        // Bury all ligand atoms
    }
  }
}
```
::

## Batch LigandMPNN

::code-group
---
default-value: "0"
label: LigandMPNN batch workflow
sync: rfdiffusion-ligandmpnn
---
```graph [Workflow]
{
  "nodes": [
    { "id": "start", "type": "start", "label": "Start" },
    {
      "id": "prepare",
      "type": "input",
      "label": "Prepare paths and input files"
    },
    {
      "id": "next-file",
      "type": "loop",
      "label": "Select next backbone"
    },
    {
      "id": "run-inference",
      "type": "subprocess",
      "label": "Build command and run LigandMPNN"
    },
    {
      "id": "more-files",
      "type": "decision",
      "label": "More backbones?"
    },
    {
      "id": "complete",
      "type": "end",
      "label": "Complete and save outputs"
    }
  ],
  "edges": [
    { "id": "start-prepare", "source": "start", "target": "prepare" },
    { "id": "prepare-next", "source": "prepare", "target": "next-file" },
    { "id": "next-run", "source": "next-file", "target": "run-inference" },
    { "id": "run-more", "source": "run-inference", "target": "more-files" },
    { "id": "more-yes", "source": "more-files", "target": "next-file", "label": "Yes", "type": "loop" },
    { "id": "more-no", "source": "more-files", "target": "complete", "label": "No" }
  ]
}
```

```python [BatchLigandMPNN.py]
import os
import subprocess
from pathlib import Path


def main():
    rfd3_outputs_dir = "/data/foundry/rfd3_outputs"
    mpnn_outputs_dir = "/data/foundry/mpnn_outputs"
    checkpoint_path = os.path.expanduser(
        "~/.foundry/checkpoints/ligandmpnn_v_32_010_25.pt"
    )
    inference_script = "models/mpnn/src/mpnn/inference.py"

    os.makedirs(mpnn_outputs_dir, exist_ok=True)

    if not os.path.exists(checkpoint_path):
        print(f"Error: Model checkpoint not found: {checkpoint_path}")
        return

    rfd3_dir_path = Path(rfd3_outputs_dir)
    cif_files = list(rfd3_dir_path.glob("*.cif.gz"))

    if not cif_files:
        print(f"Warning: No .cif.gz files found in {rfd3_outputs_dir}")
        return

    print(
        f"Found {len(cif_files)} backbone files. "
        "Starting batch sequence design with LigandMPNN..."
    )

    for i, cif_file in enumerate(cif_files, start=1):
        print(f"\n[{i}/{len(cif_files)}] Processing: {cif_file.name}")

        cmd = [
            "python",
            inference_script,
            "--model_type",
            "ligand_mpnn",
            "--checkpoint_path",
            checkpoint_path,
            "--is_legacy_weights",
            "True",
            "--structure_path",
            str(cif_file),
            "--out_directory",
            mpnn_outputs_dir,
            "--batch_size",
            "5",
            "--write_fasta",
            "True",
            "--write_structures",
            "True",
        ]

        try:
            subprocess.run(cmd, check=True)
            print(f"Completed successfully: {cif_file.name}")
        except subprocess.CalledProcessError as error:
            print(f"Error while processing {cif_file.name}: {error}")

    print(
        "\nBatch processing complete. "
        f"Sequences and structures were saved to: {mpnn_outputs_dir}"
    )


if __name__ == "__main__":
    main()
```
::

## Rank and Package Top RF3 Candidates

::code-group
---
default-value: "0"
label: Top RF3 candidate workflow
sync: rfdiffusion-top-n
---
```graph [Workflow]
{
  "nodes": [
    { "id": "start", "type": "start", "label": "Start" },
    {
      "id": "prepare",
      "type": "input",
      "label": "Prepare output filenames"
    },
    {
      "id": "next-design",
      "type": "loop",
      "label": "Select the next design folder"
    },
    {
      "id": "evaluate-design",
      "type": "process",
      "label": "Check ligand chirality"
    },
    {
      "id": "is-s-chirality",
      "type": "decision",
      "label": "S configuration?"
    },
    {
      "id": "find-reference",
      "type": "document",
      "label": "Find the matching LigandMPNN reference complex"
    },
    {
      "id": "calculate-rmsd",
      "type": "process",
      "label": "Align binder C-alpha atoms and calculate both scRMSD metrics"
    },
    {
      "id": "passes-rmsd",
      "type": "decision",
      "label": "Binder scRMSD < 2 Å and aligned ligand scRMSD < 5 Å?"
    },
    {
      "id": "more-designs",
      "type": "decision",
      "label": "More design folders?"
    },
    {
      "id": "rank-candidates",
      "type": "output",
      "label": "Sort passing candidates by ranking_score and save the top 20 CSV"
    },
    {
      "id": "next-candidate",
      "type": "loop",
      "label": "Select the next top candidate"
    },
    {
      "id": "archive-folder",
      "type": "process",
      "label": "Add the candidate folder to the ZIP archive"
    },
    {
      "id": "more-candidates",
      "type": "decision",
      "label": "More top candidates?"
    },
    { "id": "complete", "type": "end", "label": "Complete" }
  ],
  "edges": [
    { "id": "start-prepare", "source": "start", "target": "prepare" },
    { "id": "prepare-design", "source": "prepare", "target": "next-design" },
    { "id": "design-evaluate", "source": "next-design", "target": "evaluate-design" },
    { "id": "evaluate-chirality", "source": "evaluate-design", "target": "is-s-chirality" },
    {
      "id": "chirality-yes",
      "source": "is-s-chirality",
      "target": "find-reference",
      "label": "Yes"
    },
    {
      "id": "chirality-no",
      "source": "is-s-chirality",
      "target": "more-designs",
      "label": "No: discard"
    },
    { "id": "reference-rmsd", "source": "find-reference", "target": "calculate-rmsd" },
    { "id": "rmsd-passes", "source": "calculate-rmsd", "target": "passes-rmsd" },
    {
      "id": "passes-rmsd-yes",
      "source": "passes-rmsd",
      "target": "more-designs",
      "label": "Yes"
    },
    {
      "id": "passes-rmsd-no",
      "source": "passes-rmsd",
      "target": "more-designs",
      "label": "No: discard"
    },
    {
      "id": "more-designs-yes",
      "source": "more-designs",
      "target": "next-design",
      "label": "Yes",
      "type": "loop"
    },
    {
      "id": "more-designs-no",
      "source": "more-designs",
      "target": "rank-candidates",
      "label": "No"
    },
    {
      "id": "rank-next-candidate",
      "source": "rank-candidates",
      "target": "next-candidate"
    },
    {
      "id": "candidate-archive",
      "source": "next-candidate",
      "target": "archive-folder"
    },
    {
      "id": "archive-more-candidates",
      "source": "archive-folder",
      "target": "more-candidates"
    },
    {
      "id": "more-candidates-yes",
      "source": "more-candidates",
      "target": "next-candidate",
      "label": "Yes",
      "type": "loop"
    },
    {
      "id": "more-candidates-no",
      "source": "more-candidates",
      "target": "complete",
      "label": "No"
    }
  ]
}
```

```python [TopN.py]
#!/usr/bin/env python3
import glob
import gzip
import io
import json
import os
import re
import zipfile

import numpy as np
import pandas as pd
from Bio.PDB import MMCIFParser, PDBIO, PDBParser, Select
from rdkit import Chem
from rdkit.Chem import rdCIPLabeler


BINDER_CHAIN_ID = "A"
LIGAND_CHAIN_ID = "B"
BINDER_SCRMSD_MAX = 2.0
LIGAND_SCRMSD_ALIGNED_MAX = 5.0


class LigandSelect(Select):
    def __init__(self, chain_id="B"):
        self.chain_id = chain_id

    def accept_residue(self, residue):
        if residue.get_parent().id == self.chain_id:
            return 1
        return 0


def load_structure(structure_file):
    """Load a PDB, CIF, or gzipped CIF structure with Biopython."""
    path_without_gz = (
        structure_file[:-3] if structure_file.endswith(".gz") else structure_file
    )
    parser = (
        PDBParser(QUIET=True)
        if path_without_gz.lower().endswith(".pdb")
        else MMCIFParser(QUIET=True)
    )

    if structure_file.endswith(".gz"):
        with gzip.open(structure_file, "rt") as handle:
            return parser.get_structure("structure", handle)
    return parser.get_structure("structure", structure_file)


def find_reference_structure(design_id, reference_dir):
    """Find the LigandMPNN complex used to create an RF3 sequence job."""
    backbone_id = re.sub(r"_d\d+$", "", design_id)
    supported_suffixes = (".pdb", ".cif", ".cif.gz")
    candidates = []

    for path in glob.glob(os.path.join(reference_dir, "**", "*"), recursive=True):
        filename = os.path.basename(path)
        if not os.path.isfile(path) or not filename.lower().endswith(supported_suffixes):
            continue
        stem = filename[:-3] if filename.lower().endswith(".gz") else filename
        stem = os.path.splitext(stem)[0]
        if stem == backbone_id:
            return path
        if stem.startswith(f"{backbone_id}_"):
            candidates.append(path)

    return sorted(candidates)[0] if candidates else None


def get_binder_ca_coordinates(structure, chain_id=BINDER_CHAIN_ID):
    model = next(structure.get_models())
    if chain_id not in model:
        raise ValueError(f"Binder chain {chain_id} was not found")

    coordinates = [
        residue["CA"].coord.astype(float)
        for residue in model[chain_id]
        if residue.id[0] == " " and "CA" in residue
    ]
    if len(coordinates) < 3:
        raise ValueError("At least three binder C-alpha atoms are required")
    return np.asarray(coordinates)


def get_ligand_heavy_atoms(structure, chain_id=LIGAND_CHAIN_ID):
    model = next(structure.get_models())
    if chain_id not in model:
        raise ValueError(f"Ligand chain {chain_id} was not found")

    atoms = {}
    for atom in model[chain_id].get_atoms():
        if atom.element.strip().upper() == "H":
            continue
        atom_name = atom.get_name().strip()
        if atom_name in atoms:
            raise ValueError(f"Duplicate ligand atom name: {atom_name}")
        atoms[atom_name] = atom.coord.astype(float)
    return atoms


def kabsch_transform(moving_coordinates, reference_coordinates):
    """Return the rigid transform that maps moving coordinates to reference."""
    if moving_coordinates.shape != reference_coordinates.shape:
        raise ValueError(
            "Predicted and reference binders must contain the same number of C-alpha atoms"
        )

    moving_center = moving_coordinates.mean(axis=0)
    reference_center = reference_coordinates.mean(axis=0)
    moving_centered = moving_coordinates - moving_center
    reference_centered = reference_coordinates - reference_center

    u_matrix, _, vt_matrix = np.linalg.svd(
        moving_centered.T @ reference_centered
    )
    rotation = u_matrix @ vt_matrix
    if np.linalg.det(rotation) < 0:
        u_matrix[:, -1] *= -1
        rotation = u_matrix @ vt_matrix

    translation = reference_center - moving_center @ rotation
    return rotation, translation


def rmsd(first_coordinates, second_coordinates):
    difference = first_coordinates - second_coordinates
    return float(np.sqrt(np.mean(np.sum(difference * difference, axis=1))))


def calculate_scrmsd_metrics(predicted_file, reference_file):
    """Calculate binder CA scRMSD and ligand scRMSD after binder alignment."""
    predicted = load_structure(predicted_file)
    reference = load_structure(reference_file)
    predicted_ca = get_binder_ca_coordinates(predicted)
    reference_ca = get_binder_ca_coordinates(reference)

    rotation, translation = kabsch_transform(predicted_ca, reference_ca)
    aligned_predicted_ca = predicted_ca @ rotation + translation
    binder_scrmsd_ca = rmsd(aligned_predicted_ca, reference_ca)

    predicted_ligand = get_ligand_heavy_atoms(predicted)
    reference_ligand = get_ligand_heavy_atoms(reference)
    predicted_atom_names = set(predicted_ligand)
    reference_atom_names = set(reference_ligand)
    if predicted_atom_names != reference_atom_names:
        raise ValueError("Predicted and reference ligand heavy-atom names differ")
    common_atom_names = sorted(predicted_atom_names)
    if len(common_atom_names) < 3:
        raise ValueError("At least three named ligand heavy atoms are required")

    predicted_ligand_coordinates = np.asarray(
        [predicted_ligand[name] for name in common_atom_names]
    )
    reference_ligand_coordinates = np.asarray(
        [reference_ligand[name] for name in common_atom_names]
    )
    aligned_ligand_coordinates = predicted_ligand_coordinates @ rotation + translation
    ligand_scrmsd_aligned = rmsd(
        aligned_ligand_coordinates,
        reference_ligand_coordinates,
    )
    return binder_scrmsd_ca, ligand_scrmsd_aligned


def get_chirality_of_C1_from_cif(cif_file):
    try:
        structure = load_structure(cif_file)
    except Exception as error:
        print(f"  [Error] Biopython could not parse CIF {cif_file}: {error}")
        return None

    io_obj = PDBIO()
    io_obj.set_structure(structure)
    pdb_stream = io.StringIO()

    try:
        io_obj.save(pdb_stream, select=LigandSelect("B"))
    except Exception:
        return None

    pdb_block = pdb_stream.getvalue()
    if not pdb_block.strip():
        return None

    mol = Chem.MolFromPDBBlock(pdb_block, sanitize=True, removeHs=False)
    if mol is None:
        return None

    rdCIPLabeler.AssignCIPLabels(mol)

    c1_atom = None
    for atom in mol.GetAtoms():
        pdb_info = atom.GetPDBResidueInfo()
        if pdb_info is not None and pdb_info.GetName().strip() == "C0":
            c1_atom = atom
            break

    if c1_atom is None or not c1_atom.HasProp("_CIPCode"):
        return None

    cip = c1_atom.GetProp("_CIPCode")
    if cip == "S":
        return True
    if cip == "R":
        return False
    return None


def main():
    rf3_outputs_dir = "/data/foundry/rf3_outputs"
    reference_structures_dir = "/data/foundry/mpnn_outputs"
    csv_filename = "rf3_S_chirality_top20.csv"
    zip_filename = "top20_S_candidates.zip"

    results = []

    print(f"Scanning {rf3_outputs_dir} and calculating chirality...")

    for design_dir in glob.glob(os.path.join(rf3_outputs_dir, "*")):
        if not os.path.isdir(design_dir):
            continue

        design_id = os.path.basename(design_dir)
        summary_file = os.path.join(
            design_dir,
            f"{design_id}_summary_confidences.json",
        )
        cif_files = glob.glob(os.path.join(design_dir, "*.cif"))

        if not os.path.exists(summary_file) or not cif_files:
            continue

        cif_file = cif_files[0]
        is_s = get_chirality_of_C1_from_cif(cif_file)

        if is_s is not True:
            continue

        reference_file = find_reference_structure(
            design_id,
            reference_structures_dir,
        )
        if reference_file is None:
            print(f"  [Skip] No reference complex found for {design_id}")
            continue

        try:
            binder_scrmsd_ca, ligand_scrmsd_aligned = calculate_scrmsd_metrics(
                cif_file,
                reference_file,
            )
        except (OSError, ValueError, KeyError) as error:
            print(f"  [Skip] Could not calculate scRMSD for {design_id}: {error}")
            continue

        if (
            binder_scrmsd_ca >= BINDER_SCRMSD_MAX
            or ligand_scrmsd_aligned >= LIGAND_SCRMSD_ALIGNED_MAX
        ):
            continue

        with open(summary_file, "r") as file:
            conf = json.load(file)

        ranking_score = conf.get("ranking_score", 0.0)
        ptm = conf.get("ptm", 0.0)
        iptm = conf.get("iptm", 0.0)
        plddt_raw = conf.get("overall_plddt", 0.0)
        plddt = plddt_raw * 100 if plddt_raw <= 1.0 else plddt_raw
        has_clash = conf.get("has_clash", True)

        seq_length = conf.get("length") or conf.get("seq_length") or conf.get("L")

        if not seq_length and "sequence" in conf:
            seq = conf.get("sequence")
            if isinstance(seq, str):
                seq_length = len(seq)
            elif isinstance(seq, dict) and "A" in seq:
                seq_length = len(seq["A"])

        if not seq_length:
            try:
                ca_count = 0
                with open(cif_file, "r") as cif_input:
                    for line in cif_input:
                        if line.startswith("ATOM") and " CA " in line and " A " in line:
                            ca_count += 1
                if ca_count > 0:
                    seq_length = ca_count
            except Exception:
                pass

        interface_pae = None
        try:
            chain_pair_pae_min = conf.get("chain_pair_pae_min", [])
            if len(chain_pair_pae_min) > 0 and len(chain_pair_pae_min[0]) > 1:
                value = chain_pair_pae_min[0][1]
                if value is not None:
                    interface_pae = float(value)
        except Exception:
            pass

        results.append(
            {
                "design_id": design_id,
                "length": seq_length if seq_length else pd.NA,
                "ranking_score": round(ranking_score, 4),
                "pTM": round(ptm, 4),
                "ipTM": round(iptm, 4),
                "pLDDT": round(plddt, 2),
                "interface_PAE": (
                    round(interface_pae, 2) if interface_pae is not None else None
                ),
                "binder_scRMSD_ca": round(binder_scrmsd_ca, 4),
                "ligand_scRMSD_aligned": round(ligand_scrmsd_aligned, 4),
                "has_clash": has_clash,
                "C1_Chirality": "S",
            }
        )

    if not results:
        print(
            "No S-configuration candidate passed both scRMSD thresholds. "
            "Check the output and reference structure directories."
        )
        return

    df = pd.DataFrame(results)
    df = df.sort_values(by="ranking_score", ascending=False)

    if "length" in df.columns:
        df["length"] = df["length"].astype("Int64")

    df_top20 = df.head(20)
    df_top20.to_csv(csv_filename, index=False)

    print(
        f"Found and ranked {len(df)} S-configuration jobs that passed "
        "both scRMSD filters. "
        f"The top 20 results were saved to: {csv_filename}"
    )
    print("\nTop 10 S-configuration binder rankings:")
    print(df_top20.head(10).to_string(index=False))

    top20_ids = df_top20["design_id"].tolist()

    print(f"\nArchiving the top 20 candidate folders to {zip_filename}...")
    success_count = 0

    with zipfile.ZipFile(zip_filename, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for design_id in top20_ids:
            folder_path = os.path.join(rf3_outputs_dir, design_id)
            if os.path.exists(folder_path) and os.path.isdir(folder_path):
                for root, _, files in os.walk(folder_path):
                    for filename in files:
                        file_path = os.path.join(root, filename)
                        archive_name = os.path.relpath(file_path, rf3_outputs_dir)
                        zip_file.write(file_path, archive_name)
                success_count += 1
            else:
                print(f"Candidate folder not found: {folder_path}")

    print(
        f"\nArchive complete. Successfully packaged "
        f"{success_count} S-configuration folders."
    )
    print(f"Download {zip_filename} and inspect the final structures with PyMOL.")


if __name__ == "__main__":
    main()
```
::

## Batch RF3 Input Preparation

::code-group
---
default-value: "0"
label: RF3 batch input workflow
sync: rfdiffusion-rf3-batch-input
---
```graph [Workflow]
{
  "nodes": [
    { "id": "start", "type": "start", "label": "Start" },
    {
      "id": "prepare",
      "type": "input",
      "label": "Set the input directory and ligand SMILES"
    },
    {
      "id": "load-files",
      "type": "document",
      "label": "Discover and read FASTA files"
    },
    {
      "id": "next-sequence",
      "type": "loop",
      "label": "Select the next sequence record"
    },
    {
      "id": "build-job",
      "type": "process",
      "label": "Build the RF3 job configuration"
    },
    {
      "id": "more-sequences",
      "type": "decision",
      "label": "More sequence records?"
    },
    {
      "id": "save-output",
      "type": "output",
      "label": "Write the batch JSON and report the result"
    },
    { "id": "complete", "type": "end", "label": "Complete" }
  ],
  "edges": [
    { "id": "start-prepare", "source": "start", "target": "prepare" },
    { "id": "prepare-load", "source": "prepare", "target": "load-files" },
    { "id": "load-next", "source": "load-files", "target": "next-sequence" },
    { "id": "next-build", "source": "next-sequence", "target": "build-job" },
    { "id": "build-more", "source": "build-job", "target": "more-sequences" },
    {
      "id": "more-yes",
      "source": "more-sequences",
      "target": "next-sequence",
      "label": "Yes",
      "type": "loop"
    },
    {
      "id": "more-no",
      "source": "more-sequences",
      "target": "save-output",
      "label": "No"
    },
    { "id": "save-complete", "source": "save-output", "target": "complete" }
  ]
}
```

```python [PrepareRF3BatchInput.py]
import glob
import json
import os


def main():
    mpnn_outputs_dir = "/data/foundry/mpnn_outputs"
    ligand_smiles = "CCCC(C)(CCO)SC[C@@H](C(=O)NCC(=O)O)N"

    fasta_files = glob.glob(os.path.join(mpnn_outputs_dir, "*.fa"))
    rf3_jobs = []

    for fa_file in fasta_files:
        base_name = os.path.basename(fa_file).replace(".fa", "")

        with open(fa_file, "r") as file:
            lines = file.read().strip().split("\n")

        for i in range(0, len(lines), 2):
            if not lines[i].startswith(">"):
                continue

            seq = lines[i + 1]
            design_index = f"d{i // 2}"
            design_id = f"{base_name}_{design_index}"

            job = {
                "name": design_id,
                "components": [
                    {
                        "seq": seq,
                        "chain_id": "A",
                    },
                    {
                        "smiles": ligand_smiles,
                    },
                ],
            }
            rf3_jobs.append(job)

    out_json = "rf3_batch_input.json"
    with open(out_json, "w") as json_file:
        json.dump(rf3_jobs, json_file, indent=4)

    print(f"Successfully extracted {len(rf3_jobs)} candidate sequences.")
    print(f"Batch input file saved to: {out_json}")


if __name__ == "__main__":
    main()
```
::
