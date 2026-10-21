---
title: Overview
citationIds:
  - "1"
  - "2"
  - "3"
  - "4"
  - "5"
  - "6"
  - "7"
  - "8"
description: Computational modeling of precursor sequestration, transporter inhibition, CGTase engineering, and protein optimization using a Characterize–DBTL framework.
hasReference: false
order: 1
banner: https://static.igem.wiki/teams/6133/wiki/general/banners/model.avif
bannerWidth: 3600
bannerHeight: 1600
bannerFit: raised
bannerBackground: "#14274e"
bannerPosition: 50% 10%
bannerMobilePosition: 50% 10%
---

## Key Successes

- Among 9 tested **precursor binders** designed by *RFdiffusion3* and *Proteina-Complexa*, 4 were shown to be able to significantly reduce 3M3SH production compared to negative control.
- Among 5 designed **transporter binders** aiming to restrict conformational change, 4 showed a significant reduction in 3M3SH production, with a maximum reduction of 21%.
- We identified wild-type **CGTase** as a functional starting enzyme for Cys-Gly-3M3SH modification, supported by experimental activity relative to control.
- We developed a **Characterize–DBTL framework** that translates understanding of biological mechanisms into explicit design requirements.
- We compared **RFdiffusion3** and **Proteina-Complexa** for designing Cys-Gly-(S)-3M3SH binders and examined how computational metrics relate to experimental results.
- We uploaded all our **automation scripts** and built **[software](/software)** for the computational modeling process, providing reusable workflows for future iGEM teams.

## Abstract

Axillary odor arises when *Staphylococcus hominis* imports and metabolizes the odorless precursor Cys-Gly-3M3SH :fn-ref{#1} :fn-ref{#38}. To reduce precursor availability or uptake, we developed three solutions following different strategies to comprehensively suppress Cys-Gly-3M3SH uptake: a *de novo* small-molecule binding protein that sequesters the precursor Cys-Gly-3M3SH, a *de novo* protein-binding protein that inhibits the conformational changes of the transporter *PepT<sub>Sh</sub>*, and an enzyme that chemically modifies the precursor to make it unrecognizable to the transporter. We also optimized the enzyme for improved thermostability.

We introduced a Characterize stage before the conventional DBTL cycle to translate biological mechanisms and application conditions into explicit design requirements. For computational design pipelines (precursor binder, transporter binder, optimizations), we developed a decision-gated workflow. It progressively filters candidates using outputs from each computational evaluation, prioritizing the most reliable candidates for wet-lab testing.

Our experiments demonstrated the ability of the wild-type CGTase to inhibit uptake of the precursor. Comparisons between computational metrics and experimental responses of the binders revealed that metric performance depended on the design route, highlighting the need for further experimental feedback when selecting evaluation criteria.

Collectively, our workflow and automated scripts provide a tested and reusable framework for future iGEM teams that wish to carry out computational de novo protein design under limited wet-lab resources. Combined with our wet-lab efforts, this work paves the way for further development of targeted interventions against axillary odor.

## Introduction

Since Cys-Gly-3M3SH first needs to be imported into the *S. hominis* cytoplasm via a peptide transporter (PepT<sub>Sh</sub>), we hypothesized that preventing Cys-Gly-3M3SH uptake could prevent odor formation, while aiming to avoid broadly suppressing the resident skin microbiota :fn-ref{#1}. We developed three protein-engineering-based solutions to reduce Cys-Gly-3M3SH availability or uptake through distinct mechanisms.

::content-components-lightbox-image
---
alt:
  - ""
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/overview-fig1.avif
caption: Fig. 1 | Schematic for the three solutions. The precursor binder sequesters
  the precursor, preventing uptake by the PepT<sub>Sh</sub> transporter;
  the transporter binder binds to the PepT<sub>Sh</sub> transporter directly, preventing
  the uptake; CGTase chemically modifies the precursor by adding an additional
  group, making it unrecognizable to PepT<sub>Sh</sub>.
imageBackground: white
---
::

- **Precursor Binder:** selective protein binders for Cys-Gly-3M3SH designed using two different deep-learning-based design tools.
  - **Precursor Binder Affinity Optimization:** precursor binders that displayed binding ability were selected for further affinity optimization.
- **Transporter Binder:** a protein binder that could limit this uptake by blocking the transporter.
- **CGTase:** an enzyme that we characterized as being capable of glycosylating the precursor to prevent its uptake by the bacteria.
  - **CGTase Thermostability Optimization:** two CGTase mutants were selected for further thermostability optimization for industrial production.

## Characterize–DBTL Framework

### Why Characterize

As system-level and mechanistic understanding of biological systems continues to advance, synthetic biology is expanding beyond the design of genetic sequences towards the development of context-specific solutions based on understanding of biological mechanisms :fn-ref{#2}.

We therefore introduced a **Characterize** stage before the conventional DBTL cycle. By analysing the biological mechanism, target, structural context, and application environment, this stage translates biological understanding into explicit design specifications.

::content-components-lightbox-image
---
alt:
  - Problem definition, target definition, mechanistic characterization, and
    design specification lead into the Design–Build–Test–Learn cycle.
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/overview-fig2.avif
caption: Fig. 2 | **Schematic for the Characterize stage and its four substages**,
  showing the progression from problem definition to design specification, and
  finally to the conventional DBTL cycle. The Characterize stage directly connects to
  the Design stage by outputting design specifications.
imageBackground: white
---
::

### Substages

Specifically, the Characterize stage includes the following substages:

#### **1. Problem Definition**

**Establish what the design is expected to achieve.**

Define the biological problem, intended outcome, application context, and potential points of intervention.

#### **2. Target Definition**

**Specify the biological entity to be engineered.**

This may be a molecule, protein, conformational state, interaction interface, or biochemical reaction. Relevant boundaries are also defined.

#### **3. Mechanistic Characterization**

**Investigate the biological and molecular mechanisms underlying the proposed design strategy.**

Available experimental, structural, and computational evidence is used to assess plausibility of the potential mechanisms to be used in the solution.

#### **4. Design Specification**

**Translate characterization findings into explicit design requirements.**

Outputs of this substage will be the inputs for the design stage, for example, a molecule to bind, an interface to bind, or a site to modify. This substage connects the Characterize and Design stages and should be the main outcome of the Characterize stage.

### Project Application

::content-components-captioned-table
---
caption: Table 1 | The application of the Characterize stage in our project.
---
| **Strategy**       | **Approach**                     | **Target**             | **Design Specification**                                                                                                                                                      |
| :----------------- | :------------------------------- | :--------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Precursor binder   | Bind the precursor.              | Cys-Gly-3M3SH          | Use Cys-Gly-(S)-3M3SH and reject structures with wrong chirality.                                                                                                             |
| Transporter binder | Inhibit the transporter.         | PepT<sub>Sh</sub>      | Target extracellular features of inward-facing 6EXS with an 80–120-residue binder.                                                                                            |
| CGTase             | Chemically modify the precursor. | CGTase & Cys-Gly-3M3SH | Choose the transglycosylation reaction of the precursor catalysed by CGTase. Preserve the catalytic pose and optimize interactions with the carboxylate and hydrophobic tail. |
::

## Computational Design

### Computational Approach

Traditional binder design or discovery depends on large libraries of chemicals and repeated experimental screening. In contrast, we largely applied a deep-learning-guided protein design strategy. This approach was particularly valuable for us as a high school team with limited experimental resources. It reduced our reliance on large-scale wet-lab screening and allowed us to explore large design spaces computationally to prioritize a more targeted set of designs.

### Decision-Gated Workflow

We introduced a reusable, resource-aware method of integrating deep-learning-based methods with traditional physics-inspired methods.

We organized candidate selection as a decision-gated workflow, which progressively selects designs using increasingly resource-intensive methods, with evidence from each stage informing the next decision.

::content-components-lightbox-image
---
alt:
  - ""
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/overview-fig3.avif
caption: Fig. 3 | **Schematic for the funnel-shaped decision-gated workflow.**
  Each evaluation filters the candidates, leading to progressively smaller
  candidate sets.
imageBackground: white
---
::

In our project, a large number of designs are generated, enabling rapid exploration of binding structures. The following co-folding then assesses and filters the candidates. A smaller set of candidates subsequently proceeds to physics-based molecular dynamics simulation and finally experimental testing.

## Precursor Binder

> This is a summary of documents under [Precursor Binder](/model/precursor-binder). If you are interested in the detailed modeling process, please view the detailed documents.

::content-components-lightbox-panels
---
alt:
  - RFdiffusion3 and Proteina-Complexa routes converge on chirality filtering,
    ranking, 50-ns molecular dynamics, and in vitro candidate selection.
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/overview-fig4c.avif
caption: >-
  Fig. 4 | **Schematic for precursor binder design workflow.** Binders
  targeting Cys-Gly-(S)-3M3SH are designed independently through two routes:
  RFdiffusion3 and Proteina-Complexa. Top-ranked binders from each route are
  evaluated by 50-ns molecular dynamics simulations using ligand RMSD and
  MM/PBSA ΔG, and the most promising candidates are selected as final *in vitro*
  candidates :fn-ref{#9} :fn-ref{#12} :fn-ref{#13} :fn-ref{#14} :fn-ref{#15} :fn-ref{#17}.
imageBackground: white
label: Overview — Fig. 4
---
::

### Characterize

#### Problem Definition

We aim to design selective protein binders to sequester Cys-Gly-3M3SH.

#### Target Definition

**Cys-Gly-3M3SH**, the odorless precursor of axillary odor, consists of a cysteinylglycine moiety S-linked to a branched hydroxyalkyl group :fn-ref{#1} :fn-ref{#38}.

#### Mechanism Analysis

::content-components-lightbox-image
---
alt:
  - Chemical structures compare the S and R stereoisomers of the precursor and
    their corresponding thioalcohols.
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/overview-fig5.avif
caption: Fig. 5 | **Structure diagrams for Cys-Gly-(S)-3M3SH and
  Cys-Gly-(R)-3M3SH precursors and the smells of their corresponding 3M3SH molecules.** :fn-ref{#3}
imageBackground: white
---
::

3M3SH exists as two stereoisomers with distinct smells. We selected **Cys-Gly-(S)-3M3SH**, which is associated with the sweat- and onion-like odor of axillary odor, as the target molecule for binder design :fn-ref{#3}. We noted that protein–ligand recognition is stereochemistry-dependent, while deep-learning models often introduce stereochemical errors :fn-ref{#4}. We then adjusted our design specifications accordingly.

#### Design Specification

Cys-Gly-(S)-3M3SH was identified as the odor-relevant stereoisomer and therefore selected as the target for binder design. A ligand representation with explicitly defined stereochemistry should be used as input for both design pipelines, and ligand chirality should be verified after structure generation before candidates proceed to further evaluation.

### Design

Small-molecule-binding proteins targeting Cys-Gly-3M3SH were designed using *[Rosetta Foundry](/model/precursor-binder/design-rfdiffusion)* and [Proteina-Complexa](/model/precursor-binder/design-proteina-complexa) separately. The full design pipeline includes backbone scaffold generation, sequence redesign and folding validation. RFdiffusion3 binders are ranked based on the ranking\_score outputted by *RF3*, while Proteina-Complexa binders are ranked based on a custom composite score. Then, a [molecular dynamics simulation](/model/precursor-binder/md-simulation) is performed on selected top binders from each pipeline to determine the set of candidates for *in vitro* testing :fn-ref{#9} :fn-ref{#10} :fn-ref{#11} :fn-ref{#12} :fn-ref{#13} :fn-ref{#14} :fn-ref{#15}.

::content-components-lightbox-panels
---
alt:
  - A blue helical Proteina-Complexa binder surrounds a green small-molecule
    ligand in its central pocket.
  - A yellow RFdiffusion3 binder surrounds a green small-molecule ligand in a
    central pocket.
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/overview-fig4a.avif
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/overview-fig4b.avif
caption: Fig. 6 | **Sample precursor binder designs.**
  **(a)** Precursor binder designed by Proteina-Complexa; **(b)** precursor
  binder designed by RFdiffusion3.
imageBackground: white
label: Overview — Fig. 6
---
::

::content-components-video-panels
---
src:
  - https://video.igem.org/videos/embed/7xxkZgCe6RR2Vc5Q5Jx45m
  - https://video.igem.org/videos/embed/n3d9hccnPsExex4B8oYURA
titles:
  - "GreatBay-SCIE: VMD of precursor binder designed by rfd3 (2026)"
  - "GreatBay-SCIE: VMD of Precursor Binder Designed by Proteina-Complexa (2026)"
caption: "Video 1 | MD trajectories show precursor–binder motion for designs from **(a)** RFdiffusion3 and **(b)** Proteina-Complexa :fn-ref{#34}."
label: Precursor binder MD trajectories
portrait: true
---
::

22 binders (11 from each design tool) were planned for experimental testing in [Precursor Binder Cycle 1](/engineering/precursor-binder#precursor-binder-cycle-1). Nine were successfully tested: 4 from RFdiffusion3 and 5 from Proteina-Complexa.

### Discussion

::content-components-lightbox-panels
---
alt:
  - ""
  - ""
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/overview-fig6a.avif
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/overview-fig6b.avif
caption: Fig. 7 | **Relationships between computational metrics and experimental
  responses of precursor binders designed by RFdiffusion3 and
  Proteina-Complexa.** Each point represents one tested binder (n = 4 for
  RFdiffusion3 in the top panel **(a)**; n = 5 for Proteina-Complexa in the
  bottom panel **(b)**), with A412 signal (an indicator of 3M3SH concentration, with lower values indicating lower odorant concentrations) reduction calculated as 100 × (1 − mean binder A412/mean control A412). **(a)** MD metrics of 4 RFdiffusion3
  branch binders, including **(G)** estimated binding free energy (ΔG) from
  MM/PBSA; **(H–I)** the mean and SD of MD ligand RMSD, over 10–50 ns. **(b)**
  The composite score, calculated as 200 × *pLDDT* − i_pAE − 62 × min_ipAE + 50
  × min_ipSAE − 5 × binder_scRMSD_ca − 2 × ligand_scRMSD − 2 ×
  ligand_scRMSD_aligned, using pLDDT on a 0–1 scale. Pearson r and Spearman ρ
  are reported in each plot. OLS regression lines are plotted.
imageBackground: white
label: Overview — Fig. 7
layout: stack
---
::

For computational metrics, interface-related metrics in the RFdiffusion3 branch showed agreement with the experimental results. In the Proteina-Complexa route, our custom composite score showed the strongest linear correlation with experimental results.

MD provides complementary evidence, especially in the RFdiffusion3 branch, where the three MD metrics all showed the expected trend. However, in the Proteina-Complexa branch, the MD metrics did not agree with the experimental results. Differences between the model architectures of Proteina-Complexa (partially latent flow matching) and RFdiffusion3 (a diffusion model, as in RoseTTAFold3) may reduce the accuracy of RF3 predictions for Proteina-Complexa. Consequently, ligand RMSD may partly reflect relaxation of the predicted pose, reducing its reliability. Incorporating another folding tool, such as AlphaFold, and carrying out more independent MD simulations on each binder would help verify this relationship.

Future work should emphasize testing more experimental candidates to verify the composite score and adjust the weights.

## **Transporter Binder**

> This is a summary of documents under [Transporter Binder](/model/transporter-binder). If you are interested in the detailed modeling process, please view the detailed documents.

::content-components-lightbox-image
---
alt:
  - The inward-facing transporter is analyzed to select an extracellular
    interface, followed by backbone generation, sequence design, co-folding,
    interface filtering, membrane simulation, and experimental selection.
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/overview-fig7.avif
caption: Fig. 8 | **Schematic for transporter binder design workflow.** In the
  Characterize stage, we selected the extracellular interface of the
  inward-facing PepT<sub>Sh</sub> crystal structure (PDB 6EXS) as the target.
  *De novo* binders are designed using the Rosetta Foundry workflow. Top-ranked
  binders that meet the interface requirements are evaluated by molecular
  dynamics simulations using ligand RMSD and MM/GBSA ΔG, and the most promising
  candidates are selected as final wet-lab candidates :fn-ref{#1} :fn-ref{#9} :fn-ref{#17}.
imageBackground: white
---
::

### Characterize

#### Problem Definition

We aim to design a protein to inhibit the PepT<sub>Sh</sub> transporter.

#### Target Definition

PepT<sub>Sh</sub> is a proton-coupled oligopeptide transporter (POT) from *S. hominis* that imports Cys-Gly-3M3SH :fn-ref{#1}. We used the experimental inward-facing structure (PDB: 6EXS) as the receptor template.

#### Mechanism Analysis

Molecular dynamics studies of PepT<sub>Sh</sub> indicated that the transition from the inward-facing to the outward-facing state is the rate-limiting step in its transport cycle :fn-ref{#5}. Therefore, the inward-facing conformation was selected for binding stabilization to resist conformational change. Structural comparison of inward- and outward-facing models identified extracellular electrostatic interaction networks and hydrophobic surface patches that are specific to the inward-facing state. These features were subsequently used to define the target interface for binder design.

::content-components-lightbox-panels
---
alt:
  - ""
  - ""
  - ""
  - ""
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/overview-fig8a.avif
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/overview-fig8b.avif
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/overview-fig8c.avif
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/overview-fig8d.avif
caption: "Fig. 9 | **Structure and extracellular surface of PepT<sub>Sh</sub>.**
  **(a)** Inward-facing conformation of PepT<sub>Sh</sub> (PDB 6EXS); **(b)**
  detailed view of the electrostatic interaction network identified in
  structural analysis. A close-up of the highlighted region in **(a)**; **(c)**
  outward-facing conformation of PepT<sub>Sh</sub> (homology modelled by SWISS-MODEL :fn-ref{#8}); **(d)**
  broken electrostatic interaction in outward-facing PepT<sub>Sh</sub>, a
  close-up of the highlighted region in **(c)**. Green: C-terminal bundle; blue:
  N-terminal bundle; orange: TMA and TMB."
imageBackground: white
label: Overview — Fig. 9
---
::

#### Design Specification

We aim to stabilize the inward-facing conformation by a protein binder targeting the extracellular interface containing features specific to the inward-facing state. Moreover, compact binder designs are favored to enhance accessibility through the Gram-positive cell wall :fn-ref{#19}.

::content-components-lightbox-panels
---
alt:
  - A ribbon model highlights the selected extracellular helices in blue against
    the remaining transporter in gray.
  - A side view of the transporter marks the selected extracellular region in
    blue, with an arrow indicating the extracellular direction.
  - Orange hotspot residues border a green hydrophobic patch on the blue
    extracellular surface.
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/overview-fig9a.avif
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/overview-fig9b.avif
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/overview-fig9c.avif
caption: Fig. 10 | **The target extracellular interface of PepT<sub>Sh</sub>.**
  **(a)** Highlight of the target region (PDB 6EXS); **(b)** side view of the selected
  contig region; upward is the extracellular direction; **(c)** selected
  hotspots (orange) and the hydrophobic patch between them (green).
imageBackground: white
label: Overview — Fig. 10
---
::

### Design

Among the available de novo binder design frameworks, we selected Rosetta Foundry for its unified suite of protein-design tools.

The full design pipeline comprised RFD3 backbone generation, *ProteinMPNN* sequence design, and RF3 co-folding validation. Candidates were then filtered according to their predicted interface placement and ranked based on a custom composite score $\text{weighted score} = 0.50 \times \mathrm{normalized\ ranking\ score} + 0.25 \times \mathrm{normalized\ pLDDT} + 0.25 \times \mathrm{normalized\ inverse\ PAE}$, after which molecular dynamics simulations were performed on the top-ranked binders to prioritize candidates for experimental validation :fn-ref{#9} :fn-ref{#11} :fn-ref{#20}.

::content-components-video-panels
---
src:
  - https://video.igem.org/videos/embed/sbgujDE7Lq6eKGHkeoeFXh
  - https://video.igem.org/videos/embed/t1vqUKhw4yTzM9HiTEmzRf
titles:
  - "GreatBay-SCIE: Transporter Binder Interface (2026)"
  - "GreatBay-SCIE: Transporter Binder Full (2026)"
caption: "Video 2 | MD trajectories show the transporter–binder complex through **(a)** a close-up of the binding interface and **(b)** a full-system view."
label: Transporter binder MD trajectories
---
::

Selected candidates were tested experimentally in our wet lab efforts [Transporter Binder Cycle 1](/engineering/transporter-binder).

### Discussion

::content-components-lightbox-image
---
alt:
  - ""
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/overview-fig10.avif
caption: Fig. 11 | **Relationships between the custom composite score and
  experimental responses of PepT<sub>Sh</sub> transporter binders.** Each point
  represents one tested binder (n = 5), with A412 signal (an indicator of 3M3SH concentration, with lower values indicating lower odorant concentrations) reduction calculated as 100 × (1 − mean binder A412/mean control A412), custom composite score
  calculated as 0.50 × normalized ranking score + 0.25 × normalized pLDDT + 0.25
  × normalized inverse PAE; OLS regression lines are plotted.
imageBackground: white
---
::

The findings suggest that in a filtered set of candidates, a single metric may have too little variation to support confident prediction of actual experimental performance. The custom composite score showed the strongest agreement with experimental ranking, but it needs further verification because the sample is too small.

However, MD metrics did not show agreement with experimental results. Future evaluation should increase the number of independent MD simulations, and consider explicit entropy correction and an implicit membrane model in free energy calculation.

## CGTase

> This is a summary of documents under [CGTase](/model/cgtase). If you are interested in the detailed modeling process, please view the detailed documents.

::content-components-lightbox-image
---
alt:
  - CGTase engineering proceeds from reaction characterization through docking
    and wild-type simulation to targeted mutations, mutant simulation, and
    experimental candidates.
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/overview-fig11.avif
caption: Fig. 12 | **Schematic of CGTase design workflow.** In the Characterize
  stage, glycosylation of the precursor by CGTase was selected as the design
  objective. Molecular docking and molecular dynamics simulations were then used
  to determine the binding pose. Rational design was then used to strengthen
  interactions that were insufficient in the wild-type CGTase–Cys-Gly-3M3SH
  complex. Mutants were evaluated by molecular dynamics simulations, and mutants
  showing improved interactions were selected as final wet-lab candidates.
imageBackground: white
---
::

### Characterize

#### Problem Definition

We aim to find and engineer an enzyme to chemically modify Cys-Gly-3M3SH.

#### Target Definition

Cys-Gly-3M3SH contains three functional groups—the amino, carboxyl, and hydroxyl groups—that could serve as sites for enzyme-catalyzed conjugation to other moieties.

We evaluated possible enzyme-catalyzed reactions at each group according to their compatibility with our scenario: human skin, which is mildly acidic and lacks an external supply of high-energy cosubstrates or cofactors such as ATP or NADH :fn-ref{#24}.

#### Mechanism Analysis

::content-components-lightbox-image
---
alt:
  - CGTase transfers a glycosyl group from a carbohydrate donor to the hydroxyl
    group of Cys-Gly-3M3SH.
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/overview-fig12.avif
caption: "Fig. 13 | **Proposed O-glycosylation of Cys-Gly-3M3SH by cyclodextrin glucanotransferase (CGTase).** The reaction scheme depicts transfer of a glycosyl group from a carbohydrate donor to the precursor hydroxyl oxygen, forming an O-glycosidic linkage."
imageBackground: white
---
::

Among the three possible modification sites on Cys-Gly-3M3SH, hydroxyl-group glycosylation with CGTase (cyclodextrin glucanotransferase) provided the most suitable option in the intended reaction environment :fn-ref{#27}.

Previous structural and biochemical studies :fn-ref{#6} on CGTase had identified its active site and the binding site of its native substrates, providing the foundations for predicting the binding mode of Cys-Gly-3M3SH to the enzyme and the later rational design. Using the 1CXL template of CGTase as reference and combining molecular docking with molecular dynamics, we predicted the structure of CGTase complexing with Cys-Gly-3M3SH for further analysis and protein engineering

[Molecular dynamics (MD) simulations](/model/cgtase/md-simulation) of the wild-type complex showed that the non-native substrate could remain stably accommodated within the catalytic pocket, supporting the feasibility of using CGTase for Cys-Gly-3M3SH modification. Suboptimal interactions between Cys-Gly-3M3SH and the wild-type enzyme were then identified for rational design.

::content-components-lightbox-panels
---
alt:
  - ""
  - ""
  - ""
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/overview-fig13a.avif
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/overview-fig13b.avif
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/overview-fig13c.avif
caption: Fig. 14 | **Characterization process of CGTase.** **(a)** Tree diagram of
  clustered docking poses. The dotted line represents the ligand RMSD threshold
  for clustering. **(b)** 9 representative docking poses. **(c)** Proposed
  interaction between Cys-Gly-3M3SH and CGTase, derived from an MD run. Green marks
  C1 of the Asp229-linked glycosyl–enzyme intermediate, the target of
  nucleophilic attack by the acceptor hydroxyl oxygen during transglycosylation.
imageBackground: white
label: Overview — Fig. 14
---
::

::content-components-video-panels
---
src:
  - https://video.igem.org/videos/embed/3xEFyz5QCbiaVRcPsk8wbu
titles:
  - "GreatBay-SCIE: MD of CGTase and the Precursor (2026)"
caption: "Video 3 | The MD trajectory illustrates the motion of CGTase and the bound Cys-Gly-3M3SH precursor."
label: CGTase and precursor MD trajectory
portrait: true
---
::

#### Design Specification

CGTase was selected for further design to fit a new substrate. Optimizing the incomplete interactions around the ligand's carboxylate group and hydrophobic tail should be the target of design.

### Design

Based on the interaction deficiencies identified in wild-type MD simulation, we adopted a [rational design](/model/cgtase/design) strategy, introducing targeted binding-pocket mutations intended to stabilize the simulated precursor-binding pose.

The nine resulting mutant candidates were subsequently evaluated by MD simulations to examine their effects on substrate binding and active-site interactions. Candidates showing improved and stable interactions with the target substrate were prioritized for experimental validation.

::content-components-lightbox-panels
---
alt:
  - The wild-type CGTase pocket places the precursor near D229; T370 lies beside
    the carboxylate, while F183 and F259 border the hydrophobic tail.
  - R370 approaches the precursor carboxylate in the CGTase pocket, with dashed
    lines marking proposed interactions.
  - K370 approaches the precursor carboxylate in the CGTase pocket, with dashed
    lines marking proposed interactions.
  - R370 contacts the carboxylate while W183 packs beside the precursor
    hydrophobic tail in the double-mutant pocket.
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/overview-fig14a.avif
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/overview-fig14b.avif
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/overview-fig14c.avif
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/overview-fig14d.avif
caption: Fig. 15 | Proposed interaction between Cys-Gly-3M3SH and CGTase.
  **(a)** Wild type; **(b)** T370R; **(c)** T370K; **(d)** T370R/F183W.
imageBackground: white
label: Overview — Fig. 15
---
::

Three candidates showing improved interaction with the precursor were selected for experimental testing in [CGTase Cycle1](/engineering/cgtase#cgtase-cycle-1); only T370R/F183W was successfully tested as designed.

### Discussion

::content-components-lightbox-image
---
alt:
  - Ellman's assay shows lower thiol content for CGTase T370L and T370R/F183W
    than the empty-vector control.
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/overview-fig15.avif
caption: Fig. 16 | Ellman's assay of CGTase. Error bars represent ± SD (n =
  3). Asterisks indicate significant differences compared with the empty-vector
  control; \*\*p < 0.01.
imageBackground: white
---
::

The Characterize stage successfully identified CGTase as a functional starting enzyme for Cys-Gly-3M3SH chemical modification. The experimental assay showed activity of wild-type CGTase compared with the control, aligning with the characterization outcome, where docking and MD simulations support the feasibility of glycosylation catalyzed by CGTase.

However, in the experiment, the intended T370K mutant was unexpectedly obtained as T370L.

Thus, the feasibility of the rational design is not fully verified because of the limited dataset. Only T370R/F183W was successfully tested as designed. Comparing this double mutant with the unintended T370L variant provides limited evidence that the proposed design strategy deserves further evaluation.

Future work should test more mutants, especially T370K, T370R, and combination mutants, with more experimental replicates.

## Optimization

> This is a summary of documents under [Optimization](/model/optimization). If you are interested in the detailed modeling process, please view the detailed documents.

### Design: CGTase Thermostability

::content-components-lightbox-image
---
alt:
  - Conserved and functionally important positions are excluded, single
    mutations are scored, a pairwise graph guides diverse beam search, and
    multipoint designs proceed to testing.
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/overview-fig16.avif
caption: Fig. 17 | **Schematic of thermostability optimization workflow.**
  Starting from T370K and T370R/F183W parent enzymes, important residues are
  excluded from mutation. Remaining positions are screened with SPURS for
  favorable single substitutions. Pairwise compatibility analysis and a diverse
  beam search construct multi-point mutants, which are selected for experimental
  testing at increasing mutation counts :fn-ref{#32} :fn-ref{#33}.
imageBackground: white
---
::

We aim to optimize successful CGTase mutants to meet industrial production requirements and make the enzyme more resistant to denaturation caused by heat exposure during storage and transportation.

We design potentially more thermally stable CGTase mutants through a stepwise computational screening process.

We first identify and exclude residues that are highly conserved or important for ligand binding or calcium coordination. The remaining positions are evaluated with *SPURS*, an AI model that predicts how individual amino acid changes affect protein stability, and only promising mutations are retained. To combine these mutations safely, the method follows the pairwise compatibility principle used by *FireProt*: pairs predicted to interfere with each other are rejected, while compatible pairs are gradually assembled into larger mutants through a beam-search algorithm that also maintains diversity among the designs :fn-ref{#32} :fn-ref{#33}.

Final candidates are selected based on predicted stability and diversity of design, then tested experimentally with progressively more mutations to determine how reliable the method is as design complexity increases.

We aim to test whether AI can learn patterns that enable it to predict multipoint mutagenesis based on pairwise mutagenesis, and assess its reliability by introducing mutations two at a time.

::content-components-lightbox-panels
---
alt:
  - ""
  - ""
autoLabels: false
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/overview-fig17a.avif
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/overview-fig17b.avif
caption: "Fig. 18 | **SPURS-guided mutation optimization of T370K (top panel)
  and T370R/F183W (bottom panel).** The embedded plots (a–d) show: **(a)**
  single-mutation score distribution; **(b)** pairwise compatibility of the 40
  top-ranked candidates; **(c)** selected multi-mutation scores across search
  depths; the blue line represents the lowest score per depth. **(d)** Added-mutation
  score contributions; the dashed line represents the marginal threshold. Boxes
  show medians and interquartile ranges; whiskers indicate 1.5× interquartile
  range."
imageBackground: white
label: Overview — Fig. 18
layout: stack
---
::

Mutants with 2, 4, 6, or 8 additional substitutions relative to each CGTase parent, along the same search route, were selected for testing in [CGTase Cycle 2](/engineering/cgtase#cgtase-cycle-2).

### Design: Precursor Binder Affinity

::content-components-lightbox-image
---
alt:
  - Selected precursor binders undergo complex preparation, pocket definition,
    single-position proofreading, conditional probability scoring, burial
    filtering, co-folding, and polar validation.
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/overview-fig18.avif
caption: Fig. 19 | **Schematic for precursor binder affinity optimization
  workflow.** Predicted structures of experimentally selected binders are
  minimized and prepared. LASErMPNN neural proofreading is used to rank
  substitutions at ligand-pocket positions. Mutations that pass the subsequent
  filters are selected for wet-lab testing :fn-ref{#7}.
imageBackground: white
---
::

We aim to improve the affinity of BC7, BR8 and BR10 for Cys-Gly-(S)-3M3SH.

We adapted the *LASErMPNN* neural proofreading strategy described by Fry et al. :fn-ref{#7} to identify beneficial substitutions that can enhance ligand affinity. RF3-predicted binder-ligand complexes are minimized. Saturated point mutations at residues within 5 Å of the ligand are then evaluated.

By adjusting decoding order, one position is allowed to vary while the remaining amino acids stay fixed. Probabilities are averaged across different decoding orders and *dropout* to reduce sensitivity to individual predictions.

Candidate substitutions are ranked by ΔNLL, which compares how much the model favors the proposed amino acid over the original one. $\Delta NLL = \ln[P(a) / P(b)]$. Negative values indicate greater model support for the substitution. We prioritize candidates at buried, ligand-contacting positions, then predict and minimize their structures to filter any buried polar residues introduced without suitable hydrogen bond interactions.

The following designs were selected for testing in [Precursor Binder Cycle 2](/engineering/precursor-binder#precursor-binder-cycle-2).

::content-components-captioned-table
---
caption: Table 2 | **Selected candidates for precursor binder affinity design.**
  RMSD is calculated from Cα atoms to the minimized unmutated parent.
---
| Candidate | Substitutions | ΔNLL              | Cα RMSD (Å) |
| --------- | ------------- | ----------------- | ----------- |
| BC7-M1    | F18L          | -1.9438           | 0.594       |
| BC7-M2    | A73R          | -1.9406           | 0.755       |
| BC7-M3    | F18L + A73R   | -1.9438 / -1.9406 | 0.698       |
| BR8-M1    | M48R          | -3.6877           | 0.703       |
| BR8-M2    | K127L         | -1.2490           | 0.649       |
| BR8-M3    | M48R + K127L  | -3.6877 / -1.2490 | 0.622       |
| BR10-M1   | K60V          | -1.4368           | 0.715       |
::

### Discussion

#### CGTase Thermostability

::content-components-lightbox-image
---
src:
  - https://static.igem.wiki/teams/6133/wiki/wetlab/engineering/engineering-cgtase-fig11b.avif
alt:
  - "Thermostability assay results of extracted CGTases after heat treatment, with room-temperature samples as controls."
caption: "Fig | thermostability assay results of all extracted CGTases, CGTases that were placed in room temperature were used as control."
imageBackground: white
---

::

The optimized mutants generally showed less white precipitate following heat treatment, indicating better thermostability.

For **F183W/T370R-based** mutants, all WR2, WR4 and WR8 showed improvement compared to T370R/F183W. Moreover, higher-order mutants showed better thermostability in the assay, with WR8 showing the most pronounced improvements. This indicates our design approach has the potential to introduce beneficial epistatic effects.

For **T370K-based** mutants, KR2 showed an improvement compared to T370K, while higher-order mutants did not show substantial difference. This indicates the mutations introduced in depth 4 of the diverse beam search may have an epistatic effect that decreases its thermostability, and the higher-order mutants inherits this mutations, leading to all the higher-order mutants showing no improvement.

The result may indicate deep-learning-based thermostability predictors can learn patterns enabling them to predict multipoint-mutagenesis based on pairwise mutagenesis (SPURS is trained on pairwise mutagenesis data). However, the results also reveal the insufficiency of design approach: beam search is path-dependent, thus, ineffective mutations introduced earlier can affect later high-order mutants.

#### Precursor Binder Affinity

The measurement of affinity of optimized precursor binders are currently unavailable. We are still carrying out the experiments in [precursor binder cycle 2](/engineering/precursor-binder#precursor-binder-cycle-2), the results and analysis may be updated in the presentation video.

## Overall Discussion

### What Characterize Changed

The Characterize stage in our project works as a critical step to determine our design specifications. Across the three design routes, it identified the targets, mechanisms and constraints relevant before the design stage. By translating understanding of biological systems into explicit design specifications, it ensures biological plausibility and provides a common framework for otherwise distinct engineering approaches.

### AI and Physics-Based Evaluation

AI-enabled methods allowed efficient exploration of the design space, while physics-based evaluation examined filtered designs under more explicit molecular assumptions. The integration of the two methods in our decision-gated workflow prioritized candidates supported by both methods for limited experimental resources.

### Limitations

The small experimental candidate set cannot establish statistically significant relationships between computational metrics and functional performance. Because of the limited variance of computational metrics in a filtered set of candidates, the results cannot concretely verify the usefulness of the single metrics and the weighted metrics we set.

### Future Improvements

Future work should strengthen experimental feedback. Specifically, larger experimental datasets would allow us to recalibrate weights and thresholds of each metric, revisit the mechanistic assumptions and design specifications, and optimize the decision-gated workflow by introducing or removing evaluation tools. With sufficient data, training or adapting a deep-learning model for the specific design purpose may become possible.
