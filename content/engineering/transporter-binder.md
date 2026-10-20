---
title: "Transporter Binder"
description: "Design and testing of protein binders targeting the conformational transitions of PepTSh."
hasReference: false
order: 5
---

## Characterize

We aim to engineer a protein inhibiting *PepT<sub>Sh</sub>* transport. PepT<sub>Sh</sub> characterization indicated that transition from the inward-facing (IF) to the outward-facing state (OF) is the rate-limiting step in its transport cycle :fn-ref{#11}. Comparison of the two conformational states identified accessible extracellular features associated with the IF state, which were then used to determine the binding interface. Moreover, compact binder designs are favored to enhance accessibility through the Gram-positive cell wall.

## Design

To reduce the transport activity of PepT<sub>Sh</sub> and thereby decrease the uptake and subsequent metabolism of the malodor precursor, we *de novo* designed protein binders targeting accessible extracellular regions of the IF state, with the aim of restricting the IF-to-OF conformational transition.

Based on molecular dynamics simulations, five candidates were selected for wet-lab validation according to their predicted structural confidence, binding stability, and binding free energy.

::content-components-lightbox-panels
---
src:
  - https://static.igem.wiki/teams/6133/wiki/wetlab/engineering/engineering-transporter-binder-fig12a.avif
  - https://static.igem.wiki/teams/6133/wiki/wetlab/engineering/engineering-transporter-binder-fig12b.avif
alt:
  - ""
  - "T7-driven pET-28a(+) construct encodes an N-terminal DsbA signal peptide, a TB1–TB5 binder, and a C-terminal 6×His tag."
caption: "Fig. 12 | **(a)** Predicted structure of transporter binder (green) bound to PepT<sub>Sh</sub> (gray); **(b)** plasmid construct of TB1–TB5."
imageBackground: "#ffffff"
preserveFigureNumber: true
layout: stack
---

::

## Build

The selected PepT<sub>Sh</sub> binders (TB1–TB5) were individually cloned into the pET-28a(+) expression vector. As PepT<sub>Sh</sub> is located in the inner membrane of *E. coli* :fn-ref{#1}, its accessibility to externally introduced protein binders is limited by the low permeability of the outer membrane :fn-ref{#12}. Therefore, periplasmic expression was adopted to enable the binders to access PepT<sub>Sh</sub>. To achieve this, the DsbA signal peptide (UniProt entry P0AEG4, residues 1–19) was fused to the N-terminus of each binder (Fig. 12) to direct its translocation into the periplasm via the Sec pathway :fn-ref{#13}. The plasmids were synthesized by Guangzhou RiboBio and transformed into *E. coli* BL21(DE3) competent cells containing the PepT<sub>Sh</sub>-expression plasmid, establishing a dual-plasmid system for evaluating the effects of the binders on precursor uptake by PepT<sub>Sh</sub>. Protein expression was performed under the same conditions and procedures as [Precursor Binder Cycle 1](/engineering/precursor-binder#precursor-binder-cycle-1).

## Test

After cell lysis with TES buffer, the samples were centrifuged, and the pellets were resuspended. Both the soluble and insoluble fractions were analyzed by SDS-PAGE. Target bands were observed in the soluble fractions, indicating successful soluble expression of all five transporter binders (Fig. 13a).

Ellman’s assay was then performed to evaluate the effects of the five transporter binders on 3M3SH production using engineered *E. coli* co-expressing PepT<sub>Sh</sub> and the corresponding binders. All five candidates showed lower mean thiol concentrations than the control, BL21(DE3) carrying PepT<sub>Sh</sub> and an empty vector (Fig. 13b), with statistically significant reductions observed for TB1–TB4. These findings were consistent with their intended function of lowering precursor uptake by PepT<sub>Sh</sub>. Among the four candidates, TB2 exhibited the greatest reduction in thiol concentration, with a mean value of 0.2614 ± 0.0127 mM compared with 0.3566 ± 0.0131 mM GSH equivalents for the control, representing a 26.70% decrease.

::content-components-lightbox-panels
---
src:
  - https://static.igem.wiki/teams/6133/wiki/wetlab/engineering/engineering-transporter-binder-fig13a.avif
  - https://static.igem.wiki/teams/6133/wiki/wetlab/engineering/engineering-transporter-binder-fig13b.avif
alt:
  - "Gel lanes show soluble expression of all five transporter binders, alongside pellet and purified fractions."
  - "TB1–TB4 significantly reduce thiol content relative to the empty-vector control; TB2 has the lowest mean, about 0.26 mM."
caption: "Fig. 13 | SDS-PAGE and Ellman's Assay results for TB1–TB5. **(a)** Expression of transporter binders in BL21(DE3); cell fractions of untransformed BL21(DE3) were used as control (S: supernatant after cell lysis; P: pellet after cell lysis, 250: fractions eluted with 250 mM imidazole); **(b)** Ellman's assay for the transporter binders; Error bars represent ±SD (*n* = 3); Statistical significance was determined using ordinary one-way ANOVA followed by Dunnett’s multiple comparisons test, with each transporter binder group compared against the empty vector control; ** indicates p < 0.01, **** indicates p < 0.0001."
imageBackground: "#ffffff"
preserveFigureNumber: true
layout: stack
---

::

## Learn

The Ellman’s assay results supported the feasibility of using *de novo* designed transporter binders to reduce 3M3SH production by interfering with PepT<sub>Sh</sub>-mediated transport of the odor precursor. All five candidates produced the intended functional effect to varying degrees, with TB2 producing the greatest reduction. This suggests that targeting the conformational transition of PepT<sub>Sh</sub> may interfere with precursor transport and thereby reduce downstream 3M3SH production.

In terms of validation methodology, while periplasmic expression in *E. coli* enabled functional evaluation of the transporter binders against PepT<sub>Sh</sub>, it cannot fully reflect the influence of the *S. hominis* cell envelope :fn-ref{#14}. Future testing in *S. hominis* under appropriate biosafety conditions would therefore provide a more physiologically relevant assessment of binder function.
