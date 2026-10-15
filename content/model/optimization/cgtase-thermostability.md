---
title: "CGTase Thermostability"
description: "Conservation filtering, SPURS scoring, pairwise compatibility, and diverse beam search propose thermostable CGTase multipoint mutants."
hasReference: false
order: 1
---

::content-components-lightbox-image
---
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/optimization-cgtase-thermostability-fig1.avif
alt:
  - "Conserved and functionally important positions are excluded, single mutations are scored, a pairwise graph guides diverse beam search, and multipoint designs proceed to testing."
caption: "Fig. 1 | Schematic of thermal stability optimization workflow."
imageBackground: white
---

::

## Filtering

The design begins with PDB 1CXI :fn-ref{#28}. The following are excluded from mutation:

- Highly conserved residues, evaluated using *Rate4Site* :fn-ref{#29} and *ConSurf* :fn-ref{#30};

- residues within 6 Å of ligand heavy atoms;

- residues within 5 Å of calcium ions;

- disulfide-forming cysteines;

- positions 370 and 183.


## Single-Point Mutagenesis

The remaining positions are screened with [*SPURS*](https://github.com/luo-group/SPURS) :fn-ref{#31} using the T370K and T370R/F183W mutated sequences and their predicted structures from *AlphaFold 3*. For each mutant, single mutations with ΔΔG below -0.5 kcal/mol are retained, as instructed in the paper.

## Multi-Point Mutagenesis

### Pairwise Compatibility Graph

Because SPURS is trained primarily on single- and double-mutation data, its predictions for multipoint mutants may be less reliable. Inspired by *FireProt* :fn-ref{#32}, we built a pairwise compatibility graph where each node represents a single mutation and each edge is classified with the mutation pair's predicted stability and epistasis.

For mutations $i$ and $j$, the epistatic effect is defined as $\varepsilon_{ij}=\Delta\Delta G(i,j)-\Delta\Delta G(i)-\Delta\Delta G(j)$.

A pair is:

- **severely incompatible** if $\Delta\Delta G(i,j)>-0.5$, or $\varepsilon_{ij}>1.0$, or the two mutations affect the same residue position;

- **highly compatible** if $\Delta\Delta G(i,j)<-1.2$ and $\varepsilon_{ij}<0.5$;

- **intermediate** if it is in between.

This graph utilizes the more reliable pairwise predictions for constructing multi-point mutants.

### Diverse Beam Search

The multi-point mutations are generated using a diverse beam search.

For a combination containing $t$ mutations, its high-confidence edge ratio is calculated as $q(S)=|E_{\mathrm{high}}(S)|/\binom{t}{2}$. Combinations with $q(S)>0.70$ are assigned to the high-confidence pool. Others are assigned to the intermediate pool.

At each depth, 50% of the beam is selected from the high-confidence pool and 50% from the intermediate pool. Intermediate candidates will fill any unused high-confidence capacity.  

Starting from compatible double mutants, the algorithm iteratively expands each combination $S$ with a candidate mutation $m$ only if:

- $m$ is not severely incompatible with any mutation in $S$;

- $m$ contributes at least $-0.5$ to the overall predicted $\Delta\Delta G$ of $S$.

Diversity is enforced using the **number of different mutations** (distance) between two combinations $S_1,S_2$, defined as $d(S_1,S_2)=|S_1|-|S_1\cap S_2|$.

Minimum distances are enforced:

- $d > 1$ for 2- to 6-point mutants;

- $d > 2$ for 7- to 8-point mutants.

The frequency of any individual mutation is limited to 35% within each beam.


## Design Result

::content-components-lightbox-panels
---
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/optimization-cgtase-thermostability-fig2a.avif
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/optimization-cgtase-thermostability-fig2b.avif
alt:
  - ""
  - ""
caption: "Fig. 2 | **SPURS-guided mutation optimization of T370K (top panel) and T370R/F183W (bottom panel).** The embedded plots (a–d) show: **(a)** single-mutation score distribution; **(b)** pairwise compatibility of the 40 top-ranked candidates; **(c)** selected multi-mutation scores across search depths; the blue line represents the lowest score per depth. **(d)** Added-mutation score contributions; the dashed line represents the marginal threshold. Boxes show medians and interquartile ranges; whiskers indicate 1.5× interquartile range."
imageBackground: white
layout: stack
label: "CGTase Thermostability — Fig. 2"
autoLabels: false
---

::

Final candidates are chosen by comparing designs from both mutants. Candidate pairs with fewer identical mutations are preferred, followed by those with the lowest combined SPURS scores. These predictions are tested experimentally by adding two mutations each time, to test the method's reliability as the number of mutations increases.

The counts of 2, 4, 6, and 8 mutations refer to additional substitutions relative to the T370K or T370R/F183W parent, rather than total substitutions from wild type. The following computational designs were selected for testing in cycle 4:

- **T370K**

    - **A245F/T370K/A430V**

    - **A245F/T370K/A430V/T487I/A566I**

    - **A245F/T370K/A430V/T487I/A566I/A572V/E580V**

    - **A245F/Q344M/T370K/A430V/A442V/T487I/A566I/A572V/E580V**

- **F183W/T370R**

    - **F183W/A245W/T370R/A566V**

    - **F183W/A245W/T370R/A430I/A566V/E580I**

    - **F183W/A245W/N269C/T370R/A430I/D518C/A566V/E580I**

    - **N94C/F183W/D208Y/A245W/N269C/T370R/A430I/D518C/A566V/E580I**
