---
title: "MD Simulation"
description: "Molecular dynamics compares CGTase mutant binding-pose stability and supports selection for experimental validation."
hasReference: false
order: 3
---

::content-components-collapsible-paragraph{title="Summary" id="summary" preview=true}

To assess whether the designed mutations improved the stability of precursor binding to CGTase, we performed molecular dynamics simulations of nine candidate mutant–precursor complexes in *GROMACS* :fn-ref{#15}. Restraints based on the experimental structure :fn-ref{#6} were applied to maintain the geometry of the covalent glycosyl–enzyme intermediate.

Each system underwent energy minimization and restrained equilibration before production simulation. RMSD profiles were then compared to evaluate stability and support mutant selection. Three mutants—F183W/T370R, T370K, and T370R—were selected for experimental validation alongside the wild-type enzyme; only F183W/T370R was successfully tested as designed.

::

## Molecular Dynamics Simulation

### System Preparation

The E257Q substitution in the 1CXL template was reverted to wild-type E257. The active enzyme structure is covalently linked to a trisaccharide. Accordingly, strict restraints were applied to the bond distance and associated bond angles between the glycosyl C1 atom and the Oδ2 atom of D229, as in PDB 1CXL :fn-ref{#6}.


### Simulation Protocol

Each system was subjected to the standard MD simulation workflow, including energy minimization, restrained equilibration, and production molecular dynamics simulation using GROMACS :fn-ref{#15}. The configurations are the same as those for [MD simulation of precursor binders](/model/precursor-binder/md-simulation), except that the duration was increased to 100 ns.

## Analysis

::content-components-video-panels
---
src:
  - https://video.igem.org/videos/embed/3xEFyz5QCbiaVRcPsk8wbu
titles:
  - "GreatBay-SCIE: MD of CGTase and the Precursor (2026)"
caption: "Video 1 | The MD trajectory illustrates the motion of CGTase and the bound Cys-Gly-3M3SH precursor."
label: CGTase and precursor MD trajectory
portrait: true
---
::

### RMSD Analysis

Substrate RMSD was calculated using the initial catalytically relevant binding pose as the reference. Lower and more stable RMSD values indicate better retention of this binding geometry during the simulation.

Several mutants showed improved substrate stability compared with the wild type, suggesting that these mutations helped maintain a more consistent catalytic binding pose.

::content-components-model-document-rmsd-xvg-chart{collection="enzyme"}
::

## Final Decision

Three mutants—F183W/T370R, T370K, and T370R—were selected for experimental validation alongside the wild-type enzyme, with priority given to carboxyl-group stabilization. Only F183W/T370R was successfully tested as designed; sequencing identified the intended T370K variant as T370L.

::content-components-lightbox-panels
---
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/cgtase-md-simulation-fig1a.avif
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/cgtase-md-simulation-fig1b.avif
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/cgtase-md-simulation-fig1c.avif
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/cgtase-md-simulation-fig1d.avif
alt:
  - "The wild-type CGTase pocket places the precursor near D229; T370 lies beside the carboxylate, while F183 and F259 border the hydrophobic tail."
  - "R370 approaches the precursor carboxylate in the CGTase pocket, with dashed lines marking proposed interactions."
  - "K370 approaches the precursor carboxylate in the CGTase pocket, with dashed lines marking proposed interactions."
  - "R370 contacts the carboxylate while W183 packs beside the precursor hydrophobic tail in the double-mutant pocket."
caption: "Fig. 1 | Proposed interaction between Cys-Gly-3M3SH and CGTase. **(a)** Wild type; **(b)** T370R; **(c)** T370K; **(d)** T370R/F183W."
imageBackground: white
label: "MD Simulation — Fig. 1"
---

::
