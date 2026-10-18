---
title: "Precursor Binder Affinity"
description: "LASErMPNN neural proofreading, burial filtering, and polar validation propose affinity-improving precursor-binder substitutions."
hasReference: false
order: 2
---

::content-components-lightbox-image
---
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/model/optimization-precursor-binder-affinity-fig1.avif
alt:
  - "Selected precursor binders undergo complex preparation, pocket definition, single-position proofreading, conditional probability scoring, burial filtering, co-folding, and polar validation."
caption: "Fig. 1 | **Schematic for precursor binder affinity optimization
  workflow.** Predicted structures of experimentally selected binders are
  minimized and prepared. LASErMPNN neural proofreading is used to rank
  substitutions at ligand-pocket positions. Mutations that pass the subsequent
  filters are selected for wet-lab testing :fn-ref{#7}."
imageBackground: white
---

::

We adapted a workflow following methods by [Benjamin Fry](https://www.nature.com/articles/s41586-026-10670-w#auth-Benjamin-Fry-Aff1-Aff2-Aff3) et al. (2026) to introduce mutations in small-molecule binders to improve affinity, using *LASErMPNN* :fn-ref{#7}.

## Input Preparation

Among precursor binders, BC7, BR8 and BR10 displayed reliable experimental reduction and were therefore selected for optimization. The predicted binder structures from *RoseTTAFold3* were used as the initial structures. The ligands were set in the NH₃⁺/COO⁻ state according to pKa and axillary pH :fn-ref{#24}.

Following the paper’s *Amber14*/*SMIRNOFF* preparation :fn-ref{#7}, complexes underwent unrestrained *OpenMM* minimization. We specified *OpenFF* 2.3.0, pH 6 hydrogens, no added solvent and the default NoCutoff method.

## Neural Proofreading

### Single-Position Proofreading

Following the procedure in the paper :fn-ref{#7}, we defined the pocket as residues with any heavy atom within 5 Å of a ligand heavy atom.

For each evaluation, we released one position and fixed all other amino-acid identities. The target position was decoded last. With *dropout* active, we averaged probabilities of each amino acid in the target position over 10 dropout calls and 10 decoding orders per call, then normalized. Each position therefore had 100 probability samples of 20 amino acids.

### Mutation Ranking

For original amino acid $a$ and candidate $b$ at the target position, we calculated the following conditional probability ratio:

$\Delta NLL = \ln[P(a) / P(b)]$

Negative ΔNLL indicates the model supports the substitution from $a$ to $b$.

We calculated the buried fraction as $1-SASA_{\mathrm{bound}}/SASA_{\mathrm{isolated}}$, where $SASA_{\mathrm{bound}}$ is the side-chain SASA in the complete complex and $SASA_{\mathrm{isolated}}$ is its SASA in the same residue conformation with only the residue. Residues with buried fraction > 0.5 and substitutions with negative ΔNLL were considered, ranked by ΔNLL in ascending order.  

## Polar Validation

We then independently co-folded and minimized candidate mutated sequences starting from the top-ranking candidates, checking for unsatisfied polar atoms until two mutations passed the check.

A polar atom is considered buried at SASA < 1 Å². A polar atom with no hydrogen bonds (donor–acceptor distance ≤ 3.5 Å and D–H–A angle ≥ 120°) is considered unsatisfied.

For BC7, the initially higher-scoring N113A/V114D pair failed polar-satisfaction checks and was filtered out. F18L, A73R and their combination passed.

## Design Results

We selected three BC7 mutants, three BR8 mutants and one BR10 mutant, as listed below.

::content-components-captioned-table
---
caption: "Table 1 | **Selected candidates for precursor binder affinity design.** ΔNLL entries for doubles are the two single-position scores listed separately. RMSD is calculated from Cα atoms to the minimized unmutated parent."
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
