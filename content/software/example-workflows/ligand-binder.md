---
title: "Ligand Binder"
description: "Design ligand-binding proteins using atom selection, backbone generation, sequence design, prediction, and filtering."
hasReference: false
order: 0
---

## Overview

This preset designs proteins to bind a small molecule.

::content-components-lightbox-image
---
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/software/example-workflows-ligand-binder-fig1.avif
alt: "Connected ligand input, atom selectors, backbone generation, LigandMPNN, RosettaFold3, filtering, viewing, and saving nodes."
caption: "Fig. 1 | Ligand-binder workflow."
---

::

The graph is available as `ligand-binder-denovo.fuiworkflow` from the **Presets** list in the header. Its values are demonstration defaults, not universal design parameters.

## Workflow

### 1. Load the ligand

::content-components-panel-layout
---
height: 32rem
label: "Ligand Binder: text and figure 2"
---
#left
The **Ligand Input** node reads a ligand *PDB*. FoundryUI validates and standardizes the structure, then outputs a "Ligand".

To reproduce the example, download [Cys-Gly-(S)-3M3SH.pdb](https://gitlab.igem.org/2026/software/greatbay-scie/foundryui/-/raw/main/example_inputs/Cys-Gly-%28S%29-3M3SH.pdb) and upload it in the **Ligand Input** node. For another project, replace it with the intended molecule.

#right
:::content-components-lightbox-image
---
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/software/example-workflows-ligand-binder-fig2.avif
alt: "A ligand PDB file-upload control and a 3D Viewer button output a Ligand payload."
caption: "Fig. 2 | Ligand Input node."
---

:::
::

### 2. Select interacting atoms

The **Atom Selector** opens the ligand in a 3D structure viewer and allows the user to select atoms. It outputs a list of atoms for which atom constraints are needed.

::content-components-lightbox-panels
---
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/software/example-workflows-ligand-binder-fig3-a.avif
  - https://static.igem.wiki/teams/6133/wiki/drylab/software/example-workflows-ligand-binder-fig3-b.avif
alt:
  - The Atom Fixed viewer displays the ligand as colored sticks with atom-selection controls and a Submit button.
  - The Atom buried viewer displays the ligand as colored spheres and bonds with atom-selection controls and a Submit button.
caption: "Fig. 3 | (a) Fixed-atom selection in the 3D selector. (b) Buried-atom selection in the 3D selector."
---

::

In this case, the selectors are used to select fixed atoms and buried atoms for *RFdiffusion3* inputs.

### 3. Generate binder backbones

::content-components-panel-layout
---
height: 32rem
label: "Ligand Binder: text and figure 4"
---
#left
**RFdiffusion3 SM Binder** generates protein–ligand complexes around the selected atoms. The preset uses:

|Parameter|Preset value|Meaning|
|---|---|---|
|Length|`120-200`|Allowed binder-length range|
|Batches|`1`|Number of generation batches|
|Diffusion batch size|`2`|Designs generated per batch|

#right
:::content-components-lightbox-image
---
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/software/example-workflows-ligand-binder-fig4.avif
alt: "Ligand and selected-atom inputs feed backbone generation, with length 120–200, one batch, and diffusion batch size 2."
caption: "Fig. 4 | RFdiffusion3 SM Binder node."
---

:::
::

This only generates two designs. For production usage, increase the number of batches and diffusion batch size.

### 4. Design sequences

::content-components-panel-layout
---
height: 32rem
label: "Ligand Binder: text and figure 5"
---
#left
The generated complexes enter ***LigandMPNN***, which redesigns the sequence based on ligand context. The preset does not specify fixed residues and generates 5 designs for each input structure (number of designs = `number_of_batches` × `batch_size`).

#right
:::content-components-lightbox-image
---
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/software/example-workflows-ligand-binder-fig5.avif
alt: "A protein–ligand structure input feeds sequence design with one batch, batch size 5, seed 42, and temperature 0.050."
caption: "Fig. 5 | LigandMPNN node."
---

:::
::

### 5. Predict structures

::content-components-panel-layout
---
height: 32rem
label: "Ligand Binder: text and figure 6"
---
#left
The designed sequences and original ligand enter ***RosettaFold3***. The preset uses 50 diffusion steps, seed `42`, and a diffusion batch size of one. RF3 returns predicted structures together with confidence metrics stored as "Score" type.

#right
:::content-components-lightbox-image
---
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/software/example-workflows-ligand-binder-fig6.avif
alt: "Designed sequences and ligand inputs feed folding prediction; controls show diffusion batch size 1, 50 steps, and seed 42."
caption: "Fig. 6 | RosettaFold3 node."
---

:::
::

### 6. Filter and save

::content-components-panel-layout
---
height: 32rem
label: "Ligand Binder: text and figure 7"
---
#left
**Filter Atoms Chirality** removes complexes whose ligand stereochemistry does not match the selected targets. **Filter By Score** then ranks the candidates based on the selected metric and outputs the largest top 20.

#right
:::content-components-lightbox-image
---
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/software/example-workflows-ligand-binder-fig7.avif
alt: "Filter Atoms Chirality feeds Filter By Score, configured to retain the largest top 20 scores."
caption: "Fig. 7 | Chirality and score-filtering nodes."
---

:::
::

The remaining structures are sent to **PDB Viewer** and **Save Proteins with Scores**. The save node packages each selected PDB with its aligned score record in the `outputs` folder.
