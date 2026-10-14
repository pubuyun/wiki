---
title: "Folding Prediction"
description: "Predict protein structures from FASTA sequences with RosettaFold3 and an optional ligand."
hasReference: false
order: 0
---

## Overview

This preset predicts structures from one or more protein sequences with *RosettaFold3*. An optional ligand can be included.

::content-components-lightbox-image
---
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/software/example-workflows-folding-prediction-fig1.avif
alt: "Sequence Input and optional Ligand Input feed RosettaFold3; predicted structures connect to PDB Viewer and Save Proteins with Scores."
caption: "Fig. 1 | Folding-prediction workflow."
---

::

Load `Rosetta Cofolding` from the **Presets** list in the header. This is the shortest supplied workflow and is useful for checking a new FoundryUI installation before running a larger design pipeline.

## Workflow

### 1. Load sequences

The **Sequence Input** node reads a FASTA file. Each record becomes an item in a `Batch Sequence` type, allowing several designs to be processed in one run.

Two inputs are provided:

- [Download cgtase.fasta](https://gitlab.igem.org/2026/software/greatbay-scie/foundryui/-/raw/main/example_inputs/cgtase.fasta) for a single-sequence prediction.

- [Download binders-20.fasta](https://gitlab.igem.org/2026/software/greatbay-scie/foundryui/-/raw/main/example_inputs/binders-20.fasta) for a batch of 20 candidate binders.

Upload one of these files in **Sequence Input**. For a new dataset, use unique, descriptive FASTA identifiers and valid amino-acid sequences. The identifiers help connect RF3 output directories and score rows to the original designs.

### 2. Add an optional ligand

The **Ligand Input** accepts a ligand PDB and connects it to RF3. Remove this input for protein-only prediction. When a ligand is supplied, FoundryUI converts its representation for RF3 and retains ligand context in the predicted output.

### 3. Configure RosettaFold3

The preset uses the following starting values:

|Parameter|Preset value|Purpose|
|---|---|---|
|Early-stopping *pLDDT*|`0.5`|Stops weak trajectories according to RF3 confidence|
|Diffusion batch size|`2`|Number of diffusion samples|
|Diffusion steps|`50`|Sampling depth and compute-time control|
|Seed|`42`|Reproducible random initialization|

### 4. Review outputs

RF3 returns a structure batch and an aligned score payload.

The structures are connected directly to **PDB Viewer** for visual inspection. **Save Proteins with Scores** packages each predicted structure with its score data in the `outputs` folder.
