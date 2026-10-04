---
title: "FoundryUI"
description: "A visual workspace for computational protein design, connecting generation, sequence redesign, folding, and result inspection."
hasReference: false
order: 0
---

## FoundryUI

We developed FoundryUI to organize computational protein design into visual flows.

This is a trial of integrating computational protein engineering with flow programming. Some other software has shown that this works well with 3D modeling (Blender), game programming (GameMaker), and image generation (ComfyUI). They have made overly technical workflows more accessible and greatly reduced the effort needed to create, share, and implement workflows.

![FoundryUI workbench showing a complete protein-design workflow](https://static.igem.wiki/teams/6133/wiki/drylab/software/software-foundryui-fig1.avif "Fig. 1 | FoundryUI workbench showing a complete protein-design workflow.")

### Motivation

De novo protein design involves initial design generation, sequence redesign, folding validation, and collection of results. These stages often use different programs and sometimes require writing a script.

This creates a barrier for users who understand the biological question but are less familiar with the command-line interface. It also makes collaboration difficult: commands do not clearly show why each step was chosen or how results move between stages.

### Implementation

FoundryUI brings these operations into a GUI workspace. Users connect nodes for inputs, generation, sequence redesign, folding, filtering, visualization, and saving. We included pre-designed workflows for ligand-binder design, protein-binder design, enzyme design, MPNN sequence design, and folding prediction.

- **Typed connections** prevent users from linking incompatible data.

- 3D selectors allow residues and atoms to be directly selected from a structure in the graphical interface.

- **Sessions and runs** ensure data is not lost when reconnecting and retain results for inspection and sharing.

<!-- Illustration pending: illustration of a protein-design workflow progressing from biological input to selected candidates. -->

### Visual Workflow

The node-based visual programming interface is inspired by ComfyUI. Each node performs a specific task, while the connections show how data move through the flow. This makes the workflow easier to explain, modify, and reuse than a script. Teams can start from a supplied workflow, replace inputs, adjust design constraints and filters, then save the workflow for another project.

FoundryUI connects four main design tools from _Rosetta Foundry_^1: _RFDiffusion3_, _RosettaFold3_, _ProteinMPNN_, and _LigandMPNN_. It supports common scientific formats, including _PDB_, _FASTA_, _mmCIF_, _SMILES_, JSON, and CSV, so outputs remain available for use in other software.

### Does it work?

We introduced FoundryUI to club members at our school through an education activity. We used the visual workflow to explain the de novo protein design workflow. Students could approach protein modelling through biological decisions instead of writing commands. <!-- Education activity link pending: See the [link to education activity]. -->

<!-- Illustration pending: image of school club members learning protein-design workflows with FoundryUI. -->

Saved workflows can be reopened and adapted by other teams. Developers can also add new nodes to the existing visual workflow and validation system.
