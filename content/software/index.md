---
title: Software
citationIds:
  - "1"
  - "2"
  - "3"
  - "4"
hasReference: false
order: 0
banner: https://static.igem.wiki/teams/6133/wiki/general/banners/software.avif
bannerPosition: 100% 15%
bannerWidth: 2172
bannerHeight: 724
bannerMobilePosition: 100% 30%
bannerFit: raised
bannerBackground: "#063568"
---

## FoundryUI

We developed FoundryUI to organize computational protein design into visual flows.

This is a trial of integrating computational protein engineering with flow programming. Some other software has shown that this works well with 3D modeling (*Blender*), game programming (*GameMaker*) and image generation (*ComfyUI*). They have made overly technical workflows more accessible, and greatly reduced the effort needed to create, share and implement workflows.

::content-components-lightbox-image
---
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/software/software-overview-fig1.avif
alt: Input, generation, sequence-design, folding, filtering, viewing, and saving
  nodes connected from left to right.
caption: Fig. 1 | FoundryUI workbench showing a complete protein-design workflow.
---
::

## Motivation

*De novo* protein design involves initial design generation, sequence redesign, folding validation, and collection of results. These stages often use different programs and sometimes require writing a script.

This creates a barrier for users who understand the biological question but are less familiar with the command-line interface. It also makes collaboration difficult: commands do not clearly show why each step was chosen or how results move between stages.

## Implementation

FoundryUI brings these operations into a GUI workspace. Users connect nodes for inputs, generation, sequence redesign, folding, filtering, visualization, and saving. We included pre-designed workflows for ligand-binder design, protein-binder design, enzyme design, MPNN sequence design, and folding prediction.

- **Typed connections** prevent users from linking incompatible data.
- **3D Selectors** allow residues and atoms to be directly selected from a structure in the graphical interface.
- **Sessions and runs** ensure data is not lost when reconnecting, and retain results for inspection and sharing.

## Visual Workflow

The node-based visual programming interface is inspired by ComfyUI. Each node performs a specific task, while the connections show how data move through the flow. This makes the workflow easier to explain, modify, and reuse than a script. Teams can start from a supplied workflow, replace inputs, adjust design constraints and filters, then save the workflow for another project.

FoundryUI connects four main design tools from [*Rosetta Foundry*](https://github.com/RosettaCommons/foundry/): *RFdiffusion3* :fn-ref{#1}, *RosettaFold3* :fn-ref{#2}, *ProteinMPNN* :fn-ref{#3}, and *LigandMPNN* :fn-ref{#4}. It supports common scientific formats, including PDB, FASTA, mmCIF, SMILES, JSON, and CSV, so outputs remain available for use in other software.

## Does it work?

We introduced FoundryUI to club members at our school through an education activity. We used the visual workflow to explain the *de novo* protein modelling workflow. Students could approach protein modelling through biological decisions instead of writing commands. See the computational modelling beginners activity.

::content-components-lightbox-image
---
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/software/software-overview-fig2.avif
alt: A presenter points to a projected workflow while students sit facing the
  screen.
caption: Fig. 2 | A team member introducing a de novo protein-design workflow to
  school club members using FoundryUI.
---
::

Saved workflows can be reopened and adapted by other teams. Developers can also add new nodes to the existing visual workflow and validation system.
