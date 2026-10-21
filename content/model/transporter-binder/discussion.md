---
title: "Discussion"
description: "Experimental responses are compared with confidence metrics, structural metrics, membrane simulation results, and a composite ranking score."
hasReference: false
order: 4
---

## Results

::content-components-lightbox-image
---
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/transporter-binder-discussion-fig1.avif
alt:
  - "Nine scatter plots compare computational metrics with A412 signal reduction for five PepTSh binders. The custom score shows a positive association; binder scRMSD and contact count trend opposite to expectations, while MD metrics show limited agreement."
caption: "Fig. 1 | **Relationships between computational metrics and experimental responses of *PepT<sub>Sh</sub>* transporter binders.** Each point represents one tested binder (n = 5), with A412 signal (an indicator of 3M3SH concentration, with lower values indicating lower odorant concentrations) reduction calculated as 100 × (1 − mean binder A412/mean control A412). (A) *pLDDT*, (B) interface PAE, (C) confidence ranking score, (D) binder Cα scRMSD, (E) number of target contact residues, (F) custom weighted score, (G) binding free energy ΔG from MM/GBSA, and (H–I) the mean and SD of MD binder RMSD, respectively. MD RMSD was calculated for binder Cα atoms after least-squares fitting of transporter Cα atoms over 10–100 ns. Pearson r and Spearman ρ are reported in each plot. OLS regression lines are plotted when |r| > 0.50; the blue line indicates an anticipated trend, while orange lines indicate trends not expected."
imageBackground: white
---

::

### Computational Metrics

The comparison between computational metrics and experimental results revealed limited agreement.

- **pLDDT** and **i_pAE** metrics offered limited discrimination among the binders.

- **Confidence ranking score** showed a positive Pearson correlation (r = 0.43), although its weak Spearman correlation (ρ = 0.10) indicated that the relationship was not consistently monotonic.

Furthermore, because the candidates had already undergone computational filtering, their pLDDT values occupied a narrow range of 79.38–80.72. The limited variation may limit the ability to detect associations within the selected subset.

### Structural Metrics

Binder scRMSD and target contact residue count showed relationships opposite to the anticipated screening direction.

### MD Metrics

The MD summaries provided limited evidence for predicting the experimental ranking. Mean and standard deviation of binder RMSD over 10–100 ns showed no significant association with the response.

### Custom Composite Score

$\text{weighted score} = 0.50 \times \mathrm{normalized\ ranking\ score} + 0.25 \times \mathrm{normalized\ pLDDT} + 0.25 \times \mathrm{normalized\ inverse\ PAE}$

The custom composite score we used to rank binders showed the strongest agreement with experimental rank order (ρ = 0.80; r = 0.56), suggesting that combining confidence metrics may provide a more useful prioritization metric.

## Discussion

These findings suggest that in a filtered set of candidates, a single metric may have too little variation to support confident prediction of actual experimental performance. The custom composite score showed the strongest agreement with experimental ranking, but it needs further verification because the sample is too small.

In a complex environment (membrane protein binder), RMSD mean and standard deviation may only describe trajectory behavior without directly proving binding affinity or transport inhibition. Similarly, MM/GBSA estimates depend on sampling and methodological choices. Future evaluation should increase the number of independent MD simulations, and consider explicit entropy correction and an implicit membrane model in free energy calculation.
