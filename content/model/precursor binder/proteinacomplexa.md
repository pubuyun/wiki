---
title: Proteina Complexa
description: Beam-search generation and sequence redesign workflow.
order: 220
---

## Binder Performance

::code-group
---

default-value: "0"
label: Cys-Gly-3M3SH ligand target
sync: cys-gly-3m3sh-ligand-target
---

```dict [Summary]
{"Length": "40–210 aa", "Target": "Cys-Gly-3M3SH", "SMILES": "CCCC(C)(CCO)SC[C@@H](C(=O)NCC(=O)O)N"}
```

```JSON [Configuration]
{
  "length": [40, 210], // Binder length range
  "Target": "Cys-Gly-3M3SH",
  "SMILES": "CCCC(C)(CCO)SC[C@@H](C(=O)NCC(=O)O)N" // Cys-Gly SMILES string
}
```

::

::charts-model-precursor-binder-binders-heat-map{binders="proteina"}
::

## Binder Generation Configuration

::code-group
---

default-value: "0"
label: Binder generation configuration
sync: binder-generation-configuration
---

```dict [Summary]
{"Config":{"Batch Size": 16, "Samples per Start": 6, "Repeats per Sample": 1}, "Search": {"Algorithm": "beam-search", "Branches per Step": 4, "Beam Width": 4}}
```

```JSON [Configuration]
{
  "dataloader": {
    "batch_size": 16, // Affects GPU memory usage
    "dataset": {
      "nsamples": 6, // Number of condition, length, or other variants sampled for each starting sample
      "nrepeat_per_sample": 1
    }
  },
  "search": {
    "algorithm": "beam-search", // Options: single-pass, best-of-n, beam-search, fk-steering, mcts
    // Algorithm-specific settings
    "beam_search": {
      "n_branch": 4, // Number of candidate branches generated from each retained beam at every expansion step
      "beam_width": 4, // Number of best candidate paths retained after each step for further expansion
      "keep_lookahead_samples": true
    }
  }
}
```

::

## PDB Collection

::code-group{defaultValue="0" sync="proteina-pdb-collection" label="Workflow and source code"}

```graph [Workflow]
{
  "nodes": [
    {
      "id": "start",
      "type": "start",
      "label": "Start"
    },
    {
      "id": "prepare",
      "type": "input",
      "label": "Check the input CSV and prepare the output directory"
    },
    {
      "id": "read-row",
      "type": "loop",
      "label": "Read the next CSV row"
    },
    {
      "id": "select-path",
      "type": "process",
      "label": "Select the source PDB path"
    },
    {
      "id": "copy-record",
      "type": "subprocess",
      "label": "Copy the PDB and record its filename"
    },
    {
      "id": "more-rows",
      "type": "decision",
      "label": "More rows?"
    },
    {
      "id": "write-csv",
      "type": "output",
      "label": "Write the updated CSV and summary"
    },
    {
      "id": "end",
      "type": "end",
      "label": "Complete"
    }
  ],
  "edges": [
    {
      "id": "start-prepare",
      "source": "start",
      "target": "prepare"
    },
    {
      "id": "prepare-read",
      "source": "prepare",
      "target": "read-row"
    },
    {
      "id": "read-select",
      "source": "read-row",
      "target": "select-path"
    },
    {
      "id": "select-copy",
      "source": "select-path",
      "target": "copy-record"
    },
    {
      "id": "copy-more",
      "source": "copy-record",
      "target": "more-rows"
    },
    {
      "id": "more-yes",
      "source": "more-rows",
      "target": "read-row",
      "label": "Yes",
      "type": "loop"
    },
    {
      "id": "more-no",
      "source": "more-rows",
      "target": "write-csv",
      "label": "No"
    },
    {
      "id": "write-end",
      "source": "write-csv",
      "target": "end"
    }
  ]
}
```

```python [collect_success_pdbs.py]
import csv
import os
import shutil


INPUT_CSV_FILE = "all_successes_ligand_binder.csv"
OUTPUT_CSV_FILE = "all_successes_ligand_binders.csv"
DEST_DIR = "./successpdb"


def main():
    print(f"Starting processing for '{INPUT_CSV_FILE}'...")

    if not os.path.exists(INPUT_CSV_FILE):
        print(
            f"Error: '{INPUT_CSV_FILE}' does not exist. "
            "Make sure the filename is correct and the file is in the script directory."
        )
        return

    os.makedirs(DEST_DIR, exist_ok=True)
    print(f"PDB files will be copied to '{DEST_DIR}'.")

    output_rows = []
    copied_count = 0
    not_found_count = 0
    skipped_count = 0

    try:
        with open(INPUT_CSV_FILE, mode="r", encoding="utf-8") as infile:
            reader = csv.DictReader(infile)
            original_fieldnames = reader.fieldnames or []

            for index, row in enumerate(reader):
                new_filename = ""
                source_type = row.get("source", "").strip()

                if source_type == "mpnn":
                    pdb_path_to_copy = row.get("mpnn_complex_pdb_path")
                elif source_type == "self":
                    pdb_path_to_copy = row.get("self_complex_pdb_path")
                else:
                    pdb_path_to_copy = row.get("mpnn_complex_pdb_path") or row.get(
                        "self_complex_pdb_path"
                    )

                run_name = row.get("run_name")

                if not run_name:
                    print(f"  [Warning] Row {index + 2} has no 'run_name'; skipping.")
                    skipped_count += 1
                    row["file_name"] = ""
                    output_rows.append(row)
                    continue

                if pdb_path_to_copy:
                    pdb_path_to_copy = pdb_path_to_copy.strip()

                    if os.path.exists(pdb_path_to_copy):
                        original_filename = os.path.basename(pdb_path_to_copy)
                        new_filename = original_filename
                        destination_path = os.path.join(DEST_DIR, new_filename)

                        try:
                            shutil.copy(pdb_path_to_copy, destination_path)
                            print(
                                f"  [Success] Copied: {pdb_path_to_copy} -> "
                                f"{destination_path}"
                            )
                            copied_count += 1
                        except Exception as error:
                            print(
                                f"  [Error] Could not copy '{pdb_path_to_copy}': {error}"
                            )
                            new_filename = ""
                    else:
                        print(
                            f"  [Warning] Source file does not exist; skipping copy: "
                            f"{pdb_path_to_copy}"
                        )
                        not_found_count += 1
                        original_filename = os.path.basename(pdb_path_to_copy)
                        new_filename = f"{run_name.strip()}_{original_filename}"
                else:
                    print(
                        f"  [Warning] No PDB path found in row {index + 2} "
                        f"(run_name: {run_name}); skipping."
                    )
                    skipped_count += 1

                row["file_name"] = new_filename
                output_rows.append(row)
    except Exception as error:
        print(f"Unexpected error while processing the file: {error}")
        return

    if output_rows:
        output_fieldnames = ["file_name"] + original_fieldnames

        try:
            with open(
                OUTPUT_CSV_FILE, mode="w", newline="", encoding="utf-8"
            ) as outfile:
                writer = csv.DictWriter(outfile, fieldnames=output_fieldnames)
                writer.writeheader()
                writer.writerows(output_rows)
            print(
                f"\nCreated '{OUTPUT_CSV_FILE}' with the generated filenames."
            )
        except Exception as error:
            print(f"\nError writing the output CSV: {error}")

    print("\n--- Processing complete ---")
    print(f"Files copied successfully: {copied_count}")
    print(f"Source files not found: {not_found_count}")
    print(f"Rows skipped for incomplete data: {skipped_count}")
    print("---------------------------")


if __name__ == "__main__":
    main()
```

::

## Confidence Metrics

::code-group{defaultValue="0" sync="proteina-confidence-metrics" label="Workflow and source code"}

```graph [Workflow]
{
  "nodes": [
    {
      "id": "start",
      "type": "start",
      "label": "Start"
    },
    {
      "id": "load-csv",
      "type": "input",
      "label": "Load the binder CSV"
    },
    {
      "id": "read-row",
      "type": "loop",
      "label": "Read the next binder row"
    },
    {
      "id": "resolve-json",
      "type": "process",
      "label": "Resolve the source-specific confidence JSON"
    },
    {
      "id": "extract-metrics",
      "type": "subprocess",
      "label": "Extract pTM, ipTM, and ranking score"
    },
    {
      "id": "more-rows",
      "type": "decision",
      "label": "More rows?"
    },
    {
      "id": "save-csv",
      "type": "output",
      "label": "Append metrics and save the CSV"
    },
    {
      "id": "end",
      "type": "end",
      "label": "Complete"
    }
  ],
  "edges": [
    {
      "id": "start-load",
      "source": "start",
      "target": "load-csv"
    },
    {
      "id": "load-read",
      "source": "load-csv",
      "target": "read-row"
    },
    {
      "id": "read-resolve",
      "source": "read-row",
      "target": "resolve-json"
    },
    {
      "id": "resolve-extract",
      "source": "resolve-json",
      "target": "extract-metrics"
    },
    {
      "id": "extract-more",
      "source": "extract-metrics",
      "target": "more-rows"
    },
    {
      "id": "more-yes",
      "source": "more-rows",
      "target": "read-row",
      "label": "Yes",
      "type": "loop"
    },
    {
      "id": "more-no",
      "source": "more-rows",
      "target": "save-csv",
      "label": "No"
    },
    {
      "id": "save-end",
      "source": "save-csv",
      "target": "end"
    }
  ]
}
```

```python [extract_confidence_metrics.py]
import json
import os

import pandas as pd


INPUT_CSV = "all_successes_ligand_binders.csv"
OUTPUT_CSV = "top_20_successes_full_ptm.csv"


def main():
    df = pd.read_csv(INPUT_CSV)
    ptms = []
    iptms = []
    json_ranking_scores = []

    for _, row in df.iterrows():
        source = row["source"]
        pdb_path_column = f"{source}_complex_pdb_path"
        ptm, iptm, score = "", "", ""

        if pdb_path_column in row and pd.notna(row[pdb_path_column]):
            pdb_path = row[pdb_path_column]
            json_path = pdb_path.replace(
                "_model.pdb", "_summary_confidences.json"
            )

            if os.path.exists(json_path):
                try:
                    with open(json_path, "r", encoding="utf-8") as file:
                        data = json.load(file)
                    ptm = data.get("ptm", "")
                    iptm = data.get("iptm", "")
                    score = data.get("ranking_score", "")
                except Exception as error:
                    print(f"Error reading or parsing {json_path}: {error}")
            else:
                print(f"Warning: File not found: {json_path}")

        ptms.append(ptm)
        iptms.append(iptm)
        json_ranking_scores.append(score)

    df["ptm"] = ptms
    df["iptm"] = iptms
    df["conf_ranking_score"] = json_ranking_scores
    df.to_csv(OUTPUT_CSV, index=False)

    print(f"Extraction complete. Results saved to: {OUTPUT_CSV}")


if __name__ == "__main__":
    main()
```

::

## Binder Ranking

::code-group{defaultValue="0" sync="proteina-binder-ranking" label="Workflow and source code"}

```graph [Workflow]
{
  "nodes": [
    {
      "id": "start",
      "type": "start",
      "label": "Start"
    },
    {
      "id": "load-csv",
      "type": "input",
      "label": "Load and normalize binder records"
    },
    {
      "id": "check-binder",
      "type": "loop",
      "label": "Check the next binder's C1 chirality"
    },
    {
      "id": "keep-binder",
      "type": "decision",
      "label": "Keep binder?"
    },
    {
      "id": "score-binder",
      "type": "process",
      "label": "Retain the binder and calculate its score"
    },
    {
      "id": "more-binders",
      "type": "decision",
      "label": "More binders?"
    },
    {
      "id": "rank",
      "type": "subprocess",
      "label": "Rank binders and select the top candidates"
    },
    {
      "id": "save",
      "type": "output",
      "label": "Save full and simplified CSV files"
    },
    {
      "id": "end",
      "type": "end",
      "label": "Complete"
    }
  ],
  "edges": [
    {
      "id": "start-load",
      "source": "start",
      "target": "load-csv"
    },
    {
      "id": "load-check",
      "source": "load-csv",
      "target": "check-binder"
    },
    {
      "id": "check-keep",
      "source": "check-binder",
      "target": "keep-binder"
    },
    {
      "id": "keep-yes",
      "source": "keep-binder",
      "target": "score-binder",
      "label": "Yes"
    },
    {
      "id": "keep-no",
      "source": "keep-binder",
      "target": "more-binders",
      "label": "No"
    },
    {
      "id": "score-more",
      "source": "score-binder",
      "target": "more-binders"
    },
    {
      "id": "more-yes",
      "source": "more-binders",
      "target": "check-binder",
      "label": "Yes",
      "type": "loop"
    },
    {
      "id": "more-no",
      "source": "more-binders",
      "target": "rank",
      "label": "No"
    },
    {
      "id": "rank-save",
      "source": "rank",
      "target": "save"
    },
    {
      "id": "save-end",
      "source": "save",
      "target": "end"
    }
  ]
}
```

```python [filter_top_binders.py]
import os

import numpy as np
import pandas as pd
from rdkit import Chem
from rdkit.Chem import rdCIPLabeler


def get_chirality_of_c1(pdb_file):
    if not isinstance(pdb_file, str) or not os.path.exists(pdb_file):
        return None

    try:
        with open(pdb_file, "r", encoding="utf-8") as file:
            lines = file.readlines()

        residue_atoms = []
        for line in lines:
            if not line.startswith(("ATOM", "HETATM")):
                continue

            residue_name = line[17:20].strip()
            residue_sequence = line[22:26].strip()
            insertion_code = line[26] if len(line) > 26 else " "

            try:
                int(residue_sequence)
            except ValueError:
                continue

            if residue_name == "L:0" and insertion_code == " ":
                residue_atoms.append(line)

        if not residue_atoms:
            return None

        molecule = Chem.MolFromPDBBlock(
            "".join(residue_atoms), sanitize=True, removeHs=False
        )
        if molecule is None:
            return None

        rdCIPLabeler.AssignCIPLabels(molecule)

        c1_atom = None
        for atom in molecule.GetAtoms():
            pdb_info = atom.GetPDBResidueInfo()
            if pdb_info is not None and pdb_info.GetName().strip() == "C1":
                c1_atom = atom
                break

        if c1_atom is None or not c1_atom.HasProp("_CIPCode"):
            return None

        cip = c1_atom.GetProp("_CIPCode")
        if cip == "S":
            print(f"Info: C1 in {pdb_file} has S configuration.")
            return True
        if cip == "R":
            print(f"Info: C1 in {pdb_file} has R configuration.")
            return False

        return None
    except Exception as error:
        print(f"Warning: Failed to read or parse {pdb_file}: {error}")
        return None


def calculate_score(row):
    prefix = "self" if str(row["source"]).strip() == "self" else "mpnn"

    plddt = float(row.get(f"{prefix}_complex_pLDDT", 0))
    i_pae = float(row.get(f"{prefix}_complex_i_pAE", 10))
    min_ipae = float(row.get(f"{prefix}_complex_min_ipAE", 2.0))
    ipsae = float(row.get(f"{prefix}_complex_min_ipSAE", 0))
    binder_rmsd = float(row.get(f"{prefix}_binder_scRMSD_ca", 5.0))
    ligand_rmsd = float(row.get(f"{prefix}_ligand_scRMSD", 10.0))
    aligned_ligand_rmsd = float(
        row.get(f"{prefix}_ligand_scRMSD_aligned_allatom", 10.0)
    )

    score = (plddt * 100) * 2.0
    score -= i_pae

    if i_pae > 10:
        score -= 20

    score -= (min_ipae * 31) * 2.0
    score += ipsae * 50.0
    score -= binder_rmsd * 5.0

    if binder_rmsd > 2.0:
        score -= 30

    score -= ligand_rmsd * 2.0
    score -= aligned_ligand_rmsd * 2.0

    if ligand_rmsd > 5.0 or aligned_ligand_rmsd > 5.0:
        score -= 20

    return score


def extract_evaluation_metrics(row):
    source = str(row["source"]).strip()
    prefix = "self" if source == "self" else "mpnn"
    raw_path = row.get(f"{prefix}_complex_pdb_path", np.nan)
    pdb_filename = (
        os.path.basename(raw_path)
        if pd.notna(raw_path) and isinstance(raw_path, str)
        else np.nan
    )

    return pd.Series(
        {
            "source": source,
            "length": row.get("L", np.nan),
            "pdb_path": pdb_filename,
            "pLDDT": row.get(f"{prefix}_complex_pLDDT", np.nan),
            "i_pAE": row.get(f"{prefix}_complex_i_pAE", np.nan),
            "min_ipAE": row.get(f"{prefix}_complex_min_ipAE", np.nan),
            "min_ipSAE": row.get(f"{prefix}_complex_min_ipSAE", np.nan),
            "binder_scRMSD_ca": row.get(
                f"{prefix}_binder_scRMSD_ca", np.nan
            ),
            "ligand_scRMSD": row.get(f"{prefix}_ligand_scRMSD", np.nan),
            "ligand_scRMSD_aligned": row.get(
                f"{prefix}_ligand_scRMSD_aligned_allatom", np.nan
            ),
            "sequence": row.get(f"{prefix}_sequence", np.nan)[::-1],
        }
    )


def has_valid_chirality(row):
    source = str(row["source"]).strip()
    prefix = "self" if source == "self" else "mpnn"
    pdb_path = row.get(f"{prefix}_complex_pdb_path")
    return get_chirality_of_c1(pdb_path) is not False


def filter_top_n_binders(input_csv, top_n=20):
    print("1. Reading CSV...")
    df = pd.read_csv(input_csv)
    df.columns = df.columns.str.strip()

    print(
        f"2. Filtering out binders with R chirality... (Initial count: {len(df)})"
    )
    df = df[df.apply(has_valid_chirality, axis=1)].copy()
    print(f"   Remaining binders after chirality filtering: {len(df)}")

    if df.empty:
        print("No valid binders remain after filtering. Exiting.")
        return

    print("3. Calculating scores...")
    df["ranking_score"] = df.apply(calculate_score, axis=1)

    print(f"4. Selecting the top {top_n} candidates...")
    top_df = df.sort_values(by="ranking_score", ascending=False).head(top_n).copy()

    full_output_name = f"top_{top_n}_successes_full.csv"
    top_df.to_csv(full_output_name, index=False)
    print(f"5. Saved the full version to: {full_output_name}")

    print("6. Generating the simplified version...")
    simplified_df = top_df.apply(extract_evaluation_metrics, axis=1)
    simplified_df["ranking_score"] = top_df["ranking_score"]
    simplified_df = simplified_df[
        [
            "source",
            "length",
            "ranking_score",
            "pdb_path",
            "pLDDT",
            "i_pAE",
            "min_ipAE",
            "min_ipSAE",
            "binder_scRMSD_ca",
            "ligand_scRMSD",
            "ligand_scRMSD_aligned",
            "sequence",
        ]
    ]

    simplified_output_name = f"top_{top_n}_successes_simplified.csv"
    simplified_df.to_csv(simplified_output_name, index=False)
    print(f"   Saved the simplified version to: {simplified_output_name}")
    print("Done!")


if __name__ == "__main__":
    filter_top_n_binders("all_successes_ligand_binders_orig.csv", top_n=20)
```

::
