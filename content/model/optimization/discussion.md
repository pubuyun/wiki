---
title: "Discussion"
description: "Experimental thermostability results of optimized CGTase mutants and current limitations in measuring precursor-binder affinity."
hasReference: false
order: 3
---

## CGTase Thermostability

::content-components-lightbox-image
---
src:
  - https://static.igem.wiki/teams/6133/wiki/wetlab/engineering/engineering-cgtase-fig11b.avif
alt:
  - "Thermostability assay results of extracted CGTases after heat treatment, with room-temperature samples as controls."
caption: "Fig | thermostability assay results of all extracted CGTases, CGTases that were placed in room temperature were used as control."
imageBackground: white
---

::

The optimized mutants generally showed less white precipitate following heat treatment, indicating better thermostability.

For **F183W/T370R-based** mutants, all WR2, WR4 and WR8 showed improvement compared to T370R/F183W. Moreover, higher-order mutants showed better thermostability in the assay, with WR8 showing the most pronounced improvements. This indicates our design approach has the potential to introduce beneficial epistatic effects.

For **T370K-based** mutants, KR2 showed an improvement compared to T370K, while higher-order mutants did not show substantial difference. This indicates the mutations introduced in depth 4 of the diverse beam search may have an epistatic effect that decreases its thermostability, and the higher-order mutants inherits this mutations, leading to all the higher-order mutants showing no improvement.

The result may indicate deep-learning-based thermostability predictors can learn patterns enabling them to predict multipoint-mutagenesis based on pairwise mutagenesis (SPURS is trained on pairwise mutagenesis data). However, the results also reveal the insufficiency of design approach: beam search is path-dependent, thus, ineffective mutations introduced earlier can affect later high-order mutants.

### Precursor Binder Affinity

The measurement of affinity of optimized precursor binders are currently unavailable. We are still carrying out the experiments in [precursor binder cycle 2](/engineering/precursor-binder#precursor-binder-cycle-2), the results and analysis will be updated in the presentation video.
