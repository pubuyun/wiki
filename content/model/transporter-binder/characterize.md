---
title: "Characterize"
description: "Transporter conformation, extracellular interaction networks, and cell-wall accessibility define binding-interface and binder-size requirements."
hasReference: false
order: 1
---

::content-components-collapsible-paragraph{title="Summary" id="summary" preview=true}

To establish the design criteria for a *PepT<sub>Sh</sub>* binder, we examined three key considerations: the target conformation, accessible binding surface, and binder size.

A multiscale molecular dynamics study suggested that a slow global conformational change constitutes the principal kinetic bottleneck in PepT<sub>Sh</sub> transport :fn-ref{#5}. We therefore used the experimentally determined structure (PDB: 6EXS) as the design target for a binder intended to restrict this transition :fn-ref{#1}. By comparing structures in different conformational states, we identified accessible extracellular regions and selected hotspot residues for binder generation.

::

## Target Conformation

The molecular dynamics study of PepT<sub>Sh</sub> :fn-ref{#5} identified the shift from the inward-facing (IF) state to the outward-facing (OF) state as the rate-limiting step in the entire transport cycle.

We therefore used the experimentally determined structure (PDB: 6EXS) as the design target for a binder intended to restrict this transition by lowering the energy of the IF state, raising the activation energy of the transition, and slowing the transport rate :fn-ref{#1}.

## Binding Interface

The conformational changes of PepT<sub>Sh</sub> are driven by protonation-dependent rearrangements of key salt bridges involving transmembrane helices (TMs) 1, 4, 7, and 10 :fn-ref{#5}. However, these residues are buried within the transporter and are unlikely to be directly accessible to an extracellular binder.

A homology model of the OF state of PepT<sub>Sh</sub> was derived from an MD-predicted PepTSo structure reported in the literature :fn-ref{#18}. By comparing the experimental IF structure of PepT<sub>Sh</sub> (PDB: 6EXS) :fn-ref{#1} with the OF model, we identified accessible extracellular regions and selected hotspot residues for binder generation.

Two extracellular electrostatic networks were of particular interest:

- E323-K64 on TM2–TM7

- R337-D182-E340-R184 on TM5–TM8

::content-components-lightbox-panels
---
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/transporter-binder-characterize-fig1a.avif
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/transporter-binder-characterize-fig1b.avif
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/transporter-binder-characterize-fig1c.avif
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/transporter-binder-characterize-fig1d.avif
alt:
  - ""
  - ""
  - ""
  - ""
caption: "Fig. 1 | **Structure and extracellular surface of PepT<sub>Sh</sub>.** **(a)** Inward-facing conformation of PepT<sub>Sh</sub> (PDB 6EXS); **(b)** detailed view of the electrostatic interaction network identified in structural analysis. A close-up of the highlighted region in **(a)**; **(c)** outward-facing conformation of PepT<sub>Sh</sub> (homology modelled by SWISS-MODEL :fn-ref{#8}); **(d)** broken electrostatic interaction in outward-facing PepT<sub>Sh</sub>, a close-up of the highlighted region in **(c)**. Green: C-terminal bundle; blue: N-terminal bundle; orange: TMA and TMB."
imageBackground: white
label: "Characterize — Fig. 1"
---

::

Finally, we determined the following extracellular segments and hotspot residues for binder generation. The region between the networks also forms a hydrophobic patch that provides an additional favorable interaction surface for binder engagement.

TM5–TM6: residues **168–199**, with hotspots **D182** and **R184**

TM9–TM10: residues **392–409**, with hotspot **Q401**

TM7–TM8: residues **313–347**, with hotspots **E323**, **R337**, and **E340**

TM1–TM2: residues **45–72**, with hotspot **K64**

::content-components-lightbox-panels
---
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/transporter-binder-characterize-fig2a.avif
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/transporter-binder-characterize-fig2b.avif
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/transporter-binder-characterize-fig2c.avif
alt:
  - "A ribbon model highlights the selected extracellular helices in blue against the remaining transporter in gray."
  - "A side view of the transporter marks the selected extracellular region in blue, with an arrow indicating the extracellular direction."
  - "Orange hotspot residues border a green hydrophobic patch on the blue extracellular surface."
caption: "Fig. 2 | **The target extracellular interface of PepT<sub>Sh</sub>.** **(a)** Highlight of the target region (PDB 6EXS); **(b)** side view of the selected target region; upward is the extracellular direction; **(c)** selected hotspots (orange) and the hydrophobic patch between them (green)."
imageBackground: white
label: "Characterize — Fig. 2"
---

::

## Binder Size

*S. hominis* is a Gram-positive bacterium surrounded by a thick peptidoglycan cell wall. A study of bacterial cell-wall permeability estimated that globular proteins of approximately 25 kDa or less can diffuse through the peptidoglycan meshwork :fn-ref{#19}.

After generating testing rounds and inspecting their structures, we chose to design compact, predominantly α-helical binders of 80–120 amino acids. This size range is well below 25 kDa while structurally still providing sufficient surface area to engage and stabilize the IF extracellular face, thereby stabilizing the IF conformation.

## Design Requirements

Characterization of PepT<sub>Sh</sub> established three design constraints for subsequent binder generation:

- **Conformation:** target the experimentally determined inward-facing state (6EXS) to restrict transition toward the outward-facing conformation.

- **Interface:** focus binder generation on accessible extracellular regions associated with IF-specific structural features and the surrounding hydrophobic surface.

- **Size:** limit designs to 80-120 amino acids to ensure penetration through the Gram-positive cell wall
