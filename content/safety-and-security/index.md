---
title: Safety
citationIds:
  - "1"
  - "2"
description: Safety considerations in project design, computational protein screening, laboratory work, education, inclusivity, and Human Practices.
hasReference: true
order: 0
referenceIds:
  - "1"
  - "2"
banner: https://static.igem.wiki/teams/6133/wiki/general/banners/safety.avif
bannerPosition: 50% 70%
bannerWidth: 2077
bannerHeight: 1218
bannerMobilePosition: 50% 50%
---

## Safety in Project Design

The main components proposed for Expelliodor are precursor-binding proteins, *PepT*Sh-binding proteins, an engineered cyclodextrin glycosyltransferase (CGTase), and the fragrance compounds bornyl acetate and geranyl butyrate.

Our design focuses on the pathway that produces the odour compound 3M3SH. The binders are designed to capture its precursor, Cys-Gly-3M3SH, or interfere with its uptake by PepTSh, while CGTase is engineered to modify the precursor. This approach aims to reduce odour formation without relying on broad-spectrum antibacterial action or aluminium salts that block sweat glands. Bornyl acetate and geranyl butyrate are being explored as fragrance ingredients. These design choices do not establish the safety of the final formulation. We therefore carried out preliminary computational screening of our protein candidates, with further safety assessment still needed.

We developed the binder sequences through *de novo* protein design, engineered CGTase variants, and adapted published pathways for fragrance biosynthesis. Selected DNA constructs were commercially synthesised and introduced into laboratory *Escherichia coli* strains for expression and functional testing. For precursor-transport assays, we expressed PepTSh from *Staphylococcus hominis* in *E. coli* BL21(DE3), creating a surrogate system for studying precursor uptake. We chose this system to avoid directly culturing *S. hominis* and keep the assays within the biosafety capabilities of our high-school laboratory.

## Protein Safety

Following our consultation with immunology expert Professor Yang Jianbo, we performed *in silico* screens for potential HLA-II presentation and sequence similarity to known allergens, using *NetMHCIIpan-4.3* :fn-ref{#1} and *AllergenOnline* :fn-ref{#2}, respectively. All 14 candidates contained predicted strong-binding cores across the selected panel of 27 HLA-II molecules, with minimum %Rank\_EL values of 0.01–0.55%, 5–21 distinct strong-binding core positions, and predictions involving 4–18 HLA molecules per candidate. PB3 had the lowest core count, length-normalised core density, and number of implicated HLA molecules, which provides a favourable profile for future testing. AllergenOnline searches using the complete candidate sequences returned local alignments with E-values <1 for 11 candidates; BR8, BR10, and PB4 had no matches meeting this cutoff. BC11 was the only candidate flagged by the >35% identity sliding 80-aa screen, with a maximum reported identity of 36.29% to GI 2498579, prioritising further investigation into its safety.

These results inform future candidate selection from a safety perspective. In particular, the BC11 match requires additional verification, while the HLA-II predictions indicate sequence regions that may need to be optimised in future designs. The findings highlight the need for experimental assessment of skin compatibility before topical use.

::content-components-captioned-table
---
caption: Table 1 | Computational screening of candidate proteins.
---
| **candidate\_id** | **length\_aa** | **min\_rank\_el\_pct** | **strong\_core\_count** | **strong\_core\_density\_per\_100aa** | **strong\_hla\_count\_27** | **full\_query\_hits\_e\_lt\_1** | **best\_full\_hit\_gi** | **best\_full\_hit\_evalue** | **best\_full\_hit\_identity\_pct** | **best\_full\_hit\_alignment\_aa** | **sliding\_80aa\_hits\_gt\_35pct** | **max\_sliding\_80aa\_identity\_pct** | **best\_sliding\_80aa\_hit\_gi** |
| :---------------: | :------------: | :--------------------: | :---------------------: | :-----------------------------------: | :------------------------: | :-----------------------------: | :---------------------: | :-------------------------: | :--------------------------------: | :--------------------------------: | :--------------------------------: | :-----------------------------------: | :------------------------------: |
|        BC1        |       135      |          0.55          |            9            |                 6.667                 |              8             |                3                |         66840994        |             0.3             |                45.2                |                 31                 |                  0                 |                  n.a.                 |               n.a.               |
|        BC2        |       135      |           0.1          |            20           |                 14.815                |             13             |                10               |         18093971        |            0.085            |                31.1                |                 106                |                  0                 |                  n.a.                 |               n.a.               |
|        BC6        |       206      |          0.08          |            15           |                 7.282                 |             18             |                1                |         3.07E+08        |             0.55            |                29.3                |                 99                 |                  0                 |                  n.a.                 |               n.a.               |
|        BC7        |       171      |          0.04          |            11           |                 6.433                 |             12             |                2                |         82704036        |            0.0031           |                 28                 |                 100                |                  0                 |                  n.a.                 |               n.a.               |
|        BC11       |       223      |          0.05          |            21           |                 9.417                 |             18             |                8                |         2.40E+08        |            0.022            |                32.7                |                 101                |                  1                 |                 36.29                 |              2498579             |
|        BR5        |       187      |          0.06          |            13           |                 6.952                 |             18             |                8                |         7.58E+08        |            0.012            |                24.2                |                 165                |                  0                 |                  n.a.                 |               n.a.               |
|        BR7        |       177      |          0.15          |            11           |                 6.215                 |              8             |                15               |         21725610        |             0.22            |                25.4                |                 138                |                  0                 |                  n.a.                 |               n.a.               |
|        BR8        |       215      |          0.04          |            21           |                 9.767                 |             18             |                0                |           n.a.          |             n.a.            |                n.a.                |                n.a.                |                  0                 |                  n.a.                 |               n.a.               |
|        BR10       |       118      |          0.01          |            7            |                 5.932                 |             16             |                0                |           n.a.          |             n.a.            |                n.a.                |                n.a.                |                  0                 |                  n.a.                 |               n.a.               |
|        PB1        |       100      |          0.08          |            10           |                   10                  |              9             |                12               |         2735114         |            0.019            |                24.1                |                 83                 |                  0                 |                  n.a.                 |               n.a.               |
|        PB2        |       115      |          0.28          |            10           |                 8.696                 |             10             |                6                |         2.38E+08        |            0.028            |                29.2                |                 89                 |                  0                 |                  n.a.                 |               n.a.               |
|        PB3        |       95       |          0.21          |            5            |                 5.263                 |              4             |                12               |         1.57E+08        |            0.029            |                 32                 |                 97                 |                  0                 |                  n.a.                 |               n.a.               |
|        PB4        |       119      |          0.05          |            10           |                 8.403                 |             11             |                0                |           n.a.          |             n.a.            |                n.a.                |                n.a.                |                  0                 |                  n.a.                 |               n.a.               |
|        PB5        |       104      |          0.17          |            12           |                 11.538                |             11             |                1                |         2.20E+08        |             0.35            |                41.9                |                 43                 |                  0                 |                  n.a.                 |               n.a.               |
::

**Parameter definitions**

- **length\_aa:** protein length in amino acids.
- **min\_rank\_el\_pct:** lowest NetMHCIIpan %Rank\_EL across all peptide–HLA combinations.
- **strong\_core\_count:** number of distinct 9-aa core starting positions with a strong-binder (SB) prediction.
- **strong\_core\_density\_per\_100aa:** strong-core count per 100 amino acids.
- **strong\_hla\_count\_27:** number of HLA molecules with ≥1 SB prediction among the 27 tested.
- **full\_query\_hits\_e\_lt\_1:** number of distinct AllergenOnline GI entries with E-value <1 in complete-sequence searches.
- **best\_full\_hit\_gi / evalue / identity\_pct / alignment\_aa:** GI identifier, E-value, percentage identity and alignment length of the lowest-E-value hit.
- **sliding\_80aa\_hits\_gt\_35pct:** number of distinct GI entries exceeding 35% identity in the 80-aa sliding-window search.
- **max\_sliding\_80aa\_identity\_pct / best\_sliding\_80aa\_hit\_gi:** highest sliding-window identity and corresponding GI identifier.

**aa**, amino acids; **GI**, GenInfo Identifier; **n.a.**, no qualifying hit.

## Lab Safety

Our lab is divided into three distinct areas: the living area, the experimental area, and the gel-contaminated area. Activities in each zone must adhere to specific regulations.

Before entering the experimental or gel-contaminated areas, a lab coat, goggles, gloves, and any other required protective equipment are put on. Long hair is tied back. Food and drinks are prohibited.

Toxic or carcinogenic chemicals (e.g. *Ultra GelRed*) must be handled and stored exclusively in the gel-contaminated area. An extra layer of nitrile gloves is worn before handling anything in the gel-contaminated area, and outer gloves are removed and discarded when leaving this area.

All waste, particularly biological waste containing microorganisms, must be treated with sodium hypochlorite disinfectant or autoclaved for sterilisation before disposal to prevent accidental release into the environment.

All protective equipment is removed when exiting the experimental and gel-contaminated areas.

Every member has completed rigorous training and instruction to prevent unsafe practices that could compromise personal safety. Protocol booklets are also available for reference to verify correct procedures. In addition, our PIs and advisors provided continuous supervision throughout the experiments.

::content-components-lightbox-image
---
alt:
  - ""
src:
  - https://static.igem.wiki/teams/6133/wiki/project/safety/safety-safety-fig1.avif
caption: Fig. 1 | Lab area designated for experiments.
---
::

## Safety in Education

For lab sessions, including lab-themed murder mystery games and geraniol workshops, we made sure that all participants were informed of the safety rules. Before each lab session began, we distributed safety protocols and verbally reminded participants to wear appropriate PPE and not to eat or drink in the laboratory. We also divided participants into small groups of three or four, with each group supervised by one of our team members, to prevent unsafe behaviour and ensure that laboratory procedures were followed properly.

For primary and middle school workshops, participants extracted DNA from strawberries using strawberries, washing-up liquid, alcohol, and salt. Before the experiment began, we repeatedly reminded participants not to eat any of the materials and required them to wear gloves throughout the activity. With our team members supervising the activity and teachers providing additional assistance, we ensured that participants followed the procedures properly and safely.

::content-components-lightbox-panels
---
alt:
  - Students wearing laboratory coats, goggles and gloves observe a participant
    using a pipette.
  - A team member demonstrates a laboratory procedure to students wearing
    protective equipment.
  - Numbered trays contain strawberries, disposable gloves and covered
    containers for a classroom activity.
autoLabels: true
src:
  - https://static.igem.wiki/teams/6133/wiki/project/safety/safety-safety-fig2-a.avif
  - https://static.igem.wiki/teams/6133/wiki/project/safety/safety-safety-fig2-b.avif
  - https://static.igem.wiki/teams/6133/wiki/project/safety/safety-safety-fig2-c.avif
caption: Fig. 2 | **(a–b)** Students conducting and observing experiments during
  the geraniol workshop at SCIE. **(c)** Materials prepared for the primary
  school introductory workshop at Nanshan Foreign Language Primary School.
label: "Education workshop safety: two photographs above one materials photograph"
---
::

[Download the workshop safety protocol (PDF)](https://static.igem.wiki/teams/6133/wiki/project/safety/safety-safety-protocol.pdf)

## Safety in Inclusivity

Our inclusivity work involved interviews, resource testing and educational activities with people whose needs and preferences differed. Before engaging with each community, we carried out background research to develop a basic understanding of their experiences and needs. We approached these interactions with humility and respect, treating participants as equals rather than with pity or prejudice.

Before the session at Superb School, our volunteers received specialised training from the teachers on how to support children on the autism spectrum. Before the leaf-rubbing activity began, we explained the safety requirements to the children, including not eating the leaves and using pencils carefully. Each child was accompanied by a volunteer or their guardian throughout the activity to help keep them safe.

::content-components-lightbox-image
---
alt:
  - ""
src:
  - https://static.igem.wiki/teams/6133/wiki/project/safety/safety-safety-fig3.avif
caption: Fig. 3 | One-to-one guidance during the leaf-rubbing activity.
---
::

For *Handy Lab*, each experiment included safety tips alongside the materials, steps and scientific explanation. The toolkit contained gloves and safety goggles, with demonstration videos providing additional guidance for students and teachers.

::content-components-lightbox-panels
---
alt:
  - ""
  - Six tutorial video cards cover a mini volcano, red cabbage pH indicators,
    strawberry DNA extraction, bending water, celery water uptake and floating
    eggs.
autoLabels: true
src:
  - https://static.igem.wiki/teams/6133/wiki/project/safety/safety-safety-fig4-a.avif
  - https://static.igem.wiki/teams/6133/wiki/project/safety/safety-safety-fig4-b.avif
caption: Fig. 4 | **(a)** The *Handy Lab* toolkit, including gloves, safety
  goggles and the experiment booklet. **(b)** Demonstration videos showing
  step-by-step procedures with safety tips.
label: Handy Lab safety toolkit and demonstration videos
---
::

We respect every participant’s privacy and right to decide how their information is shared. Consent is obtained before taking photographs, filming videos, making audio recordings, or publishing interview records, and we respect participants' preferences regarding whether their faces are shown publicly. For participants under 18, we blur their faces in all publicly shared photographs to protect their privacy.

## Safety in iHP

At Expelliodor, we believe that meaningful Human Practices work begins with respect for the people who contribute their time, experiences, and perspectives. Throughout our interviews, consultations, and surveys, we sought to protect participants' privacy and create an environment in which they could share their views comfortably.

::content-components-lightbox-panels
---
alt:
  - An email shares the interview outline in advance and invites questions from
    the participant.
  - Consent questions ask permission to record the interview and publish
    contributions with the participant's name, affiliation and position.
  - An email acknowledges a request not to publish interview excerpts, asks
    permission for a brief participation statement and offers review of the
    wording.
  - A survey introduction states that participation is voluntary, responses are
    used for project research and personal information is kept confidential.
autoLabels: true
src:
  - https://static.igem.wiki/teams/6133/wiki/project/safety/safety-safety-fig5-a.avif
  - https://static.igem.wiki/teams/6133/wiki/project/safety/safety-safety-fig5-b.avif
  - https://static.igem.wiki/teams/6133/wiki/project/safety/safety-safety-fig5-c.avif
  - https://static.igem.wiki/teams/6133/wiki/project/safety/safety-safety-fig5-d.avif
caption: Fig. 5 | **(a)** Interview outline shared with participants. **(b)**
  Our standard interview consent confirmation before each interview. **(c)**
  Permission to feature interview contributions on our wiki. **(d)** Survey
  confidentiality statement.
label: Interview and survey consent documents in a two-by-two grid
---
::

Before conducting interviews, we prepared questions relevant to our research objectives and shared them with participants in advance. We explained the purpose of each consultation and obtained consent before proceeding.

We respected participants' privacy by asking permission to include their names and contributions on our wiki, following their preferences when preparing public-facing materials.

For public surveys, we informed respondents of the research purpose and treated their responses confidentially, using the findings solely to inform Expelliodor's development and Human Practices evaluation. Throughout our engagements, we aimed to handle participants' contributions responsibly and represent their perspectives accurately.

## Reference

1. :ref-fn[Nilsson JB, Kaabinejadian S, Yari H, Kester MGD, van Balen P, Hildebrand WH, et al. Accurate prediction of HLA class II antigen presentation across all loci using tailored data acquisition and refined machine learning. Sci Adv. 2023;9(47)\:eadj6367. doi: [10.1126/sciadv.adj6367](https://doi.org/10.1126/sciadv.adj6367).]{#1}
2. :ref-fn[Goodman RE, Ebisawa M, Ferreira F, Sampson HA, van Ree R, Vieths S, et al. AllergenOnline: a peer-reviewed, curated allergen database to assess novel food proteins for potential cross-reactivity. Mol Nutr Food Res. 2016;60(5):1183–98. doi: [10.1002/mnfr.201500769](https://doi.org/10.1002/mnfr.201500769).]{#2}
