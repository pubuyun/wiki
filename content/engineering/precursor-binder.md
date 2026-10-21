---
title: "Precursor Binder"
description: "Design, expression, functional testing, and sequence optimization of odor precursor binding proteins."
hasReference: false
order: 3
---

## Precursor Binder Cycle 1

### Characterize

We aim to engineer a protein binder to sequester the odor precursor. Cys-Gly-3M3SH can have either the (S) or (R) configuration at the stereocenter within its 3M3SH moiety, yielding the corresponding 3M3SH enantiomer upon metabolism. (S)-3M3SH has a sweat and onion-like odor, whereas (R)-3M3SH is described as fruity and grapefruit-like. :fn-ref{#2}

To reduce characteristic axillary odor, we selected Cys-Gly-(S)-3M3SH as the target for precursor binder design as it is the most prominent source of axillary odor.

### Design

To reduce the availability of Cys-Gly-(S)-3M3SH for bacterial conversion into (S)-3M3SH, we designed protein binders to sequester the precursor before uptake by *PepT<sub>Sh</sub>* (Fig. 4a–b). For simplicity, Cys-Gly-(S)-3M3SH and (S)-3M3SH are referred to as Cys-Gly-3M3SH and 3M3SH, respectively, unless otherwise specified.

Using deep-learning-guided *de novo* protein design, we generated candidate binders and selected some for experimental validation based on predicted structural confidence, ligand chirality, and complex stability. These candidates were selected for expression in *E. coli* BL21(DE3) using pET-28a(+) with a C-terminal 6×His tag (Fig. 4c–d).

::content-components-lightbox-panels
---
src:
  - https://static.igem.wiki/teams/6133/wiki/wetlab/engineering/engineering-precursor-binder-fig4a.avif
  - https://static.igem.wiki/teams/6133/wiki/wetlab/engineering/engineering-precursor-binder-fig4b.avif
  - https://static.igem.wiki/teams/6133/wiki/wetlab/engineering/engineering-precursor-binder-fig4c.avif
  - https://static.igem.wiki/teams/6133/wiki/wetlab/engineering/engineering-precursor-binder-fig4d.avif
alt:
  - "Blue precursor binder enclosing the green precursor ligand."
  - "Orange precursor binder enclosing the green precursor ligand."
  - ""
  - ""
caption: "Fig. 4 | **(a–b)** conceptualized binding of the precursor binders; **(c–d)** plasmid construct of precursor binders."
imageBackground: "#ffffff"
preserveFigureNumber: true
---

::

### Build

The plasmids containing the codon-optimized coding sequences of the designed precursor binders (BC1–11 and BR1–11) were synthesized by CoWin Biotech (Fig. 4), and were transformed into *E. coli* BL21(DE3) cells.

A single transformed colony was used to inoculate a 4 mL LB starter culture supplemented with kanamycin. After overnight culture, this starter was used to inoculate 50 mL of LB medium, which was incubated at 37 °C with shaking at 220 rpm until the OD₆₀₀ reached 0.8–1.0. Protein expression was induced by adding 0.3 mM isopropyl-β-D-thiogalactopyranoside (IPTG), followed by incubation at 16 °C for 16 h. The cells were then harvested by centrifugation at 7500 rpm for 10 min at 4 °C.

### Test

SDS-PAGE was used to verify the expression of the binders. Induced cultures were normalized to the same cell density (OD₆₀₀ = 10.0), harvested by centrifugation, and resuspended in Tris–EDTA–sucrose buffer for cell lysis. The lysate was then centrifuged to separate the soluble supernatant from the insoluble pellet. The pellet was resuspended in Tris buffer. The supernatant and resuspended pellet were analyzed by gel electrophoresis. Results showed that BC1, BC2, BC6, BR5, BC7, BC11, BR7, BR8, and BR10 were successfully expressed in supernatant (Fig. 5a).

The soluble binder proteins were subsequently purified using Ni-NTA Sepharose resin. The resin was first equilibrated with binding buffer, followed by sample loading and washing. The bound proteins were then eluted with buffer containing 250 mM imidazole.

To evaluate the ability of the designed precursor binders to limit Cys-Gly-3M3SH uptake, Ellman's assay was conducted using PepT<sub>Sh</sub>-expressing *E. coli* resting cells. Purified binder proteins were pre-incubated with 1 mM Cys-Gly-3M3SH at 37 °C for 1 h, followed by the addition of PepT<sub>Sh</sub>-expressing *E. coli* cell suspension and a further 1 h incubation at 37 °C. The subsequent steps followed the procedure established in the Surrogate Construction Cycle to determine thiol concentrations.

Nine binder candidates (BC1, BC2, BC6, BR5, BC7, BC11, BR7, BR8, and BR10) were evaluated alongside a negative control group in which PBS was added in place of the purified binder proteins during pre-incubation with Cys-Gly-3M3SH. Among these candidates, BC6, BC7, BR8, and BR10 showed reductions in thiol concentrations compared with the control. Their mean thiol concentrations were 0.2101 ± 0.0035, 0.2053 ± 0.0043, 0.2022 ± 0.0010, and 0.2016 ± 0.0084 mM GSH equivalents, respectively, compared with 0.2280 ± 0.0051 mM GSH equivalents for the control (Fig. 5b).

::content-components-lightbox-panels
---
src:
  - https://static.igem.wiki/teams/6133/wiki/wetlab/engineering/engineering-precursor-binder-fig5a-1-updated.avif
  - https://static.igem.wiki/teams/6133/wiki/wetlab/engineering/engineering-precursor-binder-fig5a-2-updated.avif
  - https://static.igem.wiki/teams/6133/wiki/wetlab/engineering/engineering-precursor-binder-fig5a-3-updated.avif
alt:
  - "SDS-PAGE of precursor binder expression, with yellow arrows marking candidate bands."
  - "Gel panels compare soluble and pellet fractions of precursor binders."
  - "SDS-PAGE of additional precursor binder candidates and cell fractions."
imageBackground: "#ffffff"
preserveFigureNumber: true
columns: 3
autoLabels: false
---

::

::content-components-lightbox-panels
---
src:
  - https://static.igem.wiki/teams/6133/wiki/wetlab/engineering/engineering-precursor-binder-fig5a-4-updated.avif
  - https://static.igem.wiki/teams/6133/wiki/wetlab/engineering/engineering-precursor-binder-fig5a-5-updated.avif
alt:
  - "Gel panels show soluble, pellet, and imidazole-eluted fractions of precursor binders."
  - "Gel panels compare precursor binder expression and purified fractions."
caption: "Fig. 5a | SDS-PAGE results showing the protein expression of the 22 binders in BL21(DE3); cell fractions of untransformed BL21(DE3) were used as control (S: supernatant after cell lysis; P: pellet after cell lysis; 250: fractions eluted with 250 mM imidazole)."
imageBackground: "#ffffff"
preserveFigureNumber: true
autoLabels: false
---

::

::content-components-lightbox-image
---
src:
  - https://static.igem.wiki/teams/6133/wiki/wetlab/engineering/engineering-precursor-binder-fig5b.avif
alt:
  - "BC6, BC7, BR8, and BR10 have significantly lower thiol levels than the negative control; the lowest mean is about 0.20 mM GSH equivalents."
caption: "Fig. 5b | Ellman's assay of the precursor binders; error bars represent ±SD (*n* = 3); PBS served as the negative control, in place of the purified binder proteins; Welch’s unpaired two-tailed t-test was used to compare each binder with the negative control; significant differences relative to the negative control are marked with asterisks; *p < 0.05, **p < 0.01; unmarked comparisons were not significant."
imageBackground: "#ffffff"
preserveFigureNumber: true
width: 1463
height: 1025
---

::

### Learn

The reduction in thiol concentrations shown by the four binders - BC6, BC7, BR8, and BR10 - indicates their potential of effectively binding with the precursor and reducing its uptake by the PepT<sub>Sh</sub>-expressing *E. coli*.

Although these four candidates demonstrated the potential to reduce precursor uptake, their performance indicated room for further improvement. Increasing their binding affinity for the precursor could improve capture efficiency, further reducing precursor availability. Therefore, in the next cycle, we focused on optimizing the binding affinity of the selected candidates.

## Precursor Binder Cycle 2

### Design

We aim to improve the affinity of BC7, BR8, and BR10 for Cys-Gly-(S)-3M3SH.

We adapted the *LASErMPNN* neural proofreading strategy described by Fry et al. :fn-ref{#6} to identify mutations. The predicted complexes are minimized. Residues within 5 Å of the ligand are then evaluated.

We selected the mutations that the deep-learning model favors (the model has a higher possibility to choose the mutated residue than the original residue). Among all mutations ranked by possibility advantage, we prioritize candidates at buried, ligand-contacting positions, then predict and minimize their structures to filter any buried polar residues introduced without suitable hydrogen bond interactions.

The following designs are selected for testing in [Precursor Binder Cycle 2](/engineering/precursor-binder#precursor-binder-cycle-2).

::content-components-captioned-table
---
caption: "Table 1 | **Selected candidates for precursor binder affinity design.** RMSD is calculated from Cα atoms to the minimized unmutated parent protein."
---

|Candidate|Substitutions|ΔNLL|Cα RMSD (Å)|
|---|---|---|---|
|BC7-M1|F18L|-1.9438|0.594|
|BC7-M2|A73R|-1.9406|0.755|
|BC7-M3|F18L + A73R|-1.9438 / -1.9406|0.698|
|BR8-M1|M48R|-3.6877|0.703|
|BR8-M2|K127L|-1.2490|0.649|
|BR8-M3|M48R + K127L|-3.6877 / -1.2490|0.622|
|BR10-M1|K60V|-1.4368|0.715|

::

::content-components-lightbox-panels
---
src:
  - https://static.igem.wiki/teams/6133/wiki/wetlab/engineering/engineering-precursor-binder-fig6a.avif
  - https://static.igem.wiki/teams/6133/wiki/wetlab/engineering/engineering-precursor-binder-fig6b.avif
  - https://static.igem.wiki/teams/6133/wiki/wetlab/engineering/engineering-precursor-binder-fig6c.avif
alt:
  - ""
  - ""
  - ""
caption: "Fig. 6 | **(a–c)** Plasmid construct of optimized precursor binders."
imageBackground: "#ffffff"
preserveFigureNumber: true
---

::

### Build

The plasmids containing the coding sequences of the designed binder mutants  (Fig. 6) were synthesized by CoWin Biotech. However, we had not received the plasmids to proceed with experimental validation within the available timeframe. We plan to continue the wet-lab experiments throughout the remainder of October and November.
