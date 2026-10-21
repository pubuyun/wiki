---
title: Measurement
description: Quantitative thiol assays, standard-curve preparation, and experimental results for evaluating 3M3SH production in an engineered *Escherichia coli* platform.
hasReference: false
order: 0
banner: https://static.igem.wiki/teams/6133/wiki/general/banners/measurements.avif
bannerPosition: 50% 100%
bannerWidth: 1834
bannerHeight: 1100
bannerMobilePosition: 50% 70%
---

## Introduction

GreatBay-SCIE 2026 aims to develop several protein-based approaches to reduce the formation of 3-methyl-3-sulfanylhexan-1-ol (3M3SH), a major contributor to axillary odor, by limiting the availability and uptake of its precursor, *S*-(1-hydroxy-3-methylhexan-3-yl)-ʟ-cysteinylglycine (Cys-Gly-3M3SH) :fn-ref{#1}. To assess the effectiveness of these approaches, we used engineered *Escherichia coli* as a surrogate platform and sought a quantitative method to evaluate changes in 3M3SH production.

We adopted Ellman's assay to measure free thiol content in the reaction mixtures, providing an indirect indication of 3M3SH production. The assay uses inexpensive, commercially available reagents and commonly available equipment, such as a microplate reader, making it an accessible and reproducible measurement approach for other iGEM teams.

## Thiol Concentration Assay

### Background

Ellman's assay is a widely used colorimetric method for measuring free thiol content. Its rapid and stoichiometric reaction enables semi-quantitative assessment of 3M3SH production from its precursor, helping us evaluate the effectiveness of our various protein-based approaches.

### Principle

Ellman's assay is based on the reaction between 5,5′-dithiobis(2-nitrobenzoic acid) (DTNB, Ellman's reagent) and free thiol groups, producing 2-nitro-5-thiobenzoate (TNB) in a 1:1 stoichiometric ratio. TNB exhibits strong absorbance at 412 nm, allowing free thiol content to be determined spectrophotometrically :fn-ref{#2}.

### Protocol

#### Standard Curve Preparation

**Apparatus and materials**

- **Apparatus:** Pipette, vortex mixer, 96-well plate, and microplate reader
- **Materials:** 10.1 mM DTNB stock solution, 8 mM GSH stock solution, DTNB, and Assay Buffer

**Procedures**

1. Prepare GSH standards at concentrations of 0, 0.125, 0.25, 0.5, 1, 2, and 4 mM through serial dilution with Assay Buffer, as summarized in Table 1.
2. Prepare the Ellman's Reagent Solution by mixing DTNB stock solution with Assay Buffer at a ratio of 1:35.
3. Add 20 µL of each GSH standard and 180 µL of Ellman's Reagent Solution to a 96-well plate. Include three technical replicates per concentration.
4. Incubate at room temperature (20–25 °C) for 15 minutes.
5. Measure absorbance at 412 nm using a microplate reader.
6. Plot absorbance against GSH concentration to generate a standard curve. Use the resulting calibration equation to determine free thiol concentrations in experimental samples.

::content-components-captioned-table
---
caption: "Table 1 | **Preparation of GSH standard concentrations.** Each dilution is prepared using the solution from the preceding concentration."
---

| **GSH concentration (mM)** | **GSH solution (µL)** | **Assay Buffer (µL)** |
| :-----------------------: | :------------------: | :-------------------: |
|             4             |   200 (8 mM stock)   |          200          |
|             2             |      200 (4 mM)      |          200          |
|             1             |      200 (2 mM)      |          200          |
|            0.5            |      200 (1 mM)      |          200          |
|           0.25            |     200 (0.5 mM)     |          200          |
|           0.125           |    200 (0.25 mM)     |          200          |
|             0             |          0           |          200          |

::

::content-components-lightbox-image
---
src:
  - https://static.igem.wiki/teams/6133/wiki/wetlab/measurement/measurement-measurement-fig1.avif
alt: ""
caption: "Fig. 1 | GSH standard curve for the DTNB–Ellman's assay. Error bars represent ± SD (n = 3)."
---

::

#### Sample Thiol Quantification

**Apparatus and materials**

- **Apparatus:** Pipette, centrifuge, 96-well plate, and microplate reader
- **Materials:** 10.1 mM DTNB stock solution, Assay Buffer, and reaction supernatants

**Procedures**

1. Reaction mixtures were prepared and incubated according to the experimental procedures for each protein-based approach, as detailed in the Protocol section. The reaction supernatants were then collected and analyzed using Ellman's assay as described below.
2. Centrifuge the reaction mixtures at 10,000 rpm and 4 °C for 10 minutes to collect the supernatants.
3. Prepare fresh Ellman's Reagent Solution by mixing DTNB stock solution with Assay Buffer at a ratio of 1:35.
4. Add 20 µL of each reaction supernatant and 180 µL of Ellman's Reagent Solution to a 96-well plate. For the blank control, replace the supernatant with 20 µL of Assay Buffer.
5. Mix gently and incubate at room temperature for 15 minutes.
6. Measure absorbance at 412 nm using a microplate reader.
7. Subtract the blank absorbance and use the GSH standard curve to determine the free thiol concentration of each sample.

### Results

::content-components-lightbox-panels
---
src:
  - https://static.igem.wiki/teams/6133/wiki/wetlab/measurement/measurement-measurement-fig2a.avif
  - https://static.igem.wiki/teams/6133/wiki/wetlab/engineering/engineering-precursor-binder-fig5b.avif
  - https://static.igem.wiki/teams/6133/wiki/wetlab/measurement/measurement-measurement-fig2c.avif
  - https://static.igem.wiki/teams/6133/wiki/wetlab/engineering/engineering-cgtase-fig9b.avif
alt:
  - ""
  - ""
  - ""
  - ""
caption: "Fig. 2 | **(a)** *PepT<sub>Sh</sub>* activity at varying precursor concentrations; **(b)** precursor binders; **(c)** transporter binders; **(d)** engineered CGTases. Error bars represent ± SD (n = 3). Asterisks indicate significant differences from the corresponding controls (*p* < 0.05, **p** < 0.01, ****p**** < 0.0001)."
---

::

### Discussion

The results supported the successful establishment of an engineered *E. coli* surrogate platform for evaluating our three protein-based approaches. Several candidates across the three approaches showed reduced thiol concentrations compared with their respective controls, suggesting their potential to limit 3M3SH production. These results were consistent with our aim of reducing axillary odor formation by limiting precursor availability or uptake.

Although Ellman's assay does not specifically detect 3M3SH, the differences in thiol concentrations between experimental groups and their respective controls provided preliminary evidence of the effects of our engineered proteins.

## Future Improvements

Noticeable variations between our experimental batches highlighted the importance of biological replicates in assessing the reproducibility and reliability of our results. Future experiments incorporating independent biological replicates would help validate the observed effects and improve the robustness of our conclusions.

## Reference

1. Minhas GS, Bawdon D, Herman R, et al. Structural basis of malodour precursor transport in the human axilla. eLife. 2018;7:e34995. doi: [10.7554/eLife.34995](https://doi.org/10.7554/eLife.34995).
2. Riddles PW, Blakeley RL, Zerner B. Reassessment of Ellman's reagent. Methods Enzymol. 1983;91:49–60.
