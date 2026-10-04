---
title: Usage
description: Understand FoundryUI nodes, typed connections, sessions, runs, and the basic visual workflow.
hasReference: false
order: 1
---

## Core concepts

### Nodes and types

::content-components-panel-layout
---
height: 32rem
label: RosettaFold3 node and node types
---
#left
A node (for example, *RosettaFold3*) is one operation, processing inputs to its outputs. Inputs are on the left, outputs are on the right, and controls inside the node define parameters. The **Nodes** list includes operations such as loading structures, selecting atoms, backbone generation, sequence redesign, folding prediction, analysis, filtering, viewing, and saving.

#right
![RosettaFold3 node](https://static.igem.wiki/teams/6133/wiki/drylab/software/software-usage-fig1.avif "Fig. 1 | RosettaFold3 node.")
::

Port types prevent invalid connections. FoundryUI has types such as ligands, proteins, protein–ligand complexes, sequences, scores, residues, and atoms. Batch types preserve alignment between structures and their score records.

View descriptions of all nodes on our **[FoundryUI GitLab Pages site](https://foundryui-dd6bba.igem.wiki/){.font-semibold.text-primary.underline.decoration-primary/60.decoration-2.underline-offset-4.transition-colors.hover:decoration-primary}**.

### Runs and artifacts

- **Run** validates and executes the graph. The header displays state and progress.
- **Logs** show raw command output.
- **Issues** report validation or runtime errors.
- **Results** lists files produced by save nodes.

Concepts:

- A **session** stores the workflow and latest run. If a node and its inputs are unchanged, FoundryUI may reuse its previous output.
- A `.fuiworkflow` **file** is the reusable protocol.
- A **run archive** contains all results from one execution.

## Basic workflow

![Header showing the API status dot, workflow action icons, Presets list, run readout, and Run button](https://static.igem.wiki/teams/6133/wiki/drylab/software/software-usage-fig2.avif "Fig. 2 | Header showing the API status dot, workflow action icons, Presets list, run readout, and Run button.")

1. Enter the API endpoint in the header and use the plug button. A green status dot indicates a successful connection.
2. Choose a workflow from **Presets**.
3. Upload the requested files to the input nodes.
4. Connect compatible ports and review parameters such as batch size, seed, and thresholds.
5. Click **Run** and correct any item shown in **Issues**.
6. When a manual node pauses, make the requested selection in the **Structure Viewer** dialog and select **Submit**.
7. Inspect structures and logs, then download selected files from **Results** or the complete archive.
8. Save the `.fuiworkflow` file for reuse.
