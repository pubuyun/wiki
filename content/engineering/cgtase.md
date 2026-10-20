---
title: "CGTase"
description: "Engineering cyclodextrin glucanotransferase for precursor modification and improved thermal stability."
hasReference: false
order: 4
---

## CGTase Cycle 1

### Characterize

We aim to find and engineer an enzyme to chemically modify Cys-Gly-3M3SH. Cys-Gly-3M3SH contains three functional groups that could serve as sites for enzyme-catalyzed conjugation. We evaluated potential modifications at these three sites according to their compatibility with our scenario: human skin, which is mildly acidic and lacks an external supply of high-energy cosubstrates or cofactors. We finally selected hydroxyl-group glycosylation with CGTase. :fn-ref{#9}

::content-components-lightbox-panels
---
src:
  - https://static.igem.wiki/teams/6133/wiki/wetlab/engineering/engineering-cgtase-fig7a.avif
  - https://static.igem.wiki/teams/6133/wiki/wetlab/engineering/engineering-cgtase-fig7b.avif
alt:
  - "The hydroxyl, amino, and carboxyl groups of Cys-Gly-3M3SH are highlighted as three possible modification sites."
  - "Reaction scheme shows CGTase attaching a glucosyl group to the hydroxyl group of Cys-Gly-3M3SH."
caption: "Fig. 7 | **(a)** Three potential modification sites of Cys-Gly-3M3SH **(b)** Glycosylation Reaction of Cys-Gly-3M3SH, catalyzed by CGTase."
imageBackground: "#ffffff"
preserveFigureNumber: true
layout: stack
---

::

Docking and molecular dynamics further showed that the precursor could remain accommodated within the wild-type CGTase pocket, while revealing incomplete interactions around its carboxylate group and hydrophobic tail.

### Design

Based on the interaction deficiencies identified in wild-type MD simulation, we adopted a rational design strategy, introducing targeted binding-pocket mutations to stabilize the precursor.

T370 was replaced with Lys, Arg, or His to introduce electrostatic interactions with the carboxylate group, while F183 and F283 were replaced with Trp to strengthen hydrophobic packing. These mutations were combined into a series of mutants which were subsequently evaluated by MD simulations to examine their effects on substrate binding and active-site interactions.

Among them, T370K, T370R/F183W, and T370R showed improved and stable interactions with the target substrate, and were selected for experimental validation.

::content-components-lightbox-panels
---
src:
  - https://static.igem.wiki/teams/6133/wiki/wetlab/engineering/engineering-cgtase-fig8a.avif
  - https://static.igem.wiki/teams/6133/wiki/wetlab/engineering/engineering-cgtase-fig8b.avif
  - https://static.igem.wiki/teams/6133/wiki/wetlab/engineering/engineering-cgtase-fig8c.avif
  - https://static.igem.wiki/teams/6133/wiki/wetlab/engineering/engineering-cgtase-fig8d.avif
alt:
  - ""
  - ""
  - ""
  - ""
caption: "Fig. 8 | Plasmid constructs encoding wild-type CGTase and its variants; **(a)** Wild type; **(b)** T370R; **(c)** T370K; **(d)** T370R/F183W."
imageBackground: "#ffffff"
preserveFigureNumber: true
---

::

### Build

pET-28a(+) plasmids carrying the coding sequences for wild-type CGTase, CGTase T370K, T370R/F183W, and T370R (Fig. 8) were synthesized by CoWin Biotech, followed by transformation into *E. coli* BL21(DE3). Then proteins were expressed using the same procedures as [Precursor Binder Cycle 1](/engineering/precursor-binder#precursor-binder-cycle-1).

However, a later review of our records revealed that the intended T370K variant was unexpectedly obtained as T370L.

### Test

After TES cell lysis and centrifugation, SDS-PAGE demonstrated successful protein expression of all mutants of CGTase in supernatant (Fig. 9a). However, T370R yielded a faint band after purification, suggesting low protein production, and was therefore excluded from subsequent experiments.

To evaluate the effects of the wild-type CGTase and the engineered variants on 3M3SH production, Ellman’s assay was conducted. The CGTase candidates were incubated with the precursor and maltodextrin for 1 h. The resultant mixtures were then incubated with PepT<sub>Sh</sub>-expressing *E. coli* BL21(DE3). Absorbance at 412 nm was subsequently measured and converted to thiol concentrations using a GSH standard curve.

The results (Fig. 9b) showed that thiol concentrations in the mixtures treated with wild-type CGTase, CGTase T370L, and CGTase T370R/F183W were 0.282 ± 0.004 mM, 0.328 ± 0.063 mM, and 0.314 ± 0.011 mM, respectively. The mean thiol concentration in each treatment group was more than 50% lower than that of the negative control (0.676 ± 0.108 mM GSH equivalents), in which the precursor and maltodextrin were incubated with phosphate-buffered saline (PBS) before PepT<sub>Sh</sub>-expressing *E. coli* were added.

::content-components-lightbox-panels
---
src:
  - https://static.igem.wiki/teams/6133/wiki/wetlab/engineering/engineering-cgtase-fig9a.avif
  - https://static.igem.wiki/teams/6133/wiki/wetlab/engineering/engineering-cgtase-fig9b.avif
alt:
  - "Gel lanes compare CGTase variants, soluble and pellet fractions, and purified proteins; arrows mark bands near 78 kDa."
  - "Wild-type, T370L, and T370R/F183W CGTase reduce thiol content to about 0.28–0.33 mM versus about 0.68 mM in the negative control."
caption: "Fig. 9 | SDS-PAGE and Ellman's Assay results of mutants of CGTase; **(a)** SDS-PAGE analysis of CGTase expressed in E. coli BL21(DE3); cell fractions of untransformed BL21(DE3) were used as control; S, supernatant; P, pellet; 250, fractions eluted with 250 mM imidazole; WT, wild-type CGTase; yellow arrows indicate bands near 78 kDa, consistent with the expected size of CGTase; **(b)** Ellman's Assay of the CGTase; PBS served as the negative control; error bars represent ±SD (*n* = 3); statistical analysis used one-way ANOVA followed by Dunnett’s multiple comparisons test; asterisks indicate significant differences compared with the negative control; *** indicates p < 0.001."
imageBackground: "#ffffff"
preserveFigureNumber: true
layout: stack
---

::

### Learn

Although both engineered CGTase variants reduced thiol production compared with the negative control, wild-type CGTase exhibited the lowest mean thiol concentration under the tested conditions. This suggests that the tested variants offered no clear improvement over wild-type CGTase in this assay. However, because only T370R/F183W was tested as designed, while the intended T370K variant was obtained as T370L, the effectiveness of our rational design strategy remains inconclusive.

During the [second meeting with KleanK Company](/human-practices/stage-4-optimising-product#cycle-1-evonik-and-second-meeting-with-kleank), we were reminded that enzymes can be denatured by high temperatures during warehouse storage and transportation. According to Kelly et al., CGTase from *B. circulans* strain 251 retained only 50% of its β-cyclization activity after heating at 66.1 °C for 30 min :fn-ref{#10}, raising concern regarding its ability to retain activity during warehouse storage and transportation, when products may encounter elevated temperatures or temperature fluctuations. Therefore, we planned to optimize the sequences of these CGTase variants to improve their thermal stability and industrial applicability.

## CGTase Cycle 2

### Design

To optimize the thermal stability of CGTase tested, we developed a workflow using *SPURS* :fn-ref{#7} (a deep-learning-based thermal stability prediction tool) to introduce multi-point mutations improving thermal stability of CGTase. First, single point mutations with stabilizing effects were selected. Then, pairwise compatibility testing and a diverse beam search algorithm were used to build up increasingly higher-order mutants while avoiding predicted pairwise conflicts.

Finally, variants carrying 2, 4, 6, or 8 additional substitutions relative to each parent variant were selected for testing.

### Build

Plasmids encoding the redesigned CGTase variants (Fig. 10) were synthesized by CoWin Biotech. WR6 and KR6 were not delivered in time and were therefore excluded from this round of testing. The remaining constructs (KR2, KR4, KR8, WR2, WR4, and WR8) were transformed into *E. coli* BL21(DE3). Protein expression followed the procedure described in [Precursor Binder Cycle 1](/engineering/precursor-binder#precursor-binder-cycle-1).

::content-components-lightbox-panels
---
src:
  - https://static.igem.wiki/teams/6133/wiki/wetlab/engineering/engineering-cgtase-fig10a.avif
  - https://static.igem.wiki/teams/6133/wiki/wetlab/engineering/engineering-cgtase-fig10b.avif
alt:
  - ""
  - ""
caption: "Fig. 10 | Plasmid construct of the optimized CGTase mutants: **(a)** KR **(b)** WR."
imageBackground: "#ffffff"
preserveFigureNumber: true
---

::

### Test

SDS-PAGE verified the soluble expression of the available CGTase variants (Fig. 11). A qualitative heat-induced precipitation assay was then performed using purified protein samples. Samples underwent two 5-min heating cycles at 85 °C, while corresponding samples maintained at room temperature served as unheated controls.

Following heat treatment, visible white precipitates were observed in the wild-type, T370L, and T370R/F183W samples. In contrast, little visible precipitation was observed in T370R, WR2, WR4, and WR8. The remaining redesigned variants showed some visible precipitation (Fig. 11).

::content-components-lightbox-panels
---
src:
  - https://static.igem.wiki/teams/6133/wiki/wetlab/engineering/engineering-cgtase-fig11a.avif
  - https://static.igem.wiki/teams/6133/wiki/wetlab/engineering/engineering-cgtase-fig11b.avif
alt:
  - "SDS-PAGE shows expression of redesigned KR and WR CGTase variants in soluble and pellet fractions."
  - "Heated tubes show visible precipitates in wild-type, T370L, and T370R/F183W samples, with little precipitation in T370R and WR2, WR4, and WR8; unheated controls appear below."
caption: "Fig. 11 | SDS-PAGE analysis and heat-induced precipitation assay of CGTase variants; **(a)** protein expression of mutants of CGTase in *E. coli* BL21(DE3); cell fractions of untransformed BL21(DE3) were used as control (S: supernatant after cell lysis; P: pellet after cell lysis); **(b)** heat-induced precipitation assay results of all the purified CGTase samples; corresponding samples maintained at room temperature served as unheated controls."
imageBackground: "#ffffff"
preserveFigureNumber: true
---

::

### Learn

WR2, WR4, and WR8 showed little visible precipitation after heat treatment, in contrast to the visible precipitates observed in the wild-type, T370L, and T370R/F183W samples. These results provide initial experimental support for our computational redesign strategy by demonstrating reduced heat-induced precipitation in these variants under the tested conditions. Further quantitative assays are needed to assess enzymatic activity after heating.
