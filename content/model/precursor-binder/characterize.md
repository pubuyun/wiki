---
title: Characterize
citationIds:
  - "3"
  - "4"
description: Stereochemical analysis defines Cys-Gly-(S)-3M3SH as the binder target and establishes chirality constraints for design and validation.
hasReference: false
order: 1
---

::content-components-collapsible-paragraph
---
id: summary
preview: "true"
title: Summary
---
Because our objective was to reduce characteristic axillary malodor, we selected **Cys-Gly-(S)-3M3SH** as the target stereoisomer for binder design. This stereochemical definition was therefore treated as a design constraint throughout the computational workflow.
::

## Stereochemistry of Precursor

Cys-Gly-3M3SH exists as two stereoisomers, Cys-Gly-(S)-3M3SH and Cys-Gly-(R)-3M3SH, which are metabolized into the corresponding 3M3SH enantiomers. (S)-3M3SH has a sweat- and onion-like odor, whereas (R)-3M3SH is described as fruity and grapefruit-like :fn-ref{#3}.

::content-components-lightbox-image
---
alt:
  - ""
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/precursor-binder-characterize-fig1.avif
caption: Fig. 1 | Structure diagrams for Cys-Gly-(S)-3M3SH and Cys-Gly-(R)-3M3SH
  precursors and the smells of their corresponding 3M3SH molecules :fn-ref{#3}.
imageBackground: white
---
::

## Stereochemical Constraint

Protein–ligand recognition is highly dependent on three-dimensional ligand geometry, making correct stereochemistry essential for designing a stereochemically appropriate binding pocket. However, diffusion-based all-atom structure models can occasionally introduce stereochemical errors in small-molecule coordinates, even when the correct stereochemical information is provided in the input :fn-ref{#4}.

We therefore explicitly specified Cys-Gly-(S)-3M3SH using a stereochemically defined SMILES representation and an SDF file with correct chirality in both computational design pipelines. A post-folding chirality filter also checked the ligand and retained only candidates containing the required Cys-Gly-(S)-3M3SH configuration for downstream analysis.

## Design Requirements

To preserve the required ligand configuration throughout the workflow, we:

- used the stereochemically specified SMILES and correct SDF of Cys-Gly-(S)-3M3SH as the input for [*RF3*](/model/precursor-binder/design-rfdiffusion#validation) [co-folding](/model/precursor-binder/design-rfdiffusion#validation) and [*Proteina-Complexa*](/model/precursor-binder/design-proteina-complexa#generation) [generation](/model/precursor-binder/design-proteina-complexa#generation);
- wrote a script to verify the chirality of Cys-Gly-3M3SH in each predicted structure from RF3 and Proteina-Complexa.
