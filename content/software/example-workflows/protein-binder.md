---
title: "Protein Binder"
description: "Design protein binders using target and hotspot selection, backbone generation, co-folding, and ranking."
hasReference: false
order: 0
---

## Overview

This preset designs a new protein binder against a selected surface on a target protein.

::content-components-lightbox-image
---
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/software/example-workflows-protein-binder-fig1.avif
alt: "Target input and selectors feed RFdiffusion3, two chain-filter and sequence-conversion branches, RosettaFold3, ranking, viewing, and saving."
caption: "Fig. 1 | Protein-binder workflow."
---

::

Load `proteinbinder.fuiworkflow` from the **Presets** list in the header. The included target and residue selections are examples and must be replaced for a new target.

## Workflow

### 1. Load and inspect the target

::content-components-panel-layout
---
height: 32rem
label: "Protein Binder: text and figure 2"
---
#left
The **Protein Input** node loads the target *PDB* and outputs a protein.

To try the workflow, download [6EXS.pdb](https://gitlab.igem.org/2026/software/greatbay-scie/foundryui/-/raw/main/example_inputs/6EXS.pdb) and upload it in the **Protein Input** node. Inspect its chain identifiers and residue numbering before making selections.

#right
:::content-components-lightbox-image
---
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/software/example-workflows-protein-binder-fig2.avif
alt: "The file-upload control has loaded 6EXSclean.pdb and offers a File Selector + 3D Viewer button."
caption: "Fig. 2 | Protein Input node."
---

:::
::

### 2. Define the binding site

The **Residue Selector** allows the user to select residues on the target protein in a 3D interface.

The **Residue Atom Selector** then narrows the selection to specific atoms.

::content-components-lightbox-panels
---
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/software/example-workflows-protein-binder-fig3-a.avif
  - https://static.igem.wiki/teams/6133/wiki/drylab/software/example-workflows-protein-binder-fig3-b.avif
alt:
  - Residue Selector displays a multicolored protein cartoon with a residue list and selection controls above the structure.
  - Residue Atom Selector displays isolated residue side chains as sticks with highlighted atoms and selection controls.
caption: "Fig. 3 | (a) Selected residues on the target protein. (b) Selected atoms from the chosen residues."
---

::

### 3. Generate binder candidates

::content-components-panel-layout
---
height: 32rem
label: "Protein Binder: text and figure 4"
---
#left
The target structure and hotspots enter ***RFdiffusion3* Protein Binder**. The preset requests one batch with a diffusion batch size of five. Its *RFdiffusion3 contig* is `100-300,/0,A370-380`. A detailed configuration explanation can be found in [the official *Rosetta Foundry* documentation](https://rosettacommons.github.io/foundry/models/rfd3/examples/protein_binder_design.html).

The contig and hotspot selections must agree with the uploaded target.

#right
:::content-components-lightbox-image
---
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/software/example-workflows-protein-binder-fig4.avif
alt: "Protein and hotspot inputs feed binder generation; the node includes contig, loop, batch-count, and diffusion batch-size controls."
caption: "Fig. 4 | RFdiffusion3 Protein Binder node."
---

:::
::

### 4. Prepare co-folding inputs

::content-components-lightbox-image
---
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/software/example-workflows-protein-binder-fig5.avif
alt: "Two Chain Filter branches pass through Protein To Sequence and connect both sequence streams to RosettaFold3 in Co-folding mode."
caption: "Fig. 5 | Co-folding nodes."
---

::

Two **Chain Filter** branches separate the generated binder and target chains.

Each filtered structure passes through **Protein To Sequence**, producing one sequence input for the binder and another for the target.

Both sequence streams connect to ***RosettaFold3*** in `Co-folding` mode. This asks RF3 to predict the binder–target complex.

### 5. Rank and inspect

::content-components-panel-layout
---
height: 32rem
label: "Protein Binder: text and figure 6"
---
#left
RF3 produces predicted complexes and aligned score records.

**Filter By Score** keeps the five highest `ranking_score` candidates. The filtered structures go to **PDB Viewer**, while **Save Proteins with Scores** packages the structures and their scores in `outputs`.

#right
:::content-components-lightbox-image
---
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/software/example-workflows-protein-binder-fig6.avif
alt: "Predicted structures and scores are ranked with Is largest top enabled and Top / threshold set to 5."
caption: "Fig. 6 | Filter By Score node."
---

:::
::
