---
title: RFDiffusion
description: RFdiffusion generation, sequence redesign, folding, and candidate ranking.
order: 210
---

## Batch LigandMPNN

::code-group{defaultValue="0" sync="rfdiffusion-ligandmpnn" label="LigandMPNN batch workflow"}

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
