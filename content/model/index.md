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
description: Computational modeling of precursor sequestration, transporter inhibition, CGTase engineering, and protein optimization using a Characterize–DBTL framework.
hasReference: false
order: 1
banner: https://static.igem.wiki/teams/6133/wiki/general/banners/model.avif
bannerWidth: 3600
bannerHeight: 1400
bannerFit: raised
bannerBackground: "#14274e"
bannerPosition: 50% 10%
bannerMobilePosition: 50% 10%
---

## Key success

- Among 9 tested **precursor binders** designed by *RFdiffusion3* and *Proteina-Complexa*, 4 displayed significant reduction in 3M3SH production compared to the control group.
- Among 5 designed **transporter binders** aiming to restrict conformational change, 4 showed significant reduction in 3M3SH production, with a maximum reduction of 21%
- We identified wild-type **CGTase** as a functional starting enzyme for Cys-Gly-3M3SH modification, supported by experimental activity relative to control.
- We developed a **Characterize–DBTL framework** that translates understanding of biological mechanisms into explicit design requirements.
- We compared **RFdiffusion3** and **Proteina-Complexa** for designing Cys-Gly-(S)-3M3SH binders, examining how computational metrics relate to experimental responses.
- We uploaded all our **automation scripts** and built **[software](/software)** for the computational modeling process, providing reusable workflows for future iGEM teams.

## Abstract

Axillary odor arises when *Staphylococcus hominis* imports and metabolizes the odorless precursor Cys-Gly-3M3SH. To reduce precursor availability or uptake, we developed three solution strategies: a *de novo* small-molecule binding protein that sequesters the precursor Cys-Gly-3M3SH, a *de novo* protein-binding protein that inhibits the conformational changes of the transporter *PepT*Sh, and an enzyme that chemically modifies the precursor to make it unrecognizable to the transporter. We also carried out thermostability optimizations for the enzyme.

We introduced a Characterize stage before the conventional DBTL cycle to translate biological mechanisms and application conditions into explicit design requirements. For computational design pipelines (precursor binder, transporter binder, optimizations), we developed a decision-gated workflow. It progressively filters candidates using outputs from each computational evaluation, prioritizing the most reliable candidates for wet-lab testing.

Experimental assays supported wild-type CGTase activity toward the precursor. Comparisons between computational metrics and experimental responses of the binders revealed that metric performance depended on the design route, highlighting the need for further experimental feedback when selecting evaluation criteria.

Together, our workflow and automated scripts provide a reusable framework for future iGEM teams who aim to integrate computational protein design with limited experimental resources. Combined with our wet-lab efforts, this work paves the way for further development of targeted interventions against axillary odor.

## Introduction

Since Cys-Gly-3M3SH first needs to be imported into the *S. hominis* cytoplasm via a peptide transporter (PepTSh), we hypothesized that preventing Cys-Gly-3M3SH uptake could prevent odor formation, while aiming to avoid broadly suppressing the resident skin microbiota. :fn-ref{#1} We developed three protein-engineering strategies to reduce odor-precursor availability or uptake through distinct mechanisms.

::content-components-lightbox-image
---
alt:
  - ""
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/overview-fig1.avif
caption: Fig. 1 | Schematic for the three solutions. Precursor binder sequesters
  the precursor, preventing the uptake by PepT<sub>Sh</sub> transporter;
  Transporter binder binds to PepT<sub>Sh</sub> transporter directly, preventing
  the uptake; CGTase chemically modifies the precursor by adding an additional
  group, making it unrecognizable for PepT<sub>Sh</sub>
imageBackground: white
---
::

- **Precursor Binder:**&#x73;elective protein binders for Cys-Gly-3M3SH designed using two different deep-learning based design tools.
  - **Precursor Binder Affinity Optimization:** precursor binders that displayed binding ability were selected for further affinity optimization
- **Transporter Binder:** a protein binder that could limit this uptake through blocking the transporter.
- **CGTase**: an enzyme that we characterized could covalently modify the precursor, attaching an additional group to the precursor before bacterial uptake.
  - **CGTase Thermal Stability Optimization:** Two computationally designed CGTase parents (T370K and T370R/F183W) were selected for further thermal stability optimization. Sequencing identified the intended experimental T370K variant as T370L, which is labeled T370L in the experimental result plots.

## Characterize–DBTL Framework

### Why Characterize

As systems-level and mechanistic understanding of biological systems continues to advance, synthetic biology design is expanding beyond the design of genetic sequences toward the development of context-specific solutions based on biological mechanisms. :fn-ref{#2}

We therefore introduced a **Characterize** stage before the conventional DBTL cycle. By analysing the biological mechanism, target, structural context, and application environment, this stage translates biological understanding into explicit design specifications that define what should be designed and which constraints the resulting solution must satisfy.

::content-components-lightbox-image
---
alt:
  - Problem definition, target definition, mechanistic characterization, and
    design specification lead into the Design–Build–Test–Learn cycle.
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/overview-fig2.avif
caption: Fig. 2 | **Schematic for Characterize stage and its four substages**,
  showing the progression from problem definition to design specification, and
  finally to conventional DBTL cycle. Characterize stage directly connects to
  design stage by outputting design specifications.
imageBackground: white
---
::

### Substages

Specifically, the Characterize stage includes the following substages:

#### **1. Problem Definition**

**Establish what the design is expected to achieve.**

Define the biological problem, intended outcome, application context, and potential point of intervention.

#### **2. Target Definition**

**Specify the biological entity to be engineered**

This may be a molecule, protein, conformational state, interaction interface, or biochemical reaction. Relevant boundaries are also defined.

#### **3. Mechanistic Characterization**

**Investigate the biological and molecular mechanisms underlying the proposed design strategy.**

Available experimental, structural, and computational evidence is used to assess mechanistic plausibility.

#### **4. Design Specification**

**Translate characterization findings into explicit design requirements.**

This produces the output directly for design, for example, a molecule to bind, an interface to bind, or a site to modify. This substage connects Characterize and Design stages, and should be the main outcome of characterize stage.

### Project Application

::content-components-captioned-table
---
caption: Table 1 | The application of characterize stage in our project.
---
| **Strategy**       | **Approach**                     | **Target**             | **Design Specification**                                                                                                                                                      |
| :----------------- | :------------------------------- | :--------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Precursor binder   | Bind the precursor.              | Cys-Gly-3M3SH          | Use Cys-Gly-(S)-3M3SH and reject structures with wrong chirality.                                                                                                             |
| Transporter binder | Inhibit the transporter.         | PepTSh                 | Target extracellular features of inward-facing 6EXS with an 80–120-residue binder.                                                                                            |
| CGTase             | Chemically modify the precursor. | CGTase & Cys-Gly-3M3SH | Choose the transglycosylation reaction of the precursor catalysed by CGTase. Preserve the catalytic pose and optimize interactions with the carboxylate and hydrophobic tail. |
::

## Computational Design

### Computational Approach

Many conventional protein engineering approaches use large physical libraries and repeated experimental screening. As a high-school team, we largely applied a deep-learning-guided protein design strategy, which explores large sequence-and-structure spaces computationally and significantly reduces the wet-lab effort needed to create successful binder designs.

### Decision-Gated Workflow

We introduce a reusable and resource-aware method of integrating AI into protein engineering.

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

In our project, a large number of designs are generated, enabling rapid exploration of potential binding structures. The designs are then co-folded with the target, with indicators of structure validity used to assess and filter the candidates. A smaller set of candidates subsequently proceeds to physics-based molecular dynamics simulation and finally experimental testing.

## Precursor Binder

> This is a summary of documents under [Precursor Binder](/model/precursor-binder). If you are interested in the detailed modeling process, please view the full version.

::content-components-lightbox-panels
---
alt:
  - A blue helical Proteina-Complexa binder surrounds a green small-molecule
    ligand in its central pocket.
  - A yellow RFdiffusion3 binder surrounds a green small-molecule ligand in a
    central pocket.
  - RFdiffusion3 and Proteina-Complexa routes converge on chirality filtering,
    ranking, 50-ns molecular dynamics, and in-vitro candidate selection.
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/overview-fig4a.avif
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/overview-fig4b.avif
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/overview-fig4c.avif
caption: Fig. 4 | **Sample precursor binder designs and the design process.**
  **(a)** precursor binder designed by Proteina-Complexa **(b)** precursor
  binder designed by RFdiffusion3 **(c)** Schematic for precursor binder design
  workflow.
imageBackground: white
label: Overview — Fig. 4
---
::

### Characterize

#### Problem Definition

We aim to design selective protein binders to sequester Cys-Gly-3M3SH.

#### Target Definition

**Cys-Gly-3M3SH**, the odorless precursor of axillary odor, consists of a cysteinylglycine moiety S-linked to a branched hydroxyalkyl group.

#### Mechanism Analysis

::content-components-lightbox-image
---
alt:
  - Chemical structures compare the S and R stereoisomers of the precursor and
    their corresponding thioalcohols.
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/overview-fig5.avif
caption: Fig. 5 | **Structure diagrams for Cys-Gly-(S)-3M3SH and
  Cys-Gly-(R)-3M3SH precursor, and their corresponding 3M3SH molecule's smell.**
imageBackground: white
---
::

3M3SH exists as two stereoisomers with distinct smells. We selected **Cys-Gly-(S)-3M3SH**, which is associated with the sweat- and onion-like odor of axillary odor, as the target molecule for binder design :fn-ref{#3}. We investigated that protein–ligand recognition is stereochemistry-dependent, while deep-learning models often introduce stereochemical errors :fn-ref{#4}. We then adjusted our design specifications accordingly.

#### Design Specification

Cys-Gly-(S)-3M3SH was identified as the odor-relevant stereoisomer and therefore selected as the target for binder design. A ligand representation with explicitly-defined stereochemistry should be used as input for both design pipelines, and ligand chirality should be verified after structure generation before candidates proceed to further evaluation.

### Design

Small-molecule-binding proteins targeting Cys-Gly-3M3SH were designed using the *[Rosetta Foundry](/model/precursor-binder/design-rfdiffusion)* and [Proteina-Complexa](/model/precursor-binder/design-proteina-complexa) separately. The full design pipeline includes backbone scaffold generation, sequence redesign and folding validation. RFdiffusion3 binders are ranked based on the ranking\_score outputted by *RF3*, while Proteina-Complexa binders are ranked based on a custom composite score. Then, a [molecular dynamics simulation](/model/precursor-binder/md-simulation) is performed on selected top binders from each pipeline to determine the set of candidates for *in vitro* testing.

22 binders (11 from each design tool) were planned for experimental testing in cycle1. Nine were successfully tested: 4 from RFdiffusion3 and 5 from Proteina-Complexa.

### Discussion

::content-components-lightbox-panels
---
alt:
  - ""
  - ""
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/overview-fig6a.avif
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/overview-fig6b.avif
caption: Fig. 6 | **Relationships between computational metrics and experimental
  responses of precursor binders designed by RFdiffusion3 and
  Proteina-Complexa.** Each point represents one tested binder (n = 4 for
  RFdiffusion3 in the top panel **(a)**; n = 5 for Proteina-Complexa in the
  bottom panel **(b)**), with A412 signal reduction calculated as 100 × (1 −
  mean binder A412/mean control A412). **(a)**. MD Metrics of 4 RFdiffusion3
  branch binders, including **(G)** estimated binding free energy (ΔG) from
  MM/PBSA (**H-I)** the mean and SD of MD ligand RMSD, over 10–50 ns. **(b)**.
  The composite score, calculated as 200 × *pLDDT* − i_pAE − 62 × min_ipAE + 50
  × min_ipSAE − 5 × binder_scRMSD_ca − 2 × ligand_scRMSD − 2 ×
  ligand_scRMSD_aligned, using pLDDT on a 0–1 scale. Pearson r and Spearman ρ
  are reported in each plot. OLS regression lines are plotted.
imageBackground: white
label: Overview — Fig. 6
layout: stack
---
::

For computational metrics, interface-related metrics in RFdiffusion3 branch showed agreement with the experimental results. In the Proteina-Complexa route, our custom composite score showed the strongest linear correlation with experimental results.

MD provides complementary evidence, especially in RFdiffusion3 branch, where the three MD metrics all showed the expected trend. However, in Proteina-Complexa branch, inconsistency between Proteina-Complexa generation and RF3 evaluation may affect the predicted structures selected, causing ligand RMSD to partly reflect relaxation of the predicted pose and reduce its reliability. Incorporating another folding tool, such as AlphaFold, and carrying out more independent MD simulations on each binder would help verify this relationship.

Future work should emphasize testing more experimental candidates to verify the composite score and adjust the weights.

## **Transporter Binder**

> This is a summary of documents under [Transporter Binder](/model/transporter-binder). If you are interested in the detailed modeling process, please view the full version.

::content-components-lightbox-image
---
alt:
  - The inward-facing transporter is analyzed to select an extracellular
    interface, followed by backbone generation, sequence design, co-folding,
    interface filtering, membrane simulation, and experimental selection.
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/overview-fig7.avif
caption: Fig. 7 | Schematic for transporter binder design workflow.
imageBackground: white
---
::

### Characterize

#### Problem Definition

We aim to design a protein to inhibit the PepTSh transporter.

#### Target Definition

PepTSh is a proton-coupled oligopeptide transporter (POT) from *S. hominis* that imports Cys-Gly-3M3SH :fn-ref{#1}. We used the inward-facing crystal structure (PDB: 6EXS) as the receptor template, targeting the extracellularly exposed surface of PepTSh.

#### Mechanism Analysis

Molecular dynamics studies of PepTSh indicated that the transition from the inward-facing to the outward-facing state is the rate-limiting step in its transport cycle. :fn-ref{#5} Therefore, the inward-facing conformation was selected for binding stabilization. Structural comparison of inward- and outward-facing models identified extracellular electrostatic interaction networks and hydrophobic surface patches that are specific to the inward-facing state. These features were subsequently used to define the target interface for binder design.

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
caption: "Fig. 8 | **Structure and extracellular surface of PepT<sub>Sh</sub>.**
  **(a)** Inward-Facing conformation of PepT<sub>Sh</sub>(PDB 6EXS); **(b)**
  detailed view of the electrostatic interaction network identified in
  structural analysis. A close-up of the highlighted region in **(a)**; **(c)**
  Outward-Facing conformation of PepT<sub>Sh</sub>(homology modelled); **(d)**
  Broken electrostatic interaction in outward-facing PepT<sub>Sh</sub>, A
  close-up of the highlighted region in **(c)**. Green: C-terminal bundle; Blue:
  N-terminal bundle; Orange: TMA and TMB."
imageBackground: white
label: Overview — Fig. 8
---
::

#### Design Specification

PepTSh characterization indicated that transition from the inward-facing to the outward-facing state is the rate-limiting step in its transport cycle. Comparison of the two conformational states identified accessible extracellular features specific to the inward-facing state, which were then used to determine the binding interface. Moreover, compact binder designs are favored to enhance accessibility through the Gram-positive cell wall.

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
caption: Fig. 9 | **The target extracellular interface of PepT<sub>Sh</sub>**
  **(a)** highlight of target region (PDB 6EXS); **(b)** side-view of selected
  contig region, upward is the extracellular direction; **(c)** selected
  hotspots(orange) and hydrophobic patch between them(green)
imageBackground: white
label: Overview — Fig. 9
---
::

### Design

Among the available design frameworks, we selected Rosetta Foundry for its unified suite of protein-design tools.

The full design pipeline comprised RFD3 backbone generation, *ProteinMPNN* sequence design, and RF3 co-folding validation. Candidates were then filtered according to their predicted interface placement and ranked based on a custom composite score \[\[]{.katex-mathml}\[\[\[]{.strut style="height:0.8889em;vertical-align:-0.1944em;"}\[\[weighted score]{.mord}]{.mord.text} []{.mspace style="margin-right:0.2778em;"}[=]{.mrel}[]{.mspace style="margin-right:0.2778em;"} ]{.base}\[\[]{.strut style="height:0.7278em;vertical-align:-0.0833em;"} [0.50]{.mord}[]{.mspace style="margin-right:0.2222em;"}[×]{.mbin}[]{.mspace style="margin-right:0.2222em;"} ]{.base}\[\[]{.strut style="height:0.8889em;vertical-align:-0.1944em;"}\[\[normalized]{.mord.mathrm} [ ]{.mspace}[ranking]{.mord.mathrm style="margin-right:0.0139em;"}[ ]{.mspace}[score]{.mord.mathrm} ]{.mord} []{.mspace style="margin-right:0.2222em;"}[+]{.mbin}[]{.mspace style="margin-right:0.2222em;"} ]{.base}\[\[]{.strut style="height:0.7278em;vertical-align:-0.0833em;"} [0.25]{.mord}[]{.mspace style="margin-right:0.2222em;"}[×]{.mbin}[]{.mspace style="margin-right:0.2222em;"} ]{.base}\[\[]{.strut style="height:0.8889em;vertical-align:-0.1944em;"}\[\[normalized]{.mord.mathrm} [ ]{.mspace}[pLDDT]{.mord.mathrm} ]{.mord} []{.mspace style="margin-right:0.2222em;"}[+]{.mbin}[]{.mspace style="margin-right:0.2222em;"} ]{.base}\[\[]{.strut style="height:0.7278em;vertical-align:-0.0833em;"} [0.25]{.mord}[]{.mspace style="margin-right:0.2222em;"}[×]{.mbin}[]{.mspace style="margin-right:0.2222em;"} ]{.base}\[\[]{.strut style="height:0.6944em;"}\[\[normalized]{.mord.mathrm} [ ]{.mspace}[inverse]{.mord.mathrm}[ ]{.mspace}[PAE]{.mord.mathrm} ]{.mord}]{.base}]{.katex-html ariaHidden="true"}]{.katex}, after which molecular dynamics simulations were performed on the top-ranked binders to prioritize candidates for experimental validation.

Selected candidates are tested experimentally in cycle2.

### Discussion

::content-components-lightbox-image
---
alt:
  - ""
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/overview-fig10.avif
caption: Fig. 10 | **Relationships between the custom composite score and
  experimental responses of PepT<sub>Sh</sub> transporter binders.** Each point
  represents one tested binder (n = 5), with A412 signal reduction calculated as
  100 × (1 − mean binder A412/mean control A412), custom composite score
  calculated as 0.50 × normalized ranking score + 0.25 × normalized pLDDT + 0.25
  × normalized inverse PAE; OLS regression lines are plotted.
imageBackground: white
---
::

The findings suggest that in a filtered set of candidates, a single metric may have too little variation to support confident prediction of actual experimental performance. The custom composite score showed the strongest agreement with experimental ranking, but it needs further verification because the sample is too small.

However, MD metrics do not show agreement with experimental results. Future evaluation should increase the number of independent MD simulations, and consider explicit entropy correction and an implicit membrane model in free energy calculation.

## CGTase

> This is a summary of documents under [CGTase](/model/cgtase). If you are interested in the detailed modeling process, please view the [CGTase modeling details](/model/cgtase).

::content-components-lightbox-image
---
alt:
  - CGTase engineering proceeds from reaction characterization through docking
    and wild-type simulation to targeted mutations, mutant simulation, and
    experimental candidates.
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/overview-fig11.avif
caption: Fig. 11 | Schematic of CGTase design workflow.
imageBackground: white
---
::

### Characterize

#### Problem Definition

We aim to find and engineer an enzyme to chemically modify Cys-Gly-3M3SH.

#### Target Definition

Cys-Gly-3M3SH contains three functional groups—the amino, carboxyl, and hydroxyl groups—that could serve as sites for enzyme-catalyzed conjugation to other moieties.

We evaluated possible enzyme-catalyzed reactions at each group according to their compatibility with our scenario: human skin, which is mildly acidic and lacks an external supply of high-energy cosubstrates or cofactors such as ATP or NADH.

#### Mechanism Analysis

::content-components-lightbox-image
---
alt:
  - CGTase transfers a glycosyl group from a carbohydrate donor to the hydroxyl
    group of Cys-Gly-3M3SH.
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/overview-fig12.avif
caption: Fig. 12 | Glycosylation Reaction of Cys-Gly-3M3SH, catalysed by CGTase.
imageBackground: white
---
::

Among the three possible modification sites on Cys-Gly-3M3SH, hydroxyl-group glycosylation with CGTase (cyclodextrin glucanotransferase) provided the most suitable option in the intended reaction environment.

Previous structural and biochemical studies :fn-ref{#6} on CGTase have identified the active site and characterized the binding modes of native substrates, providing a structural basis for evaluating whether Cys-Gly-3M3SH could be accommodated by the enzyme. We reverted the E257Q substitution in the 1CXL template to wild-type E257, then combined molecular docking with molecular dynamics simulation to characterize its interaction with wild-type CGTase.

[Molecular dynamics (MD) simulations](/model/cgtase/md-simulation) of the wild-type complex showed that the non-native substrate could remain stably accommodated within the catalytic pocket, supporting the feasibility of using CGTase for Cys-Gly-3M3SH modification. However, several suboptimal interactions indicate the imperfect fit between Cys-Gly-3M3SH and the wild-type binding pocket, which shows opportunities for subsequent protein engineering.

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
caption: Fig. 13 | **Characterize process of CGTase.** **(a)** tree diagram of
  clustering docking poses. The dotted line represents the ligand RMSD threshold
  for clustering. **(b)** 9 representative docking poses **(c)** Proposed
  interaction between Cys-Gly-3M3SH and CGTase, derived from MD run. Green marks
  C1 of the Asp229-linked glycosyl–enzyme intermediate, the target of
  nucleophilic attack by the acceptor hydroxyl oxygen during transglycosylation.
imageBackground: white
label: Overview — Fig. 13
---
::

#### Design Specification

CGTase is selected for further design to fit into a new substrate. Docking and molecular dynamics showed that the precursor could remain accommodated within the wild-type CGTase pocket, while revealing incomplete interactions around its carboxylate group and hydrophobic tail.

### Design

Based on the interaction deficiencies identified in wild-type MD simulation, we adopted a [rational design](/model/cgtase/design) strategy, introducing targeted binding-pocket mutations intended to stabilize the simulated precursor-binding pose.

The nine resulting mutant candidates were subsequently evaluated by MD simulations to examine their effects on substrate binding and active-site interactions. Candidates showing improved and stable interactions with the target substrate were prioritized for experimental validation

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
caption: Fig. 14 | Proposed interaction between Cys-Gly-3M3SH and CGTase.
  **(a)** wild type **(b)** T370R **(c)** T370K **(d)** T370R/F183W
imageBackground: white
label: Overview — Fig. 14
---
::

Three candidates showing improved interaction with the precursor were selected for experimental testing in cycle3; only T370R/F183W was successfully tested as designed.

### Discussion

::content-components-lightbox-image
---
alt:
  - Ellman's assay shows lower thiol content for CGTase T370L and T370R/F183W
    than the empty-vector control.
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/overview-fig15.avif
caption: Fig. 15 | Ellman's Assay of the CGTase; Error bars represent ± SD (n =
  3); Asterisks indicate significant differences compared with the Empty Vector
  control; \*\*p < 0.01.
imageBackground: white
---
::

The characterize stage successfully identified CGTase as a functional starting enzyme for Cys-Gly-3M3SH chemical modification. The experimental assay showed activity of wild-type CGTase compared with the control, aligning with the characterization outcome, where docking and MD simulations support the feasibility of glycosylation catalysed by CGTase.

However, in the experiment, the intended T370K mutant was unexpectedly obtained as T370L.

Thus, feasibility of the rational design is not fully verified because of the limited dataset. Only T370R/F183W was successfully tested as designed. Comparing this double mutant with the unintended T370L variant provides limited evidence that the proposed design strategy deserves further evaluation.

Future work should test more mutants, especially T370K, T370R, and combination mutants, with more experimental replicates.

## Optimization

> This is a summary of documents under [Optimize](/model/optimization). If you are interested in the detailed modeling process, please view the [Optimization modeling details](/model/optimization).

### Design: CGTase Thermostability

::content-components-lightbox-image
---
alt:
  - Conserved and functionally important positions are excluded, single
    mutations are scored, a pairwise graph guides diverse beam search, and
    multipoint designs proceed to testing.
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/overview-fig16.avif
caption: Fig. 16 | Schematic of thermal stability optimization workflow.
imageBackground: white
---
::

We aim to design successful CGTase mutants to meet industrial production requirements and address potential heat exposure during storage and transportation.

We design potentially more thermally stable CGTase mutants through a stepwise computational screening process.

We first identify and excludes residues that are highly conserved or important for ligand binding or calcium coordination. The remaining positions are evaluated with *SPURS*, an AI model that predicts how individual amino-acid changes affect protein stability, and only promising mutations are retained. To combine these mutations safely, the method follows the pairwise compatibility principle used by *FireProt*: pairs predicted to interfere with each other are rejected, while compatible pairs are gradually assembled into larger mutants through a beam-search algorithm that also maintains diversity among the designs.

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
caption: "Fig. 17 | **SPURS-guided mutation optimization of T370K (top panel)
  and T370R/F183W (bottom panel).** The embedded plots (a–d) show: **(a)**,
  Single-mutation score distribution; **(b)**, Pairwise compatibility of the 40
  top-ranked candidates. **(c)**, Selected multi-mutation scores across search
  depths; blue line represents lowest score per depth. **(d)**, Added-mutation
  score contributions; the dashed line represents the marginal threshold. Boxes
  show medians and interquartile ranges; whiskers indicate 1.5× interquartile
  range."
imageBackground: white
label: Overview — Fig. 17
layout: stack
---
::

Mutants with 2, 4, 6, or 8 additional substitutions relative to each CGTase parent, along the same search route, were selected for testing in cycle4.

### Design: Precursor Binder Affinity

::content-components-lightbox-image
---
alt:
  - Selected precursor binders undergo complex preparation, pocket definition,
    single-position proofreading, conditional probability scoring, burial
    filtering, co-folding, and polar validation.
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/overview-fig18.avif
caption: Fig. 18 | Schematic for precursor binder affinity optimization workflow
imageBackground: white
---
::

We aim to improve the affinity of BC7, BR8 and BR10 for Cys-Gly-(S)-3M3SH.

We adapted the *LASErMPNN* neural proofreading strategy described by Fry et al. :fn-ref{#7} to identify mutations. The predicted complexes are minimized. Residues within 5 Å of the ligand are then evaluated.

By adjusting decoding order, one position is allowed to vary while the remaining amino acids stay fixed. Probabilities are averaged across different decoding orders and *dropout* to reduce sensitivity to individual predictions.

Candidate substitutions are ranked by ΔNLL, which compares how much the model favors the proposed amino acid over the original one. \[\[]{.katex-mathml}\[\[\[]{.strut style="height:0.6833em;"} [Δ]{.mord}[N]{.mord.mathnormal style="margin-right:0.109em;"}[LL]{.mord.mathnormal}[]{.mspace style="margin-right:0.2778em;"}[=]{.mrel}[]{.mspace style="margin-right:0.2778em;"} ]{.base}\[\[]{.strut style="height:1em;vertical-align:-0.25em;"} [l]{.mord.mathnormal style="margin-right:0.0197em;"}[n]{.mord.mathnormal}[\[]{.mopen}[P]{.mord.mathnormal style="margin-right:0.1389em;"}[(]{.mopen}[a]{.mord.mathnormal}[)]{.mclose}[/]{.mord}[P]{.mord.mathnormal style="margin-right:0.1389em;"}[(]{.mopen}[b]{.mord.mathnormal}[)] ]{.mclose}]{.base}]{.katex-html ariaHidden="true"}]{.katex} Negative values indicate greater model support for the substitution. We prioritize candidates at buried, ligand-contacting positions, then predict and minimize their structures to filter any buried polar residues introduced without suitable hydrogen bond interactions.

The following designs are selected for testing in cycle6.

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

The measurement of the melting temperature of optimized CGTase was unsuccessful; thus, no conclusion can be drawn about the effectiveness of the design.

Affinity measurements for optimized precursor binders are currently unavailable. We are still carrying out the experiments in cycle6; the results and analysis will be updated in the presentation video.

## Overall Discussion

### What Characterize Changed

The Characterize stage in our project works as a critical step to determine our design specifications. Across the three design routes, it identified the targets, mechanisms and constraints relevant before the design stage. By translating understanding of biological systems into explicit design specifications, it ensures biological plausibility and provides a common framework for otherwise distinct engineering approaches.

### AI and Physics-Based Evaluation

AI enabled efficient exploration of the design space, while physics-based evaluation examined filtered designs under more explicit molecular assumptions. The integration of the two methods in our design-gated workflow prioritized the candidates supported by both methods for limited experimental resources.

### Limitations

The small experimental candidate set cannot establish statistically significant relationships between computational metrics and functional performance. Because of the limited variance of computational metrics in a filtered set of candidates, the results cannot concretely verify the usefulness of the single metrics and the weighted metrics we set.

### Future Improvements

Future work should strengthen experimental feedback. Specifically, larger experimental datasets would allow us to recalibrate weights and thresholds of each metric, revisit the mechanistic assumptions and design specifications, and optimize the decision-gated workflow by introducing or removing evaluation tools. With sufficient data, training or adapting a deep-learning model for the specific design purpose may become possible.
