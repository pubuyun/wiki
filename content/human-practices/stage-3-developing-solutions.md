---
title: "Stage 3 Developing Solutions"
description: "Integrating modeling, industry, and synthetic biology expertise into mechanism-based approaches to odor control."
hasReference: false
order: 4
---

::content-components-lightbox-image
---
src:
  - "https://static.igem.wiki/teams/6133/wiki/hp/ihp/human-practices-stage-3-developing-solutions-fig1.avif"
alt:
  - "Map of unmet needs from Stage 2, linking customers to skin comfort, affordability, safe ingredients, and convenient, effective odor control."
caption: "Fig. 1 | Potential customers & unmet needs graph from stage 2"
---
::

Our findings from **Stage 1 & 2** prompted us to explore whether we could develop a solution that addresses these unmet needs.

## Cycle 1 Modeling Expert

### Observe

From the research paper shared by **dermatologist Dr. Xia**, we learnt that *Staphylococcus hominis* takes up the odorless precursor **Cys-Gly-3M3SH** through the membrane transporter **PepTSh** and converts it into **3M3SH**, a volatile sulfur compound responsible for underarm odor.:fn-ref{id="1"} Since existing solutions offered few suitable ingredients that met our requirements for safety and effectiveness, we began exploring whether **targeting the underlying mechanism** could offer an alternative approach to odor control.

However, our literature review revealed **few existing approaches** that intervened with odor formation directly while meeting our requirements. We therefore proposed using deep-learning models to design a ***de novo* protein binder targeting PepTSh**. By interfering with the transporter, we hoped to reduce precursor uptake. As we were new to computational modeling, we wished to seek guidance on establishing a reliable dry-lab workflow for candidate generation, screening and validation.

### Determine

To assess the technical feasibility of this idea and learn how to implement it computationally, we interviewed **Mr. Li Jun**, a modeling expert specializing in *de novo* protein design at Link Spider.

::content-components-lightbox-image
---
src:
  - "https://static.igem.wiki/teams/6133/wiki/hp/ihp/human-practices-stage-3-developing-solutions-fig2.avif"
alt:
  - "Interview with modelling expert Mr. Li"
caption: "Fig. 2 | Interview with modelling expert Mr. Li"
---
::

### Outcome

Mr Li confirmed that *de novo* protein design provided a feasible route for developing binders. However, he explained that PepTSh would be a **challenging initial target**. PepTSh is a membrane protein that undergoes conformational changes during transport with many residues involved in its function buried within the membrane. A successful binder would therefore need to recognise an accessible surface in a specific conformation and remain stably bound in a membrane environment. These requirements made target-site selection and computational validation more complicated.

He therefore suggested that we begin with a **precursor binder targeting** **Cys-Gly-3M3SH**. The defined structure of this small molecule made the design process more manageable than membrane-protein binder design. This allowed us, as a high-school team with no prior modelling experience, to become familiar with a standard ***de novo* binder-design workflow**. Additionally, the precursor binder could also serve as a supplementary deodorizing strategy by **sequestering the precursor Cys-Gly-3M3SH** before PepTSh-mediated uptake, preventing the conversion of the odor-causing compound **3M3SH**.

Mr. Li also introduced us to the general workflow for *de novo* binder design, which involved:

1. Defining the binding target and the structural requirements of the intended binder.

2. Obtaining and preparing the target ligand or protein structure.

3. Identifying suitable interaction regions or hotspot residues where applicable.

4. Generating candidate binder structures around the selected target.

5. Designing amino-acid sequences for the generated structures.

6. Predicting the structures of the resulting binder-target complexes.

7. Evaluating candidates through structural-confidence metrics, interface analysis, and molecular-dynamics simulations where appropriate.

8. Selecting the most promising candidates for experimental validation.

This provided a practical foundation for our binder-design work.

Beyond outlining the protein-design workflow, Mr. Li also commented on the potential effectiveness and limitations of our two proposed binder strategies. He noted that the precursor binder's one-to-one binding with **Cys-Gly-3M3SH** might require a relatively high protein concentration to provide a sustained effect. Additionally, he noted that that although a transporter binder could reduce precursor uptake by blocking **PepTSh** or stabilizing its non-transporting conformation, prolonged interference with the same bacterial target might create selective pressure for bacterial adaptation.

### Refine

Following Mr Li's advice, we first designed precursor binders using two parallel approaches: the **Rosetta Foundry workflow** and the **Proteina-Complexa workflow**. We then screened candidates from both approaches through structural evaluation and molecular-dynamics simulations.

Then, we analysed the conformational states and extracellularly accessible surfaces of **PepTSh** to define suitable binding interfaces, and then designed transporter binders using the **Rosetta Foundry workflow**.

The potential limitations of precursor binders and transporter binders prompted us to explore a new solution to the mechanism. Inspired by **GreatBay-SCIE 2025**, we explored an enzyme-mediated strategy for modifying **Cys-Gly-3M3SH** before its uptake by *S. hominis*. Using a [CGTase](/model/cgtase) from *Niallia circulans* as our starting point, we combined molecular docking and molecular-dynamics simulations to identify **potential mutation sites** and **select promising variants** for experimental validation.

Our **three strategies** target complementary points in the same pathway: sequestering free precursor, blocking bacterial uptake and modifying newly secreted precursor. Together, they could provide more robust and sustained odor control than any single strategy alone.

1. Minhas, Gurdeep S, et al. “Structural Basis of Malodour Precursor Transport in the Human Axilla.” *eLife*, vol. 7, 3 July 2018, p. e34995, https://doi.org/10.7554/eLife.34995. PubMed Central.

## Cycle 2 First meeting with KleanK

### Observe

After we shared our proposed solution on social media, **KleanK**, a **Chinese deodorant brand**, reached out to us. As its existing products primarily rely on **aluminum salts** to reduce sweating, the company expressed interest in **our alternative approach**. We saw this as an opportunity to gain industry insight into the potential effectiveness of our mechanism-based strategy and the feasibility of using proteins as practical deodorant ingredients.

::content-components-bilingual-image-panels
---
srcEn:
  - "https://static.igem.wiki/teams/6133/wiki/hp/ihp/human-practices-stage-3-developing-solutions-fig3-2.avif"
srcZh:
  - "https://static.igem.wiki/teams/6133/wiki/hp/ihp/human-practices-stage-3-developing-solutions-fig3-1.avif"
altEn:
  - "Text messages from KleanK on chinese social media RedNote asking for collaboration"
altZh:
  - "Text messages from KleanK on chinese social media RedNote asking for collaboration"
label: "Fig. 3 | Text messages from KleanK on chinese social media RedNote asking for collaboration — image language"
caption: "Fig. 3 | Text messages from KleanK on chinese social media RedNote asking for collaboration"
defaultLanguage: "en"
---
::

### Determine

We held an online meeting with **Mr. Deng Yongnan**, Director of Medical R&D at KleanK, to discuss the feasibility, advantages and potential limitations of our solution.

### Outcome

Mr. Deng supported our strategy of targeting the biological mechanism of underarm odor and viewed our approach as a **promising, potentially gentler alternative** to conventional chemical-based deodorants. He stated that from an consumer perspective, protein-based products could be particularly appealing to **users with greater safety concerns**, such as adolescents and pregnant women. He also noted that most aluminum-salt deodorants have a relatively low pH and may cause **irritation**, while prolonged exposure of metal salts may contribute to **inflammation** and **underarm darkening** in some users.

Additionally, he highlighted a practical challenge for protein-based products. During summer, products transported or stored in southern China may be exposed to temperatures of **40-50 °C**, which could potentially cause proteins to **denature and lose activity**. He therefore suggested considering a **freeze-dried product format** to improve product stability.

Mr. Deng also expressed preliminary interest in supporting later-stage product evaluation. If our initial results were promising, KleanK could help organize consumer testing involving up to **50,000 users** and provide **access to relevant experts** for technical feedback. Both parties expressed willingness to continue the discussion after our initial efficacy tests.

### Refine

KleanK's interest provided preliminary industry validation of the market potential of a biological deodorant. It also opened up the possibility of a **future co-development partnership**: our team could contribute biological design and experimental validation, while KleanK could provide product-development experience, technical assessment, consumer insights and access to market channels.

If technical feasibility is established, such a collaboration could help advance our project from laboratory proof of concept through formulation optimization and pilot testing to large-scale consumer evaluation and, ultimately, potential commercialization.

Based on Mr. Deng's advice, we added **freeze-dried protein** as a potential product format and incorporated **thermostability** into our development considerations. In subsequent development, we plan to evaluate our [protein stability]() under relevant storage conditions to assess its suitability for practical deodorant applications.

## Cycle 3 SynBio Expert

### Observe

After the [**successful expression**](/engineering/transporter-binder#build) of PepTSh binders, we wanted to validate them using the same approach previously employed for our precursor binder validation. Our proposed assay involved co-incubating the precursor, PepTSh-expressing *E. coli*, and the candidate binders, then measuring 3M3SH levels using **[Ellman’s assay](/measurement)**.

We chose *Escherichia coli* as the host instead of *S. hominis* for its **faster growth**, which helps accelerate our experimental progress. However, the **difference in cell-envelope structure** between *E. coli* and *S. hominis* complicated the validation process. As a Gram-negative bacterium, *E. coli* has an **outer membrane that limits the entry of large molecules such as protein binders**. Since the transporter is located in the inner membrane, the methods used for precursor binder validation could not be directly applied.

We therefore explored several alternatives, including proteoliposome-based assays and validation using extracted PepTsh, but their **feasibility was limited** under our current experimental conditions.

### Determine

To address this problem, we interviewed **Professor Meng Qing**, Chief Scientist at Link Spider and a professor of biomaterials and biomimetics at Donghua University, with extensive expertise in synthetic biology for over 20 years, and sought his advice on potential solutions. Our discussion focused on how the transporter binders could be tested in engineered *E. coli*, given the limited accessibility of the inner-membrane target and the practical constraints of our laboratory.

::content-components-lightbox-image
---
src:
  - "https://static.igem.wiki/teams/6133/wiki/hp/ihp/human-practices-stage-3-developing-solutions-fig4.avif"
alt:
  - "Interview with synbio expert Professor Meng"
caption: "Fig. 4 | Interview with synbio expert Professor Meng"
---
::

### Outcome

Professor Meng recommended expressing the transporter binders in the *E. coli* periplasm. He suggested adding the **DsbA N-terminal signal peptide** (UniProt P0AEG4, residues 1–19) to guide the binders through the Sec pathway. This could position the binders on the periplasmic side of the inner membrane, improving their access to PepTSh.

Additionally, upon learning that we planned to incorporate **woody and floral fragrances** into some of our products, Professor Meng suggested exploring **biosynthesizable terpenoid compounds** as potential fragrance ingredients. He highlighted their potential environmental benefits, as microbial production could offer a more sustainable alternative to conventional extraction and chemical synthesis.

### Refine

Following the discussion with Professor Meng, we **redesigned our transporter binder expression plasmids** by fusing DsbA to the transporter binders, followed by reverse translation and codon optimization of the new sequence. The constructed plasmids were then transferred into *E. coli* cells already harbouring a PepTSh expression plasmid.

Although periplasmic expression allows us to test the transporter binders' affinity to PepTSh and reactivity, it doesn't account for the effect of the *S. hominis* cell wall. Therefore, we plan to conduct an **assay with *Staphylococcus hominis*** in the future under appropriate protection.

Additionally, following Professor Meng's suggestion, we conducted further literature research and identified **bornyl acetate** and **geranyl butyrate** as promising fragrance candidates. Bornyl acetate has a **woody, camphorous scent**, while geranyl butyrate has a **floral scent**, aligning with the fragrance preferences identified in our survey. Inspired by the paper *"A microbial platform for selective biosynthesis of monoterpene esters" (Yang et al., 2026)*, which demonstrated the feasibility of producing monoterpene esters using engineered microbial systems, we explored the potential of biosynthesizing these compounds through *E. coli* co-culture systems, informing our [subsequent fragrance biosynthesis design](/engineering/terpenoid-ester).:fn-ref{id="2"}

## Moving on

By the end of **Stage 3**, expert guidance had helped us develop **three complementary protein-based strategies** and establish workflows for computational design and laboratory testing. We had also begun exploring biosynthetic fragrance ingredients and a **potential industry partnership with KleanK**.

However, turning these laboratory approaches into a practical deodorant required further consideration of **formulation, protein stability, and safety**. These questions led us to **Stage 4**, where we sought more specialized guidance to refine our product for everyday use.
