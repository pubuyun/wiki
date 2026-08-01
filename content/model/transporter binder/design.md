---
title: Design
description: Configuration, RFdiffusion generation, redesign, folding, and ranking.
order: 320
---

## Interface redesign

::code-group{defaultValue="0" sync="mpnn-interface-redesign" label="Workflow and source code"}

```graph [Workflow]
{
  "nodes": [
    {"id": "start", "type": "start", "label": "Start"},
    {"id": "prepare", "type": "input", "label": "Validate paths and discover CIF structures"},
    {"id": "select", "type": "loop", "label": "Select next structure"},
    {"id": "configure", "type": "process", "label": "Decompress structure and choose design residues"},
    {"id": "redesign", "type": "subprocess", "label": "Run ProteinMPNN redesign"},
    {"id": "more", "type": "decision", "label": "More structures?"},
    {"id": "complete", "type": "end", "label": "Complete"}
  ],
  "edges": [
    {"id": "start-prepare", "source": "start", "target": "prepare"},
    {"id": "prepare-select", "source": "prepare", "target": "select"},
    {"id": "select-configure", "source": "select", "target": "configure"},
    {"id": "configure-redesign", "source": "configure", "target": "redesign"},
    {"id": "redesign-more", "source": "redesign", "target": "more"},
    {"id": "more-yes", "source": "more", "target": "select", "label": "Yes", "type": "loop"},
    {"id": "more-no", "source": "more", "target": "complete", "label": "No"}
  ]
}
```

```python [run_mpnn_interface_redesign.py]
import argparse
import gzip
import os
import shutil
import subprocess
import tempfile
from pathlib import Path

import biotite.structure as struc
import biotite.structure.io as strucio
import numpy as np


def find_interface_residues(cif_path: Path, binder_chain: str, cutoff: float):
    atoms = strucio.load_structure(str(cif_path), model=1)

    protein = struc.filter_amino_acids(atoms)
    heavy = np.char.upper(atoms.element.astype(str)) != "H"

    binder_mask = protein & heavy & (atoms.chain_id == binder_chain)
    target_mask = protein & heavy & (atoms.chain_id != binder_chain)

    binder = atoms[binder_mask]
    target = atoms[target_mask]

    if len(binder) == 0:
        raise ValueError(f"Chain {binder_chain!r} contains no protein atoms")

    if len(target) == 0:
        raise ValueError("No protein target chains were found")

    contacting_atoms = np.zeros(len(binder), dtype=bool)
    cutoff_squared = cutoff**2


    for start in range(0, len(binder), 256):
        stop = min(start + 256, len(binder))
        delta = (
            binder.coord[start:stop, np.newaxis, :]
            - target.coord[np.newaxis, :, :]
        )
        distance_squared = np.sum(delta * delta, axis=-1)
        contacting_atoms[start:stop] = np.any(
            distance_squared <= cutoff_squared,
            axis=1,
        )

    interface = binder[contacting_atoms]
    residue_ids = []

    for chain, residue_number, insertion_code in zip(
        interface.chain_id,
        interface.res_id,
        interface.ins_code,
    ):
        residue = f"{chain}{residue_number}{insertion_code}".strip()
        if residue not in residue_ids:
            residue_ids.append(residue)

    return residue_ids


def decompress_cif(source: Path, destination: Path):
    with gzip.open(source, "rb") as input_file:
        with destination.open("wb") as output_file:
            shutil.copyfileobj(input_file, output_file)


def main():
    parser = argparse.ArgumentParser(
        description="Redesign RFD3 binder interfaces using Foundry ProteinMPNN"
    )
    parser.add_argument(
        "--input-dir",
        default="./rfd3_6EXS",
        help="Directory containing RFD3 .cif.gz files",
    )
    parser.add_argument(
        "--output-dir",
        default="./mpnn_6EXS_interface",
        help="ProteinMPNN output directory",
    )
    parser.add_argument(
        "--checkpoint",
        required=True,
        help="ProteinMPNN checkpoint, e.g. proteinmpnn_v_48_020.pt",
    )
    parser.add_argument("--binder-chain", default="A")
    parser.add_argument(
        "--cutoff",
        type=float,
        default=8.0,
        help="Interface heavy-atom distance cutoff in Å",
    )
    parser.add_argument(
        "--sequences",
        type=int,
        default=8,
        help="Sequences generated per backbone",
    )
    parser.add_argument("--temperature", type=float, default=0.1)
    parser.add_argument("--gpu", default="0")
    parser.add_argument(
        "--whole-chain",
        action="store_true",
        help="Redesign all of chain A instead of interface residues only",
    )
    args = parser.parse_args()

    input_dir = Path(args.input_dir).resolve()
    output_dir = Path(args.output_dir).resolve()
    checkpoint = Path(args.checkpoint).expanduser().resolve()

    if not checkpoint.is_file():
        raise FileNotFoundError(f"Checkpoint not found: {checkpoint}")

    structures = sorted(input_dir.glob("*.cif.gz"))

    if not structures:
        raise FileNotFoundError(f"No .cif.gz files found in {input_dir}")

    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"Found {len(structures)} structures")
    print(f"Outputs: {output_dir}")

    environment = os.environ.copy()
    environment["CUDA_VISIBLE_DEVICES"] = args.gpu

    for index, compressed_cif in enumerate(structures, start=1):
        name = compressed_cif.name.removesuffix(".cif.gz")
        structure_output = output_dir / name
        done_file = structure_output / ".done"

        if done_file.exists():
            print(f"[{index}/{len(structures)}] Skipping completed: {name}")
            continue

        structure_output.mkdir(parents=True, exist_ok=True)
        log_path = structure_output / "mpnn.log"

        print(f"[{index}/{len(structures)}] Processing {name}")

        try:
            with tempfile.TemporaryDirectory(prefix="mpnn_") as temporary_dir:
                cif_path = Path(temporary_dir) / f"{name}.cif"
                decompress_cif(compressed_cif, cif_path)

                command = [
                    "mpnn",
                    "--model_type",
                    "protein_mpnn",
                    "--checkpoint_path",
                    str(checkpoint),
                    "--is_legacy_weights",
                    "True",
                    "--structure_path",
                    str(cif_path),
                    "--name",
                    name,
                    "--out_directory",
                    str(structure_output),
                    "--batch_size",
                    str(args.sequences),
                    "--number_of_batches",
                    "1",
                    "--temperature",
                    str(args.temperature),
                    "--write_fasta",
                    "True",
                    "--write_structures",
                    "True",
                ]

                if args.whole_chain:
                    command.extend(
                        ["--designed_chains", args.binder_chain]
                    )
                    print(f"  Redesigning entire chain {args.binder_chain}")
                else:
                    residues = find_interface_residues(
                        cif_path,
                        args.binder_chain,
                        args.cutoff,
                    )

                    if not residues:
                        print("  No interface residues found; skipping")
                        continue

                    print(
                        f"  Redesigning {len(residues)} interface residues: "
                        f"{','.join(residues)}"
                    )
                    command.extend(
                        ["--designed_residues", ",".join(residues)]
                    )

                with log_path.open("w") as log_file:
                    subprocess.run(
                        command,
                        env=environment,
                        stdout=log_file,
                        stderr=subprocess.STDOUT,
                        check=True,
                    )

            done_file.touch()

        except Exception as error:
            print(f"  ERROR: {error}")
            print(f"  See log: {log_path}")

    print("Finished.")


if __name__ == "__main__":
    main()
```

::

## Reference cofolding

::code-group{defaultValue="0" sync="rf3-reference-cofold" label="Workflow and source code"}

```graph [Workflow]
{
  "nodes": [
    {"id": "start", "type": "start", "label": "Start"},
    {"id": "prepare", "type": "input", "label": "Validate paths and inspect reference chains"},
    {"id": "discover", "type": "process", "label": "Discover ProteinMPNN FASTA files"},
    {"id": "select", "type": "loop", "label": "Select next design record"},
    {"id": "build", "type": "process", "label": "Extract binder sequence and build RF3 input"},
    {"id": "more", "type": "decision", "label": "More designs?"},
    {"id": "write", "type": "document", "label": "Write batch input and skipped-item report"},
    {"id": "prepare-only", "type": "decision", "label": "Prepare only?"},
    {"id": "fold", "type": "subprocess", "label": "Run RF3 cofolding"},
    {"id": "complete", "type": "end", "label": "Complete"}
  ],
  "edges": [
    {"id": "start-prepare", "source": "start", "target": "prepare"},
    {"id": "prepare-discover", "source": "prepare", "target": "discover"},
    {"id": "discover-select", "source": "discover", "target": "select"},
    {"id": "select-build", "source": "select", "target": "build"},
    {"id": "build-more", "source": "build", "target": "more"},
    {"id": "more-yes", "source": "more", "target": "select", "label": "Yes", "type": "loop"},
    {"id": "more-no", "source": "more", "target": "write", "label": "No"},
    {"id": "write-prepare-only", "source": "write", "target": "prepare-only"},
    {"id": "prepare-yes", "source": "prepare-only", "target": "complete", "label": "Yes"},
    {"id": "prepare-no", "source": "prepare-only", "target": "fold", "label": "No"},
    {"id": "fold-complete", "source": "fold", "target": "complete"}
  ]
}
```

```python [run_rf3_reference_cofold.py]
import argparse
import json
import os
import re
import subprocess
import sys
from pathlib import Path

import biotite.structure as struc
import biotite.structure.io as strucio


VALID_SEQUENCE = re.compile(r"^[ACDEFGHIKLMNPQRSTVWYX]+$")


def read_fasta(path: Path):

    records = []
    header = None
    sequence_parts = []

    with path.open() as handle:
        for raw_line in handle:
            line = raw_line.strip()

            if not line:
                continue

            if line.startswith(">"):
                if header is not None:
                    records.append((header, "".join(sequence_parts)))

                header = line[1:].strip()
                sequence_parts = []
            else:
                sequence_parts.append(
                    line.replace(" ", "").upper()
                )

    if header is not None:
        records.append((header, "".join(sequence_parts)))

    if not records:
        raise ValueError(f"No FASTA records found in {path}")

    for header, sequence in records:
        if not VALID_SEQUENCE.fullmatch(sequence):
            raise ValueError(
                f"Invalid amino-acid sequence in {path}: {header}"
            )

    return records


def get_design_name(header: str):





    return header.split(",", maxsplit=1)[0].strip().replace(" ", "_")


def load_structure(path: Path):

    try:
        return strucio.load_structure(str(path), model=1)
    except TypeError:

        return strucio.load_structure(str(path))


def get_protein_chain_ids(structure_path: Path):

    atoms = load_structure(structure_path)
    protein_atoms = atoms[struc.filter_amino_acids(atoms)]

    chain_ids = []

    for chain_id in protein_atoms.chain_id:
        chain_id = str(chain_id).strip()

        if chain_id and chain_id not in chain_ids:
            chain_ids.append(chain_id)

    if not chain_ids:
        raise ValueError(
            f"No protein chains found in reference: {structure_path}"
        )

    return chain_ids


def get_chain_length(structure_path: Path, chain_id: str):

    atoms = load_structure(structure_path)
    protein_atoms = atoms[struc.filter_amino_acids(atoms)]
    chain_atoms = protein_atoms[
        protein_atoms.chain_id.astype(str) == chain_id
    ]

    if len(chain_atoms) == 0:
        raise ValueError(
            f"No amino-acid residues found in chain {chain_id!r} "
            f"of {structure_path}"
        )

    residue_starts = struc.get_residue_starts(
        chain_atoms,
        add_exclusive_stop=True,
    )

    return len(residue_starts) - 1


def select_unused_chain_id(reference_chain_ids):

    candidates = list(
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        "abcdefghijklmnopqrstuvwxyz"
        "0123456789"
    )

    for chain_id in candidates:
        if chain_id not in reference_chain_ids:
            return chain_id

    raise ValueError(
        "Could not select an unused chain ID for the binder"
    )


def find_design_structure(fasta_path: Path, design_name: str):

    candidates = [
        fasta_path.parent / f"{design_name}.cif",
        fasta_path.parent / f"{design_name}.cif.gz",
    ]

    for candidate in candidates:
        if candidate.is_file():
            return candidate

    raise FileNotFoundError(
        f"No structure found for {design_name}. Expected one of: "
        + ", ".join(str(path) for path in candidates)
    )


def extract_binder_sequence(
    complete_sequence: str,
    design_structure: Path,
    original_binder_chain: str,
):






    binder_length = get_chain_length(
        design_structure,
        original_binder_chain,
    )

    if len(complete_sequence) < binder_length:
        raise ValueError(
            f"MPNN sequence has {len(complete_sequence)} residues, "
            f"but binder chain {original_binder_chain} contains "
            f"{binder_length} residues"
        )

    binder_sequence = complete_sequence[:binder_length]

    return binder_sequence, binder_length


def build_rf3_inputs(
    mpnn_dir: Path,
    reference_pdb: Path,
    original_binder_chain: str,
    rf3_binder_chain: str | None,
):

    reference_chain_ids = get_protein_chain_ids(reference_pdb)

    if rf3_binder_chain is None:
        rf3_binder_chain = select_unused_chain_id(
            reference_chain_ids
        )

    if rf3_binder_chain in reference_chain_ids:
        raise ValueError(
            f"Binder chain {rf3_binder_chain!r} already exists in "
            f"{reference_pdb}. Reference chains: "
            f"{', '.join(reference_chain_ids)}"
        )

    fasta_files = sorted(mpnn_dir.glob("**/*.fa"))

    if not fasta_files:
        raise FileNotFoundError(
            f"No .fa files found recursively under {mpnn_dir}"
        )

    reference_path = str(reference_pdb.resolve())
    examples = []
    skipped = []

    print(
        "Reference chains: "
        + ", ".join(reference_chain_ids)
    )
    print(f"RF3 binder chain: {rf3_binder_chain}")
    print(f"Found {len(fasta_files)} MPNN FASTA files")

    for fasta_index, fasta_path in enumerate(
        fasta_files,
        start=1,
    ):
        print(
            f"[{fasta_index}/{len(fasta_files)}] "
            f"Reading {fasta_path}"
        )

        try:
            records = read_fasta(fasta_path)
        except Exception as error:
            print(f"  SKIPPED FASTA: {error}")
            skipped.append(
                {
                    "file": str(fasta_path),
                    "error": str(error),
                }
            )
            continue

        for header, complete_sequence in records:
            design_name = get_design_name(header)

            try:
                design_structure = find_design_structure(
                    fasta_path,
                    design_name,
                )

                binder_sequence, binder_length = (
                    extract_binder_sequence(
                        complete_sequence,
                        design_structure,
                        original_binder_chain,
                    )
                )

                example = {
                    "name": design_name,
                    "components": [
                        {
                            "path": reference_path,
                        },
                        {
                            "seq": binder_sequence,
                            "chain_id": rf3_binder_chain,
                        },
                    ],

                    "template_selection": reference_chain_ids,
                }

                examples.append(example)

                print(
                    f"  Added {design_name}: "
                    f"{binder_length}-residue binder"
                )

            except Exception as error:
                print(f"  SKIPPED {design_name}: {error}")

                skipped.append(
                    {
                        "file": str(fasta_path),
                        "design": design_name,
                        "error": str(error),
                    }
                )

    return (
        examples,
        skipped,
        reference_chain_ids,
        rf3_binder_chain,
    )


def main():
    parser = argparse.ArgumentParser(
        description=(
            "Cofold ProteinMPNN-designed binders against a "
            "templated reference PDB using RF3"
        )
    )

    parser.add_argument(
        "--mpnn-dir",
        default="./mpnn_6EXS",
        help="Directory containing nested ProteinMPNN outputs",
    )
    parser.add_argument(
        "--reference-pdb",
        default="./6EXS.pdb",
        help="Reference receptor PDB passed to RF3",
    )
    parser.add_argument(
        "--output-dir",
        default="./rf3_6EXS_reference_cofold",
        help="RF3 output directory",
    )
    parser.add_argument(
        "--input-json",
        default="./rf3_6EXS_reference_inputs.json",
        help="Generated RF3 batch-input JSON",
    )
    parser.add_argument(
        "--original-binder-chain",
        default="A",
        help="Binder chain in ProteinMPNN structures",
    )
    parser.add_argument(
        "--rf3-binder-chain",
        default=None,
        help=(
            "Binder chain in RF3 inputs. By default, the script "
            "selects an unused chain ID."
        ),
    )
    parser.add_argument(
        "--diffusion-batch-size",
        type=int,
        default=5,
        help="Number of RF3 predictions per binder",
    )
    parser.add_argument(
        "--num-steps",
        type=int,
        default=200,
        help="RF3 diffusion steps",
    )
    parser.add_argument(
        "--n-recycles",
        type=int,
        default=10,
        help="RF3 trunk recycles",
    )
    parser.add_argument(
        "--early-stopping-threshold",
        type=float,
        default=0.0,
        help="Set to 0 to disable practical early stopping",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=42,
        help="RF3 random seed",
    )
    parser.add_argument(
        "--gpu",
        default="0",
        help="CUDA device exposed to RF3",
    )
    parser.add_argument(
        "--prepare-only",
        action="store_true",
        help="Generate the batch JSON without running RF3",
    )

    args = parser.parse_args()

    mpnn_dir = Path(args.mpnn_dir).expanduser().resolve()
    reference_pdb = (
        Path(args.reference_pdb).expanduser().resolve()
    )
    output_dir = (
        Path(args.output_dir).expanduser().resolve()
    )
    input_json = (
        Path(args.input_json).expanduser().resolve()
    )

    if not mpnn_dir.is_dir():
        raise NotADirectoryError(
            f"MPNN directory not found: {mpnn_dir}"
        )

    if not reference_pdb.is_file():
        raise FileNotFoundError(
            f"Reference PDB not found: {reference_pdb}"
        )

    examples, skipped, reference_chains, binder_chain = (
        build_rf3_inputs(
            mpnn_dir=mpnn_dir,
            reference_pdb=reference_pdb,
            original_binder_chain=args.original_binder_chain,
            rf3_binder_chain=args.rf3_binder_chain,
        )
    )

    if not examples:
        raise RuntimeError(
            "No valid RF3 inputs were generated"
        )

    input_json.parent.mkdir(parents=True, exist_ok=True)
    input_json.write_text(
        json.dumps(examples, indent=2) + "\n"
    )

    print()
    print(f"Generated {len(examples)} RF3 inputs")
    print(f"Input JSON: {input_json}")
    print(
        "Templated reference chains: "
        + ", ".join(reference_chains)
    )
    print(f"Binder chain: {binder_chain}")

    if skipped:
        skipped_path = input_json.with_name(
            f"{input_json.stem}_skipped.json"
        )
        skipped_path.write_text(
            json.dumps(skipped, indent=2) + "\n"
        )
        print(f"Skipped-input report: {skipped_path}")

    if args.prepare_only:
        print("Preparation complete; RF3 was not started.")
        return

    output_dir.mkdir(parents=True, exist_ok=True)

    command = [
        "rf3",
        "fold",
        f"inputs={input_json}",
        f"out_dir={output_dir}",
        (
            "diffusion_batch_size="
            f"{args.diffusion_batch_size}"
        ),
        f"num_steps={args.num_steps}",
        f"n_recycles={args.n_recycles}",
        (
            "early_stopping_plddt_threshold="
            f"{args.early_stopping_threshold}"
        ),
        f"seed={args.seed}",
        "skip_existing=True",
        "one_model_per_file=True",
        "annotate_b_factor_with_plddt=True",
    ]

    environment = os.environ.copy()
    environment["CUDA_VISIBLE_DEVICES"] = args.gpu

    print()
    print("Running RF3:")
    print(" ".join(str(item) for item in command))
    print()

    try:
        subprocess.run(
            command,
            env=environment,
            check=True,
        )
    except FileNotFoundError:
        print(
            "ERROR: 'rf3' was not found. Activate the Foundry "
            "virtual environment first.",
            file=sys.stderr,
        )
        raise
    except subprocess.CalledProcessError as error:
        print(
            f"RF3 exited with status {error.returncode}",
            file=sys.stderr,
        )
        raise


if __name__ == "__main__":
    main()
```

::

## Binder ranking

::code-group{defaultValue="0" sync="rf3-binder-ranking" label="Workflow and source code"}

```graph [Workflow]
{
  "nodes": [
    {"id": "start", "type": "start", "label": "Start"},
    {"id": "prepare", "type": "input", "label": "Validate inputs and discover RF3 models"},
    {"id": "select", "type": "loop", "label": "Select next sample"},
    {"id": "evaluate", "type": "subprocess", "label": "Measure contacts, filter interface, and read metrics"},
    {"id": "more", "type": "decision", "label": "More samples?"},
    {"id": "score", "type": "process", "label": "Normalize metrics and score accepted samples"},
    {"id": "rank", "type": "process", "label": "Select best sample per prediction and rank top binders"},
    {"id": "write", "type": "document", "label": "Write rankings, structures, and reports"},
    {"id": "complete", "type": "end", "label": "Complete"}
  ],
  "edges": [
    {"id": "start-prepare", "source": "start", "target": "prepare"},
    {"id": "prepare-select", "source": "prepare", "target": "select"},
    {"id": "select-evaluate", "source": "select", "target": "evaluate"},
    {"id": "evaluate-more", "source": "evaluate", "target": "more"},
    {"id": "more-yes", "source": "more", "target": "select", "label": "Yes", "type": "loop"},
    {"id": "more-no", "source": "more", "target": "score", "label": "No"},
    {"id": "score-rank", "source": "score", "target": "rank"},
    {"id": "rank-write", "source": "rank", "target": "write"},
    {"id": "write-complete", "source": "write", "target": "complete"}
  ]
}
```

```python [rank_rf3_binders.py]
import argparse
import csv
import json
import re
import shutil
from dataclasses import asdict, dataclass
from pathlib import Path

import biotite.structure as struc
import biotite.structure.io as strucio
import numpy as np


INTERFACE_RANGES = [
    (45, 72),
    (168, 199),
    (313, 347),
    (392, 409),
]

SAMPLE_PATTERN = re.compile(
    r"^(?P<prediction>.+)_seed-(?P<seed>\d+)_sample-(?P<sample>\d+)$"
)


@dataclass
class Candidate:
    name: str
    prediction_name: str
    seed: int | None
    sample: int | None

    model_path: Path
    summary_path: Path
    ranking_path: Path

    plddt: float
    pae: float
    pae_source: str
    ranking_score: float

    interface_target_residues: int
    interface_binder_residues: int
    interface_atom_contacts: int
    total_target_contact_residues: int
    desired_contact_fraction: float

    normalized_plddt: float = 0.0
    normalized_inverse_pae: float = 0.0
    normalized_ranking_score: float = 0.0
    weighted_score: float = 0.0
    rank: int = 0


def load_structure(path: Path):
    try:
        atoms = strucio.load_structure(str(path), model=1)
    except TypeError:
        atoms = strucio.load_structure(str(path))

    if isinstance(atoms, struc.AtomArrayStack):
        atoms = atoms[0]

    return atoms


def protein_heavy_atoms(atoms):
    protein_mask = struc.filter_amino_acids(atoms)
    elements = np.char.upper(atoms.element.astype(str))
    heavy_mask = (elements != "H") & (elements != "D")

    return atoms[protein_mask & heavy_mask]


def is_interface_residue(residue_number: int):
    return any(
        start <= residue_number <= stop
        for start, stop in INTERFACE_RANGES
    )


def residue_keys(atoms):
    if hasattr(atoms, "ins_code"):
        insertion_codes = atoms.ins_code.astype(str)
    else:
        insertion_codes = np.full(
            len(atoms),
            "",
            dtype=object,
        )

    return [
        (
            str(chain_id).strip(),
            int(residue_id),
            str(insertion_code).strip(),
        )
        for chain_id, residue_id, insertion_code in zip(
            atoms.chain_id,
            atoms.res_id,
            insertion_codes,
        )
    ]


def calculate_contacts(
    model_path: Path,
    target_chain: str,
    binder_chain: str,
    cutoff: float,
):
    atoms = protein_heavy_atoms(load_structure(model_path))
    chain_ids = atoms.chain_id.astype(str)

    target = atoms[chain_ids == target_chain]
    binder = atoms[chain_ids == binder_chain]

    if len(target) == 0:
        raise ValueError(
            f"No protein atoms in target chain {target_chain!r}"
        )

    if len(binder) == 0:
        raise ValueError(
            f"No protein atoms in binder chain {binder_chain!r}"
        )

    interface_mask = np.asarray(
        [
            is_interface_residue(int(residue_id))
            for residue_id in target.res_id
        ],
        dtype=bool,
    )
    interface = target[interface_mask]

    if len(interface) == 0:
        observed = sorted(
            set(int(value) for value in target.res_id)
        )
        raise ValueError(
            "No target residues matched the configured interface. "
            f"Observed range: {min(observed)}-{max(observed)}"
        )

    cutoff_squared = cutoff**2
    chunk_size = 256

    binder_keys = residue_keys(binder)
    interface_keys = residue_keys(interface)
    target_keys = residue_keys(target)

    contacted_interface_target = set()
    contacted_interface_binder = set()
    contacted_all_target = set()
    interface_atom_contacts = 0


    for start in range(0, len(binder), chunk_size):
        stop = min(start + chunk_size, len(binder))

        difference = (
            binder.coord[start:stop, np.newaxis, :]
            - interface.coord[np.newaxis, :, :]
        )
        distance_squared = np.sum(
            difference * difference,
            axis=-1,
        )

        binder_indices, interface_indices = np.nonzero(
            distance_squared <= cutoff_squared
        )

        interface_atom_contacts += len(binder_indices)

        for binder_index in np.unique(binder_indices):
            contacted_interface_binder.add(
                binder_keys[start + int(binder_index)]
            )

        for interface_index in np.unique(interface_indices):
            contacted_interface_target.add(
                interface_keys[int(interface_index)]
            )


    for start in range(0, len(binder), chunk_size):
        stop = min(start + chunk_size, len(binder))

        difference = (
            binder.coord[start:stop, np.newaxis, :]
            - target.coord[np.newaxis, :, :]
        )
        distance_squared = np.sum(
            difference * difference,
            axis=-1,
        )

        _, target_indices = np.nonzero(
            distance_squared <= cutoff_squared
        )

        for target_index in np.unique(target_indices):
            contacted_all_target.add(
                target_keys[int(target_index)]
            )

    if contacted_all_target:
        desired_contact_fraction = (
            len(contacted_interface_target)
            / len(contacted_all_target)
        )
    else:
        desired_contact_fraction = 0.0

    return {
        "interface_target_residues": len(
            contacted_interface_target
        ),
        "interface_binder_residues": len(
            contacted_interface_binder
        ),
        "interface_atom_contacts": interface_atom_contacts,
        "total_target_contact_residues": len(
            contacted_all_target
        ),
        "desired_contact_fraction": desired_contact_fraction,
    }


def find_pairwise_values(matrix):
    values = []

    if not isinstance(matrix, list):
        return values

    for row_index, row in enumerate(matrix):
        if not isinstance(row, list):
            continue

        for column_index, value in enumerate(row):
            if row_index == column_index or value is None:
                continue

            try:
                values.append(float(value))
            except (TypeError, ValueError):
                continue

    return values


def read_confidence_metrics(
    summary_path: Path,
    pae_metric: str,
):
    with summary_path.open() as handle:
        data = json.load(handle)

    if "overall_plddt" not in data:
        raise KeyError(
            f"'overall_plddt' missing from {summary_path}"
        )

    plddt = float(data["overall_plddt"])

    if plddt > 1.0:
        plddt /= 100.0

    if pae_metric == "interface":
        pairwise_values = find_pairwise_values(
            data.get("chain_pair_pae")
        )

        if pairwise_values:
            pae = min(pairwise_values)
            pae_source = "chain_pair_pae"
        elif "overall_pae" in data:
            pae = float(data["overall_pae"])
            pae_source = "overall_pae_fallback"
        else:
            raise KeyError(
                f"No PAE value found in {summary_path}"
            )
    else:
        if "overall_pae" not in data:
            raise KeyError(
                f"'overall_pae' missing from {summary_path}"
            )

        pae = float(data["overall_pae"])
        pae_source = "overall_pae"

    return plddt, pae, pae_source


def detect_delimiter(path: Path):
    with path.open() as handle:
        first_line = handle.readline()

    return "\t" if "\t" in first_line else ","


def read_ranking_score(
    ranking_path: Path,
    expected_seed: int | None,
    expected_sample: int | None,
):
    rows = []

    with ranking_path.open(newline="") as handle:
        reader = csv.DictReader(
            handle,
            delimiter=detect_delimiter(ranking_path),
        )

        for row in reader:
            value = row.get("ranking_score")

            if value in (None, ""):
                continue

            try:
                rows.append(
                    {
                        "seed": (
                            int(row["seed"])
                            if row.get("seed") not in (None, "")
                            else None
                        ),
                        "sample": (
                            int(row["sample"])
                            if row.get("sample") not in (None, "")
                            else None
                        ),
                        "ranking_score": float(value),
                    }
                )
            except (TypeError, ValueError):
                continue

    if not rows:
        raise ValueError(
            f"No valid ranking score in {ranking_path}"
        )

    if expected_seed is not None and expected_sample is not None:
        for row in rows:
            if (
                row["seed"] == expected_seed
                and row["sample"] == expected_sample
            ):
                return row["ranking_score"]

    if len(rows) == 1:
        return rows[0]["ranking_score"]

    if expected_sample is not None:
        matches = [
            row
            for row in rows
            if row["sample"] == expected_sample
        ]

        if len(matches) == 1:
            return matches[0]["ranking_score"]

    raise ValueError(
        f"Could not match seed={expected_seed}, "
        f"sample={expected_sample} in {ranking_path}"
    )


def unique_existing_paths(paths):
    result = []
    seen = set()

    for path in paths:
        path = Path(path)

        try:
            resolved = path.resolve()
        except OSError:
            resolved = path

        if resolved in seen:
            continue

        seen.add(resolved)

        if path.is_file():
            result.append(path)

    return result


def corresponding_files(model_path: Path):
    filename = model_path.name

    if not filename.endswith("_model.cif"):
        raise ValueError(
            f"Unexpected model filename: {filename}"
        )

    name = filename.removesuffix("_model.cif")
    match = SAMPLE_PATTERN.match(name)

    if match:
        prediction_name = match.group("prediction")
        seed = int(match.group("seed"))
        sample = int(match.group("sample"))
    else:
        prediction_name = name
        seed = None
        sample = None

    sample_directory = model_path.parent
    prediction_directory = sample_directory.parent

    summary_candidates = [
        sample_directory / f"{name}_summary_confidences.json",
        sample_directory
        / f"{prediction_name}_summary_confidences.json",
        prediction_directory
        / f"{name}_summary_confidences.json",
        prediction_directory
        / f"{prediction_name}_summary_confidences.json",
    ]

    summary_candidates.extend(
        sample_directory.glob("*_summary_confidences.json")
    )

    summary_candidates = unique_existing_paths(
        summary_candidates
    )

    exact_summary = (
        sample_directory / f"{name}_summary_confidences.json"
    )

    if exact_summary.is_file():
        summary_path = exact_summary
    elif len(summary_candidates) == 1:
        summary_path = summary_candidates[0]
    else:
        matching = [
            path
            for path in summary_candidates
            if path.name.startswith(name)
        ]

        if len(matching) != 1:
            raise FileNotFoundError(
                f"Could not identify summary JSON for {model_path}"
            )

        summary_path = matching[0]

    ranking_candidates = [
        sample_directory / f"{name}_ranking_scores.csv",
        sample_directory
        / f"{prediction_name}_ranking_scores.csv",
        prediction_directory / f"{name}_ranking_scores.csv",
        prediction_directory
        / f"{prediction_name}_ranking_scores.csv",
    ]

    ranking_candidates.extend(
        sample_directory.glob("*_ranking_scores.csv")
    )
    ranking_candidates.extend(
        prediction_directory.glob("*_ranking_scores.csv")
    )

    ranking_candidates = unique_existing_paths(
        ranking_candidates
    )

    exact_ranking = (
        sample_directory / f"{name}_ranking_scores.csv"
    )

    if exact_ranking.is_file():
        ranking_path = exact_ranking
    elif len(ranking_candidates) == 1:
        ranking_path = ranking_candidates[0]
    else:
        ranking_path = None

        for candidate_path in ranking_candidates:
            try:
                read_ranking_score(
                    candidate_path,
                    expected_seed=seed,
                    expected_sample=sample,
                )
                ranking_path = candidate_path
                break
            except Exception:
                continue

        if ranking_path is None:
            raise FileNotFoundError(
                f"Could not identify ranking CSV for {model_path}"
            )

    return {
        "name": name,
        "prediction_name": prediction_name,
        "seed": seed,
        "sample": sample,
        "summary_path": summary_path,
        "ranking_path": ranking_path,
    }


def normalize(values, invert=False):
    array = np.asarray(values, dtype=float)
    minimum = float(np.min(array))
    maximum = float(np.max(array))

    if np.isclose(minimum, maximum):
        normalized = np.full(len(array), 0.5)
    else:
        normalized = (
            array - minimum
        ) / (
            maximum - minimum
        )

    if invert:
        normalized = 1.0 - normalized

    return normalized.tolist()


def score_candidates(
    candidates,
    ranking_weight: float,
    plddt_weight: float,
    pae_weight: float,
):
    weight_sum = (
        ranking_weight
        + plddt_weight
        + pae_weight
    )

    if weight_sum <= 0:
        raise ValueError(
            "Metric weights must sum to a positive value"
        )

    normalized_plddt = normalize(
        [candidate.plddt for candidate in candidates]
    )
    normalized_inverse_pae = normalize(
        [candidate.pae for candidate in candidates],
        invert=True,
    )
    normalized_ranking = normalize(
        [candidate.ranking_score for candidate in candidates]
    )

    for candidate, plddt, inverse_pae, ranking in zip(
        candidates,
        normalized_plddt,
        normalized_inverse_pae,
        normalized_ranking,
    ):
        candidate.normalized_plddt = plddt
        candidate.normalized_inverse_pae = inverse_pae
        candidate.normalized_ranking_score = ranking

        candidate.weighted_score = (
            ranking_weight * ranking
            + plddt_weight * plddt
            + pae_weight * inverse_pae
        ) / weight_sum


def select_best_sample_per_prediction(candidates):





    best_by_prediction = {}

    for candidate in candidates:
        current = best_by_prediction.get(
            candidate.prediction_name
        )

        if current is None:
            best_by_prediction[
                candidate.prediction_name
            ] = candidate
            continue

        candidate_key = (
            candidate.weighted_score,
            candidate.ranking_score,
            candidate.plddt,
            -candidate.pae,
            -(
                candidate.sample
                if candidate.sample is not None
                else 0
            ),
        )

        current_key = (
            current.weighted_score,
            current.ranking_score,
            current.plddt,
            -current.pae,
            -(
                current.sample
                if current.sample is not None
                else 0
            ),
        )

        if candidate_key > current_key:
            best_by_prediction[
                candidate.prediction_name
            ] = candidate

    selected = list(best_by_prediction.values())

    selected.sort(
        key=lambda candidate: (
            candidate.weighted_score,
            candidate.ranking_score,
            candidate.plddt,
            -candidate.pae,
        ),
        reverse=True,
    )

    return selected


def candidate_to_row(candidate: Candidate):
    return {
        "rank": candidate.rank,
        "prediction_name": candidate.prediction_name,
        "selected_sample_name": candidate.name,
        "seed": (
            "" if candidate.seed is None else candidate.seed
        ),
        "sample": (
            "" if candidate.sample is None else candidate.sample
        ),
        "weighted_score": (
            f"{candidate.weighted_score:.6f}"
        ),
        "ranking_score": (
            f"{candidate.ranking_score:.6f}"
        ),
        "plddt": f"{candidate.plddt:.6f}",
        "pae": f"{candidate.pae:.6f}",
        "pae_source": candidate.pae_source,
        "normalized_ranking_score": (
            f"{candidate.normalized_ranking_score:.6f}"
        ),
        "normalized_plddt": (
            f"{candidate.normalized_plddt:.6f}"
        ),
        "normalized_inverse_pae": (
            f"{candidate.normalized_inverse_pae:.6f}"
        ),
        "interface_target_residues": (
            candidate.interface_target_residues
        ),
        "interface_binder_residues": (
            candidate.interface_binder_residues
        ),
        "interface_atom_contacts": (
            candidate.interface_atom_contacts
        ),
        "total_target_contact_residues": (
            candidate.total_target_contact_residues
        ),
        "desired_contact_fraction": (
            f"{candidate.desired_contact_fraction:.6f}"
        ),
        "model_path": str(candidate.model_path),
    }


def write_ranking_csv(path: Path, candidates):
    fields = [
        "rank",
        "prediction_name",
        "selected_sample_name",
        "seed",
        "sample",
        "weighted_score",
        "ranking_score",
        "plddt",
        "pae",
        "pae_source",
        "normalized_ranking_score",
        "normalized_plddt",
        "normalized_inverse_pae",
        "interface_target_residues",
        "interface_binder_residues",
        "interface_atom_contacts",
        "total_target_contact_residues",
        "desired_contact_fraction",
        "model_path",
    ]

    with path.open("w", newline="") as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=fields,
        )
        writer.writeheader()

        for candidate in candidates:
            writer.writerow(candidate_to_row(candidate))


def copy_selected_cif_files(candidates, destination: Path):



    destination.mkdir(parents=True, exist_ok=True)

    for candidate in candidates:
        destination_name = (
            f"rank_{candidate.rank:02d}_"
            f"{candidate.prediction_name}.cif"
        )

        shutil.copy2(
            candidate.model_path,
            destination / destination_name,
        )


def json_candidate(candidate: Candidate):
    data = asdict(candidate)

    for key in [
        "model_path",
        "summary_path",
        "ranking_path",
    ]:
        data[key] = str(data[key])

    return data


def main():
    parser = argparse.ArgumentParser(
        description=(
            "Filter RF3 samples by the desired 6EXS interface, "
            "select the best sample per prediction, and rank "
            "the resulting predictions."
        )
    )

    parser.add_argument(
        "--input-dir",
        default="./rf3_6EXS_reference_cofold",
    )
    parser.add_argument(
        "--output-dir",
        default="./rf3_6EXS_top20",
    )
    parser.add_argument(
        "--target-chain",
        default="A",
    )
    parser.add_argument(
        "--binder-chain",
        default="B",
    )
    parser.add_argument(
        "--contact-cutoff",
        type=float,
        default=5.0,
        help="Heavy-atom contact cutoff in angstroms",
    )
    parser.add_argument(
        "--min-interface-residues",
        type=int,
        default=3,
        help=(
            "Minimum distinct desired-interface residues "
            "contacted by the binder"
        ),
    )
    parser.add_argument(
        "--min-desired-contact-fraction",
        type=float,
        default=0.0,
        help=(
            "Minimum fraction of contacted receptor residues "
            "inside the desired interface"
        ),
    )
    parser.add_argument(
        "--top",
        type=int,
        default=20,
    )
    parser.add_argument(
        "--pae-metric",
        choices=["interface", "overall"],
        default="interface",
    )
    parser.add_argument(
        "--ranking-weight",
        type=float,
        default=0.50,
    )
    parser.add_argument(
        "--plddt-weight",
        type=float,
        default=0.25,
    )
    parser.add_argument(
        "--pae-weight",
        type=float,
        default=0.25,
    )

    args = parser.parse_args()

    input_directory = (
        Path(args.input_dir).expanduser().resolve()
    )
    output_directory = (
        Path(args.output_dir).expanduser().resolve()
    )

    if not input_directory.is_dir():
        raise NotADirectoryError(
            f"Input directory not found: {input_directory}"
        )

    model_paths = sorted(
        input_directory.glob("**/*_model.cif")
    )

    if not model_paths:
        raise FileNotFoundError(
            f"No *_model.cif files under {input_directory}"
        )

    accepted_samples = []
    rejected_samples = []
    errors = []

    print(f"Found {len(model_paths)} RF3 sample structures")

    for index, model_path in enumerate(
        model_paths,
        start=1,
    ):
        try:
            files = corresponding_files(model_path)

            contacts = calculate_contacts(
                model_path=model_path,
                target_chain=args.target_chain,
                binder_chain=args.binder_chain,
                cutoff=args.contact_cutoff,
            )

            accepted = (
                contacts["interface_target_residues"]
                >= args.min_interface_residues
                and contacts["desired_contact_fraction"]
                >= args.min_desired_contact_fraction
            )

            print(
                f"[{index}/{len(model_paths)}] "
                f"{files['name']}: "
                f"interface residues="
                f"{contacts['interface_target_residues']}, "
                f"desired fraction="
                f"{contacts['desired_contact_fraction']:.2f}, "
                f"{'accepted' if accepted else 'rejected'}"
            )

            if not accepted:
                rejected_samples.append(
                    {
                        "name": files["name"],
                        "prediction_name": (
                            files["prediction_name"]
                        ),
                        "reason": "interface_filter",
                        **contacts,
                        "model_path": str(model_path),
                    }
                )
                continue

            plddt, pae, pae_source = (
                read_confidence_metrics(
                    files["summary_path"],
                    args.pae_metric,
                )
            )

            ranking_score = read_ranking_score(
                files["ranking_path"],
                expected_seed=files["seed"],
                expected_sample=files["sample"],
            )

            accepted_samples.append(
                Candidate(
                    name=files["name"],
                    prediction_name=files["prediction_name"],
                    seed=files["seed"],
                    sample=files["sample"],
                    model_path=model_path,
                    summary_path=files["summary_path"],
                    ranking_path=files["ranking_path"],
                    plddt=plddt,
                    pae=pae,
                    pae_source=pae_source,
                    ranking_score=ranking_score,
                    **contacts,
                )
            )

        except Exception as error:
            print(
                f"[{index}/{len(model_paths)}] ERROR: "
                f"{model_path}"
            )
            print(f"  {error}")

            errors.append(
                {
                    "model_path": str(model_path),
                    "error": str(error),
                }
            )

    if not accepted_samples:
        raise RuntimeError(
            "No RF3 samples passed the interface filter"
        )


    score_candidates(
        accepted_samples,
        ranking_weight=args.ranking_weight,
        plddt_weight=args.plddt_weight,
        pae_weight=args.pae_weight,
    )


    best_predictions = select_best_sample_per_prediction(
        accepted_samples
    )

    for rank, candidate in enumerate(
        best_predictions,
        start=1,
    ):
        candidate.rank = rank

    top_candidates = best_predictions[: args.top]

    output_directory.mkdir(
        parents=True,
        exist_ok=True,
    )

    write_ranking_csv(
        output_directory / "best_model_per_prediction.csv",
        best_predictions,
    )

    write_ranking_csv(
        output_directory / "top_binders.csv",
        top_candidates,
    )


    copy_selected_cif_files(
        top_candidates,
        output_directory / "structures",
    )

    (
        output_directory / "all_accepted_samples.json"
    ).write_text(
        json.dumps(
            [
                json_candidate(candidate)
                for candidate in accepted_samples
            ],
            indent=2,
        )
        + "\n"
    )

    (
        output_directory / "rejected_samples.json"
    ).write_text(
        json.dumps(rejected_samples, indent=2) + "\n"
    )

    (
        output_directory / "errors.json"
    ).write_text(
        json.dumps(errors, indent=2) + "\n"
    )

    run_summary = {
        "sample_structures_scanned": len(model_paths),
        "samples_passing_interface_filter": len(
            accepted_samples
        ),
        "predictions_with_an_accepted_sample": len(
            best_predictions
        ),
        "samples_rejected": len(rejected_samples),
        "errors": len(errors),
        "top_predictions_selected": len(top_candidates),
        "interface_ranges": INTERFACE_RANGES,
        "target_chain": args.target_chain,
        "binder_chain": args.binder_chain,
        "contact_cutoff": args.contact_cutoff,
        "min_interface_residues": (
            args.min_interface_residues
        ),
        "min_desired_contact_fraction": (
            args.min_desired_contact_fraction
        ),
        "pae_metric": args.pae_metric,
        "weights": {
            "ranking_score": args.ranking_weight,
            "plddt": args.plddt_weight,
            "inverse_pae": args.pae_weight,
        },
    }

    (
        output_directory / "run_summary.json"
    ).write_text(
        json.dumps(run_summary, indent=2) + "\n"
    )

    print()
    print(f"Sample structures scanned: {len(model_paths)}")
    print(
        "Samples passing interface filter: "
        f"{len(accepted_samples)}"
    )
    print(
        "Predictions with an accepted sample: "
        f"{len(best_predictions)}"
    )
    print(f"Selected top predictions: {len(top_candidates)}")
    print(f"Errors: {len(errors)}")
    print(
        "Ranking: "
        f"{output_directory / 'top_binders.csv'}"
    )
    print(
        "CIF structures: "
        f"{output_directory / 'structures'}"
    )


if __name__ == "__main__":
    main()
```

::

::charts-model-transporter-binder-binders-heat-map
::
