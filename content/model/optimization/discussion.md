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
  - "Thermal stability assay results of extracted CGTases after heat treatment, with room-temperature samples as controls."
caption: "Fig | thermal stability assay results of all extracted CGTases, CGTases that were placed in room temperature were used as control."
imageBackground: white
---

::

The optimized mutants generally showed less white precipitates following heat treatment, indicating better thermostability.

For **F183W/T370R-based** mutants, all WR2, WR4 and WR8 showed improvement compared to T370R/F183W. Moreover, higher-order mutants showed better thermostability in the assay, with WR8 showing the most pronounced improvements. This indicates our design approach has the potential to introduce beneficial epistatic effects.

For **T370K-based** mutants, KR2 showed an improvement compared to T370K, while higher-order mutants didn't show significant difference. This indicates the mutations introduced in depth 4 of the diverse beam search may have an epistatic effect that decreases its thermostability, and the higher-order mutants inherits this mutations, leading to all the higher-order mutants showing no improvement.

The result may indicate deep-learning-based thermostability predictors can learn patterns enabling them to predict multipoint-mutagonsis based on pairwise mutagonsis (SPURS is trained on pairwise mutagonsis data). However, the design approach may carry risks since uneffective mutations introduced earlier can affect later high-order mutants, since a beam-search keeps the previous mutations and build up mutations.

### Precursor Binder Affinity

The measurement of affinity of optimized precursor binders are currently unavailable. We are still carrying out the experiments in [engineering/cycle6](/engineering/precursor-binder#precursor-binder-cycle-2), the results and analysis will be updated in the presentation video.
