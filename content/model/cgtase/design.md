---
title: "Design"
description: "Structure-guided mutations target precursor carboxylate stabilization and hydrophobic-tail packing in the CGTase pocket."
hasReference: false
order: 2
---

::content-components-collapsible-paragraph{title="Summary" id="summary" preview=true}

Characterization of the wild-type complex suggested two potential targets for optimization: stabilizing the precursor’s carboxylate group and optimizing hydrophobic interactions within the binding pocket. Based on these observations, we designed nine candidate mutants for MD evaluation with different combinations of point mutations in the substrate-binding pocket.

::

## Carboxylate Group Stabilization

The MD trajectory showed that the precursor’s carboxylate group was unstable and interacted with the surrounding solvent. Wild-type CGTase lacked residues that could form stabilizing interactions with this group.

To stabilize the precursor’s negatively charged carboxylate group, we proposed replacing T370 with Lys, Arg, or His to enable salt-bridge formation

::content-components-lightbox-image
---
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/cgtase-design-fig1.avif
alt:
  - "T370 is shown beside the solvent-exposed carboxylate group of the bound precursor in the wild-type CGTase pocket."
caption: "Fig. 1 | **Structural environment of the precursor carboxylate in wild-type CGTase.** The reference binding pose indicates that the carboxylate positions near T370 (magenta). The precursor is shown with cyan carbons within the grey enzyme cartoon; the carboxylate carbon is highlighted in green."
imageBackground: white
---

::

## Hydrophobic Tail Stabilization

Although CGTase already contains a hydrophobic pocket that accommodates alcohol substrates for glycosylation, we aimed to improve its affinity for the precursor’s distinctive 3-methyl-3-sulfanylhexan-1-ol-derived moiety.

To better accommodate the precursor’s side chain, we proposed replacing F183 and F259 with Trp to increase packing around the hydrophobic tail.

::content-components-lightbox-image
---
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/cgtase-design-fig2.avif
alt:
  - "The precursor hydrophobic tail lies between F183 and F259; the tail is highlighted in orange."
caption: "Fig. 2 | **Hydrophobic-tail environment in the CGTase precursor-binding pocket.** F183 and F259 (magenta) interact with the hydroxyalkyl tail of Cys-Gly-3M3SH (orange). The remaining precursor carbons are cyan, the enzyme backbone is a grey cartoon and the Asp229-linked glycosyl moiety has yellow carbons."
imageBackground: white
---

::

## Final Mutants

Candidate mutants were designed by combining T370H, T370R, or T370K with F183W and F259W. The following mutants were evaluated by [MD simulation](/model/cgtase/md-simulation):

::content-components-captioned-table
---
caption: "Table 1 | 9 combined mutations for MD simulation evaluation."
---

| **T370 Substitution** | **Single** | **with F183W** | **with F183W and F259W** |
| :--- | :--- | :--- | :--- |
| K | T370K | T370K/F183W | T370K/F183W/F259W |
| R | T370R | T370R/F183W | T370R/F183W/F259W |
| H | T370H | T370H/F183W | T370H/F183W/F259W |

::
