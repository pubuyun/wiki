---
title: "Surrogate Construction"
description: "Construction and validation of a PepTSh-expressing Escherichia coli surrogate for whole-cell thiol assays."
hasReference: false
order: 2
---

## Design

The peptide transporter from *Staphylococcus hominis* (*PepT<sub>Sh</sub>*) is a POT (proton-coupled oligopeptide transporter) family proton-dependent symporter located at the plasma membrane of *S. hominis*, and is primarily responsible for the import of the precursor *S*‑(1‑hydroxy‑3‑methylhexan‑3‑yl)‑ʟ‑cysteinylglycine (Cys-Gly-3M3SH) (Fig. 1a) :fn-ref{#1}.

*E. coli* enables all procedures to be performed under standard high school laboratory conditions without additional biosafety facilities, offering faster experimental cycles — critical for our limited project timeframe. According to literature evidence, we established that *E. coli* possesses the ability to cleave the Cys-Gly-3M3SH conjugated substrate by endogenous peptidases and β‑lyase TnaA (tryptophanase) :fn-ref{#1}. Therefore, we designed the plasmid to express PepT<sub>Sh</sub> in *E. coli* as a suitable surrogate for subsequent activity assays of transporter binders, precursor binders, and enzymes.

We chose *pSEVA331* as our cloning vector and pMV1-AraC-PBAD, pMV1-AraC-PBAD-RiboJ as suppliers of the AraC-PBAD regulatory system. The insulator *RiboJ* was incorporated for higher expression consistency. Both parts were provided by Link Spider.

::content-components-lightbox-panels
---
src:
  - https://static.igem.wiki/teams/6133/wiki/wetlab/engineering/engineering-surrogate-construction-fig1a.avif
  - https://static.igem.wiki/teams/6133/wiki/wetlab/engineering/engineering-surrogate-construction-fig1b.avif
alt:
  - "Cys-Gly-3M3SH enters through PepT, then PepV and PatB cleave it to release 3M3SH."
  - ""
caption: "Fig. 1 | **(a)** pathway of Cys-Gly-3M3SH metabolism in *S. hominis*; **(b)** plasmid construct of PepT<sub>Sh</sub>."
imageBackground: "#ffffff"
preserveFigureNumber: true
layout: stack
---

::

## Build

Codon-optimized coding sequences for PepT<sub>Sh</sub> were synthesized by CoWin Biotech and cloned into the pSEVA331 vector alongside either AraC-PBAD or AraC-PBAD-RiboJ using Golden Gate Assembly. The resulting plasmids were then transformed into *E. coli* DH5α competent cells using chemotransformation.

The positive results of colony PCR (Fig. 2) and sequencing verified the successful construction of plasmid pSEVA331-AraC-PBAD-PepT<sub>Sh</sub>, which was subsequently transformed into *E. coli* BL21(DE3). A single positive colony was inoculated into liquid LB and cultured overnight at 37 °C with shaking at 220 rpm. The culture was then expanded, and PepT<sub>Sh</sub> expression was induced using ʟ-arabinose when OD₆₀₀ reached 0.8–1.0. The cells were then incubated overnight at 30 °C and 220 rpm to allow protein expression.

::content-components-lightbox-image
---
src:
  - https://static.igem.wiki/teams/6133/wiki/wetlab/engineering/engineering-surrogate-construction-fig2-updated.avif
alt:
  - "Colony PCR gels show the expected 3462 bp insert and an additional approximately 250 bp promoter-region product."
caption: "Fig. 2 | Colony PCR of protein coding fragment for PepT<sub>Sh</sub>."
imageBackground: "#ffffff"
preserveFigureNumber: true
width: 945
height: 804
---

::

## Test

Protein expression was verified by SDS-PAGE. We harvested the induced cultures by centrifugation at 7500 rpm for 15 min at 4 °C. The cells were lysed by sonication in tris(hydroxymethyl)aminomethane-Hydrochloric Acid  (Tris-HCl) buffer (pH 8.0). After centrifugation, the pellet was resuspended in the same buffer, and both supernatant and pellet fractions were analyzed by SDS-PAGE (Fig. 3a). Although no distinct band was observed at the expected molecular weight of PepT<sub>Sh</sub> (55.4 kDa), anomalous migration of membrane proteins may explain the presence of bands at lower apparent molecular weights :fn-ref{#8}.

[Ellman’s assay](/measurement) was subsequently performed to validate the capacity of our engineered strain to import and cleave Cys‑Gly‑3M3SH to produce the odorant 3M3SH. The assay is based on the reaction between Ellman’s reagent (DTNB) and free thiol groups, producing a yellow-colored product (TNB) that can be quantified by measuring absorbance at 412 nm. ʟ-arabinose-induced cultures of *E. coli* transformed with pSEVA331-AraC-PBAD-PepT<sub>Sh</sub> were harvested by centrifugation at 4000 RPM and 4 °C for 10 minutes, and the cell pellet was resuspended in M9 salt solution. Next, the cell suspension was incubated with Cys-Gly-3M3SH solutions at 0, 2, 3, 4, 6, 8, and 10 mM at 37 °C for 1 h. Following incubation, the samples were centrifuged, and the resulting supernatant was transferred into Ellman’s reagent solution and incubated at room temperature for 15 min. Absorbance at 412 nm was subsequently recorded using a microplate reader. The readings were converted to thiol content using a [GSH standard curve](/measurement) and reported as GSH equivalents. These measurements were used as semi‑quantitative indicators of 3M3SH levels.

The results supported the ability of our engineered *E. coli* BL21(DE3) strain to express PepT<sub>Sh</sub>, import the dipeptide precursor, and produce 3M3SH via precursor cleavage. Thiol content in the culture supernatant of the engineered strain increased significantly with rising precursor concentrations, whereas the control strain (BL21(DE3) carrying the empty pSEVA331 vector) showed almost no change (Fig. 3b).

::content-components-lightbox-panels
---
src:
  - https://static.igem.wiki/teams/6133/wiki/wetlab/engineering/engineering-surrogate-construction-fig3a-updated.avif
  - https://static.igem.wiki/teams/6133/wiki/wetlab/engineering/engineering-surrogate-construction-fig3b.avif
alt:
  - "SDS-PAGE compares soluble and pellet fractions of PepTSh-expressing cells with untransformed BL21(DE3)."
  - "Thiol content rises from near zero to about 0.31 mM in the PepTSh strain as precursor increases to 10 mM; the empty-vector control remains near zero."
caption: "Fig. 3 | **(a)** protein expression of PepT<sub>Sh</sub> in *E. coli* BL21(DE3); cell fractions of untransformed BL21(DE3) were used as control (S: supernatant after sonication; P: pellet after sonication); **(b)** activity curve of *E. coli* BL21(DE3) expressing PepT<sub>Sh</sub>; BL21(DE3) cells carrying the empty pSEVA331 vector were used as the negative control; Error bars represent ±SD (*n* = 3)."
imageBackground: "#ffffff"
preserveFigureNumber: true
layout: stack
---

::

## Learn

Although no distinct band was observed at the expected molecular weight of PepT<sub>Sh</sub> on SDS-PAGE, the strain carrying the PepT<sub>Sh</sub> construct showed a precursor-dependent increase in thiol content relative to the empty-vector control. The result was consistent with the proposed pathway of PepT<sub>Sh</sub>-mediated precursor uptake followed by intracellular cleavage by endogenous *E. coli* peptidases and TnaA, suggesting the feasibility of replacing *S. hominis* with *E. coli* for downstream activity assays.
