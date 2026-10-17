---
title: "Optimization"
description: "Computational strategies optimize CGTase thermostability and the affinity of experimentally selected precursor binders."
hasReference: false
order: 5
---

Two computationally designed CGTase parents (T370K and T370R/F183W) were selected for further thermal stability optimization. Sequencing identified the intended experimental T370K variant as T370L, which is labeled T370L in the experimental result plots.

::content-components-lightbox-image
---
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/optimization-fig1.avif
alt:
  - "Functionally important positions are excluded before stability scoring, pairwise compatibility analysis, diverse beam search, and experimental testing of multipoint mutants."
caption: "Fig. 1 | **Schematic of thermal stability optimization workflow.**
  Starting from T370K and T370R/F183W parent enzymes, important residues are
  excluded from mutation. Remaining positions are screened with SPURS for
  favorable single substitutions. Pairwise compatibility analysis and a diverse
  beam search construct multi-point mutants, which are selected for experimental
  testing at increasing mutation counts :fn-ref{#32} :fn-ref{#33}."
imageBackground: white
---

::

After experimental validation of precursor binders, BC7, BR8 and BR10 are selected for further affinity optimization.

::content-components-lightbox-image
---
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/optimization-fig2.avif
alt:
  - "Selected precursor binders undergo complex preparation, pocket definition, single-position proofreading, conditional probability scoring, burial filtering, co-folding, and polar validation."
caption: "Fig. 2 | **Schematic for precursor binder affinity optimization
  workflow.** Predicted structures of experimentally selected binders are
  minimized and prepared. LASErMPNN neural proofreading is used to rank
  substitutions at ligand-pocket positions. Mutations that pass the subsequent
  filters are selected for wet-lab testing :fn-ref{#7}."
imageBackground: white
---

::
