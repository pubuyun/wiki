---
title: "Discussion"
description: "Comparison of computational confidence, structural consistency, molecular dynamics, and experimental responses across two precursor-binder design routes."
hasReference: false
order: 5
---

## Result

::content-components-lightbox-panels
---
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/precursor-binder-discussion-fig1a.avif
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/precursor-binder-discussion-fig1b.avif
alt:
  - "Nine scatter plots for four RFdiffusion3 binders compare A412 signal reduction with folding, interface, and MD metrics. Lower interface PAE and MD ligand RMSD and higher ipTM associate with greater reduction; aligned ligand scRMSD trends opposite to expectations."
  - "Nine scatter plots for five Proteina-Complexa binders compare A412 signal reduction with folding, interface, and MD metrics. Most show weak associations, and MD metrics do not consistently follow the expected screening direction."
caption: "Fig. 1 | Relationships between computational metrics and experimental responses of precursor binders designed by *RFdiffusion3* and *Proteina-Complexa*. Top: RFdiffusion3 designs (n = 4). Bottom: Proteina-Complexa designs (n = 5). Each point represents one tested binder, with A412 signal (an indicator of 3M3SH concentration, with lower values indicating lower odorant concentrations) reduction calculated as 100 × (1 − mean binder A412/mean control A412). (A/J) *pLDDT*; (B/K) interface PAE; (C/L) ipTM; (D/M) aligned ligand scRMSD; (E/N) *RF3* confidence ranking score; (F/O) *pTM*; (G/P) estimated binding free energy (ΔG) from MM/PBSA; (H–I/Q–R) the mean and SD of MD ligand RMSD, over 10–50 ns. Pearson r and Spearman ρ are reported in each plot. OLS regression lines are plotted when |r| > 0.50; the blue line indicates an anticipated trend, while orange lines indicate trends not expected."
imageBackground: white
layout: stack
label: "Discussion — Fig. 1"
autoLabels: false
---

::

## RFdiffusion

### Computational Metrics

Interface-related metrics in the RFdiffusion3 branch showed strong agreement with experimental responses: **i_pAE** and **ipTM** displayed the expected trend. However, **pLDDT** showed limited linear correlation with experimental results.

The **RF3 ranking score** (0.8 × ipTM + 0.2 × pTM) showed a high Pearson correlation (r = 0.95), but a weaker rank correlation (ρ = 0.40), indicating that it has a linear association but does not show accurate ranking. This may be due to the limited variation, since the candidates are filtered by top-n based on ranking score itself.

However, ligand scRMSD showed a strong trend opposite to the expected direction. This is probably due to the limited number of experimental candidates. It does not justify selecting candidates for larger scRMSD.

### MD Metrics

MD metrics showed strong agreement with the experimental results.

Both the mean and standard deviation of ligand RMSD were negatively associated with experimental response (Pearson r = −0.97 and −0.92, respectively; Spearman ρ = −0.80 for both). These results are consistent with the hypothesis that stable binding poses may support experimental performance.

MM/PBSA estimates also showed a consistent linear association: a more negative ΔG value generally corresponds to larger signal reductions, while showing limited agreement in ranking (r = −0.72; ρ = −0.40).

## Proteina-Complexa

### Computational Metrics

Among the Proteina-Complexa candidates, pLDDT showed the strongest relationship with experimental results (r = 0.67; ρ = 0.80). In contrast, i_pAE, ipTM, pTM, and the RF3 confidence ranking score showed little association.

Aligned ligand scRMSD also showed an unexpected weak positive association with response.

These suggest that confidence and self-consistency metrics are insufficient individually to predict the experimental response.

### MD Metrics

The Proteina-Complexa candidates did not show the strong relationship between MD stability and experimental results observed in the RFdiffusion3 branch.

Mean and SD of ligand RMSD showed limited alignment with experimental results (r = 0.24 and 0.48, respectively; ρ = 0.30 for both). As in the RFdiffusion3 branch, MM/PBSA estimates showed a directionally consistent negative association (r = −0.49; ρ = −0.60), but did not accurately indicate ordering.

### Custom Composite Score

::content-components-lightbox-image
---
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/precursor-binder-discussion-fig2.avif
alt:
  - "Five Proteina-Complexa binders show a positive association between custom composite score and A412 signal reduction (Pearson r = 0.76; Spearman rho = 0.60)."
caption: "Fig. 2 | **Relationship between the custom composite score and experimental responses of Proteina-Complexa-designed precursor binders.** Each point represents one tested binder (n = 5), with A412 signal (an indicator of 3M3SH concentration, with lower values indicating lower odorant concentrations) reduction calculated as 100 × (1 − mean binder A412/mean control A412). The composite score was calculated as 200 × pLDDT − i_pAE − 62 × min_ipAE + 50 × min_ipSAE − 5 × binder_scRMSD_ca − 2 × ligand_scRMSD − 2 × ligand_scRMSD_aligned, using pLDDT on a 0–1 scale. Pearson r = 0.76 and Spearman ρ = 0.60 are reported. An OLS regression line is plotted."
imageBackground: white
---

::

The custom composite score showed the strongest linear association with experimental response (r = 0.76).

::content-components-lightbox-image
---
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/precursor-binder-discussion-fig3.avif
alt:
  - "Aligned rows compare seven weighted score contributions with A412 signal reduction for five Proteina-Complexa binders. min_ipSAE and aligned ligand scRMSD substantially affect score ordering, which differs from experimental response."
caption: "Fig. 3 | **Composite score contributions and experimental responses of Proteina-Complexa binders.** (A) Colored bars show the seven weighted score contributions to the composite score; black diamonds show each composite score minus the candidate mean. (B) Experimental response, expressed as A412 signal reduction: 100 × (1 − mean binder A412/mean control A412). Corresponding binders share the same row."
imageBackground: white
---

::

Decomposition of the custom composite score showed that although pLDDT supplied the largest contribution, which is expected, the min_ipSAE and aligned ligand scRMSD also substantially influenced candidate ordering.

An omission analysis showed that removing the aligned ligand scRMSD penalty reproduced the experimental order exactly, also increasing Pearson r from 0.76 to 0.91. This suggests that this factor contributes to the mismatch in the tested subset. However, more data are required to determine whether the current weight overemphasizes structural self-consistency.

## Discussion

The computational metrics showed route-dependent agreement with experimental results. Interface-related metrics in the RFdiffusion3 branch showed agreement with the experimental results.

MD provides complementary evidence, especially in the RFdiffusion3 branch. In the Proteina-Complexa branch, the MD metrics did not agree with the experimental results. Differences between the model architectures of Proteina-Complexa (partially latent flow matching) and RFdiffusion3 (a diffusion model, as in RoseTTAFold3) may reduce the accuracy of RF3 predictions for Proteina-Complexa. Consequently, ligand RMSD may partly reflect relaxation of the predicted pose, reducing its reliability. Incorporating another folding tool, such as AlphaFold, and carrying out more independent MD simulations on each binder would help verify this relationship.

Future work should emphasize testing more experimental candidates to verify the composite score and adjust the weights.
