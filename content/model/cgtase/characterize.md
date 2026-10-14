---
title: "Characterize"
description: "Reaction feasibility, docking, and molecular dynamics identify hydroxyl glycosylation and a reference CGTase precursor-binding pose."
hasReference: false
order: 1
---

::content-components-collapsible-paragraph{title="Summary" id="summary" preview=true}

Our objective is to modify the precursor, or connect it to a larger molecule, to reduce its compatibility with PepT-mediated transport :fn-ref{#1}. We chose the hydroxyl-group glycosylation with CGTase (cyclodextrin glucanotransferase) as it provided the most suitable option in the intended reaction environment. 

We combined molecular docking with molecular dynamics simulations to identify a stable precursor-binding pose and guide binding-pocket optimization.

::

## Modifying the Precursor

To function under axillary conditions, the donor molecule should be readily available and stable in aqueous solutions at RTP. High-energy donors like acyl-CoA and ATP are inappropriate. The enzyme must be stable at RTP, work in acidic pH :fn-ref{#23}, and must not require complex cofactors.

::content-components-lightbox-image
---
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/cgtase-characterize-fig1.avif
alt:
  - ""
caption: "Fig. 1 | Potential functional groups for modification on Cys-Gly-3M3SH; Hydroxyl (green), Amino (blue), Carboxyl (red)"
imageBackground: white
---

::

### Modifying Amine

An enzyme MTGase (microbial transglutaminase) catalyzes the crosslinking of  the ε-amino group of lysine to the amide side chain of glutamine to form an amide, releasing ammonia. We considered using it to connect the amino group of the precursor to Cbz-Gln-Gly, a commonly used testing substrate for MTGase :fn-ref{#24}. However, it generally requires a sufficiently long, unbranched carbon chain adjacent to the primary amine for efficient substrate recognition. :fn-ref{#25}. Structural analysis suggested that adapting MTGase to the shorter amine substrate would likely require more extensive redesign than simple modification of the substrate-binding pocket.

::content-components-lightbox-image
---
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/cgtase-characterize-fig2.avif
alt:
  - "Microbial transglutaminase is proposed to crosslink the precursor amino group with a glutamine-containing donor, releasing ammonia."
caption: "Fig. 2 | Proposed crosslinking reaction of Cys-Gly-3M3SH and Cbz-Gln-Gly catalysed by MTGase;"
imageBackground: white
---

::

### Modifying Carboxylate

Forming an amide or ester bond directly from a carboxylate is thermodynamically unfavorable in aqueous solution. Also, since carboxylates are poor electrophiles at slightly acidic pH, the carboxylate group normally has to be activated before efficient nucleophilic substitution can occur. Biological carboxylate activation commonly relies on ATP-dependent intermediates or other activated acyl donors, which are incompatible with our requirement for a simple and stable reaction system. Therefore, this route is not considered.

### Modifying Hydroxyl

An enzyme CGTase (cyclodextrin glucanotransferase) conjugates alcohol and polysaccharide to form alkyl polyglycosides :fn-ref{#26}. The precursor Cys-Gly-3M3SH contains a hydrophobic moiety containing a hydroxyl group. We reasoned that it is possible to be recognized as a substrate for CGTase. The product, an O-glycosylated derivative of Cys–Gly-3M3SH, is expected to fall outside the substrate profile of PepT. 

::content-components-lightbox-image
---
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/cgtase-characterize-fig3.avif
alt:
  - "CGTase is proposed to glycosylate the hydroxyl group of Cys-Gly-3M3SH using a carbohydrate donor."
caption: "Fig. 3 | Proposed glycosylation reaction of Cys-Gly-3M3SH catalysed by CGTase;"
imageBackground: white
---

::

## Characterizing Binding

Previous structural and biochemical studies have characterized the CGTase active site and the binding modes of its native substrates :fn-ref{#6}, providing a structural basis for evaluating whether Cys-Gly-3M3SH could be accommodated as a non-native acceptor.

The CGTase structure (PDB: 1CXL :fn-ref{#6}) was used as the docking template. Its E257Q substitution was reverted to wild-type E257 before docking and MD simulation. A distance constraint of <3.5 Å was applied between the glycosyl C1 atom and the oxygen atom of the precursor’s hydroxyl group to maintain a potential catalytic geometry. 

*Glide* :fn-ref{#27} generated 86 docking poses, which were clustered into nine groups based on the ligand RMSD. One representative pose from each cluster was selected for molecular dynamics simulation to evaluate whether the proposed binding modes remained stable under dynamic conditions.

Among the nine representative conformations, one remained stably accommodated within the substrate-binding pocket throughout the 50-ns simulation. The stable conformation from MD simulation was selected as the reference binding pose for subsequent structural analysis.

::content-components-lightbox-panels
---
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/cgtase-characterize-fig4a.avif
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/cgtase-characterize-fig4b.avif
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/cgtase-characterize-fig4c.avif
alt:
  - ""
  - ""
  - ""
caption: "Fig. 4 | **Characterize process of CGTase.** **(a)** tree diagram of clustering docking poses. The dotted line represents the ligand RMSD threshold for clustering. **(b)** 9 representative docking poses **(c)** Proposed interaction between Cys-Gly-3M3SH and CGTase, derived from MD run. Green marks C1 of the Asp229-linked glycosyl–enzyme intermediate, the target of nucleophilic attack by the acceptor hydroxyl oxygen during transglycosylation."
imageBackground: white
label: "Characterize — Fig. 4"
---

::

::content-components-model-rmsd-xvg-chart
---
title: CGTase-9 RMSD
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/enzyme/analysismd/run-cg3m3sh-cgtase-9-lig.js
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/enzyme/analysismd/run-cg3m3sh-cgtase-9-prot.js
seriesName:
  - Ligand
  - Protein
---
::

## Design Requirements

Characterization established the following requirements for CGTase engineering:

- Use the hydroxyl group of Cys-Gly-3M3SH as the modification site.

- Preserve the catalytically compatible binding geometry in the wild-type complex verified by MD simulation.

- Optimize pocket interactions with the precursor’s carboxylate group and hydrophobic tail.
