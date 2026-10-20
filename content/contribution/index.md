---
title: Contribution修改版
description: Reusable measurement methods, genetic parts, protein-design workflows, accessible wiki features, and education and inclusivity resources for future iGEM teams.
hasReference: false
order: 0
banner: https://static.igem.wiki/teams/6133/wiki/general/banners/contribution.avif
bannerPosition: 65% 60%
bannerWidth: 2053
bannerHeight: 1232
bannerMobilePosition: 65% 45%
---

## Measurement

To evaluate the effectiveness of our three protein-based approaches in reducing 3M3SH production, we employed [Ellman's assay](/measurement) for semi-quantitative assessment of free thiol content. :fn-ref{#1} We established a GSH standard curve and documented our [experimental procedures](/protocols) for reproducibility. Using inexpensive, commercially available reagents and commonly available laboratory equipment, our effort provides an accessible and practical reference for future iGEM teams.

::content-components-lightbox-image
---
src:
  - https://static.igem.wiki/teams/6133/wiki/project/contribution/contribution-index-fig1.avif
alt:
  - "Calibration fit: absorbance at 412 nm = 0.8958 × GSH concentration (mM) + 0.1003; R² = 0.9978."
caption: "Fig. 1 | GSH calibration curve for the DTNB–Ellman’s assay, used to estimate free thiol content from absorbance at 412 nm. Error bars represent ±SD from three technical replicates."
---

::

## Parts

Our project contributes a collection of genetic parts for targeted axillary odor management, including AI-designed protein binders, engineered CGTase variants, and enzymes involved in terpenoid ester biosynthesis. :fn-ref{#2} :fn-ref{#3} Through [experimental characterization](/engineering), we evaluated the expression and functionality of these parts, providing insights into their potential applications in odor management and fragrance production. These contributions expand the iGEM community's toolkit for synthetic biology applications in personal care and provide a foundation for further development of odor-management approaches.

### Precursor Binder

|**Part Numbers**|**Name**|**Type**|**Part Description**|
|---|---|---|---|
|[BBa_26Z9FVL2](https://registry.igem.org/parts/bba-26z9fvl2)|BC1|coding|Encodes a *de novo* designed protein binder (BC1) that selectively binds to *S*-(1-hydroxy-3-methylhexan-3-yl)-L-cysteinylglycine (Cys-Gly-3M3SH), a precursor of the odor molecule 3-methyl-3-sulfanylhexan-1-ol (3M3SH). Once the binder forms a complex with the precursor, the resulting complex may be too large for transport, while the recognition sites on the precursor may be occluded, preventing its recognition and uptake by *PepT<sub>Sh</sub>* and thereby reducing 3M3SH production.|
|[BBa_26N27JWU](https://registry.igem.org/parts/bba-26n27jwu)|BC2|coding|Encodes a *de novo* designed protein binder (BC2) that selectively binds to *S*-(1-hydroxy-3-methylhexan-3-yl)-L-cysteinylglycine (Cys-Gly-3M3SH), a precursor of the odor molecule 3-methyl-3-sulfanylhexan-1-ol (3M3SH). Once the binder forms a complex with the precursor, the resulting complex may be too large for transport, while the recognition sites on the precursor may be occluded, preventing its recognition and uptake by PepT<sub>Sh</sub> and thereby reducing 3M3SH production.|
|[BBa_26JGUSTX](https://registry.igem.org/parts/bba-26jgustx)|BC6|coding|Encodes a *de novo* designed protein binder (BC6) that selectively binds to *S*-(1-hydroxy-3-methylhexan-3-yl)-L-cysteinylglycine (Cys-Gly-3M3SH), a precursor of the odor molecule 3-methyl-3-sulfanylhexan-1-ol (3M3SH). Once the binder forms a complex with the precursor, the resulting complex may be too large for transport, while the recognition sites on the precursor may be occluded, preventing its recognition and uptake by PepT<sub>Sh</sub> and thereby reducing 3M3SH production.|
|[BBa_26ERDDB7](https://registry.igem.org/parts/bba-26erddb7)|BC7|coding|Encodes a *de novo* designed protein binder (BC7) that selectively binds to *S*-(1-hydroxy-3-methylhexan-3-yl)-L-cysteinylglycine (Cys-Gly-3M3SH), a precursor of the odor molecule 3-methyl-3-sulfanylhexan-1-ol (3M3SH). Once the binder forms a complex with the precursor, the resulting complex may be too large for transport, while the recognition sites on the precursor may be occluded, preventing its recognition and uptake by PepT<sub>Sh</sub> and thereby reducing 3M3SH production.|
|[BBa_26L7XWTQ](https://registry.igem.org/parts/bba-26l7xwtq)|BC8|coding|Encodes a *de novo* designed protein binder (BC8) that selectively binds to *S*-(1-hydroxy-3-methylhexan-3-yl)-L-cysteinylglycine (Cys-Gly-3M3SH), a precursor of the odor molecule 3-methyl-3-sulfanylhexan-1-ol (3M3SH). Once the binder forms a complex with the precursor, the resulting complex may be too large for transport, while the recognition sites on the precursor may be occluded, preventing its recognition and uptake by PepT<sub>Sh</sub> and thereby reducing 3M3SH production.|
|[BBa_26OKD9AM](https://registry.igem.org/parts/bba-26okd9am)|BC11|coding|Encodes a *de novo* designed protein binder (BC11) that selectively binds to *S*-(1-hydroxy-3-methylhexan-3-yl)-L-cysteinylglycine (Cys-Gly-3M3SH), a precursor of the odor molecule 3-methyl-3-sulfanylhexan-1-ol (3M3SH). Once the binder forms a complex with the precursor, the resulting complex may be too large for transport, while the recognition sites on the precursor may be occluded, preventing its recognition and uptake by PepT<sub>Sh</sub> and thereby reducing 3M3SH production.|
|[BBa_26SQKXP8](https://registry.igem.org/parts/bba-26sqkxp8)|BR5|coding|Encodes a *de novo* designed protein binder (BR5) that selectively binds to *S*-(1-hydroxy-3-methylhexan-3-yl)-L-cysteinylglycine (Cys-Gly-3M3SH), a precursor of the odor molecule 3-methyl-3-sulfanylhexan-1-ol (3M3SH). Once the binder forms a complex with the precursor, the resulting complex may be too large for transport, while the recognition sites on the precursor may be occluded, preventing its recognition and uptake by PepT<sub>Sh</sub> and thereby reducing 3M3SH production.|
|[BBa_26GKGPP8](https://registry.igem.org/parts/bba-26gkgpp8)|BR7|coding|Encodes a *de novo* designed protein binder (BR7) that selectively binds to *S*-(1-hydroxy-3-methylhexan-3-yl)-L-cysteinylglycine (Cys-Gly-3M3SH), a precursor of the odor molecule 3-methyl-3-sulfanylhexan-1-ol (3M3SH). Once the binder forms a complex with the precursor, the resulting complex may be too large for transport, while the recognition sites on the precursor may be occluded, preventing its recognition and uptake by PepT<sub>Sh</sub> and thereby reducing 3M3SH production.|
|[BBa_26CLXEEQ](https://registry.igem.org/parts/bba-26clxeeq)<br>|BR8|coding|Encodes a *de novo* designed protein binder (BR8) that selectively binds to *S*-(1-hydroxy-3-methylhexan-3-yl)-L-cysteinylglycine (Cys-Gly-3M3SH), a precursor of the odor molecule 3-methyl-3-sulfanylhexan-1-ol (3M3SH). Once the binder forms a complex with the precursor, the resulting complex may be too large for transport, while the recognition sites on the precursor may be occluded, preventing its recognition and uptake by PepT<sub>Sh</sub> and thereby reducing 3M3SH production.|
|[BBa_26FZREYL](https://registry.igem.org/parts/bba-26fzreyl)|BR10|coding|Encodes a *de novo* designed protein binder (BR10) that selectively binds to *S*-(1-hydroxy-3-methylhexan-3-yl)-L-cysteinylglycine (Cys-Gly-3M3SH), a precursor of the odor molecule 3-methyl-3-sulfanylhexan-1-ol (3M3SH). Once the binder forms a complex with the precursor, the resulting complex may be too large for transport, while the recognition sites on the precursor may be occluded, preventing its recognition and uptake by PepT<sub>Sh</sub> and thereby reducing 3M3SH production.|

### Transporter binder

|**Part Numbers**|**Name**|**Type**|**Part Description**|
|---|---|---|---|
|[BBa_2696AZU3](https://registry.igem.org/parts/bba-2696azu3)|TB1|coding|Encodes a *de novo*-designed transporter binder (TB1) that specifically binds to extracellular features associated with the inward-facing (IF) state of the PepT<sub>Sh</sub> responsible for *S*-(1-hydroxy-3-methylhexan-3-yl)-L-cysteinylglycine (Cys-Gly-3M3SH) uptake. The binder is designed to restrict the conformational transition of PepT<sub>Sh</sub> from the IF to the outward-facing (OF) state, thereby decreasing the efficiency of odor precursor transport into bacterial cells and limiting its subsequent conversion into the odor-causing compound 3M3SH.|
|[BBa_26DV4FUW](https://registry.igem.org/parts/bba-26dv4fuw)|TB2|coding|Encodes a *de novo*-designed transporter binder (TB2) that specifically binds to extracellular features associated with the inward-facing (IF) state of the PepT<sub>Sh</sub> responsible for *S*-(1-hydroxy-3-methylhexan-3-yl)-L-cysteinylglycine (Cys-Gly-3M3SH) uptake. The binder is designed to restrict the conformational transition of PepT<sub>Sh</sub> from the IF to the outward-facing (OF) state, thereby decreasing the efficiency of odor precursor transport into bacterial cells and limiting its subsequent conversion into the odor-causing compound 3M3SH.|
|[BBa_26DKYQ97](https://registry.igem.org/parts/bba-26dkyq97)|TB3|coding|Encodes a *de novo*-designed transporter binder (TB3) that specifically binds to extracellular features associated with the inward-facing (IF) state of the PepT<sub>Sh</sub> responsible for *S*-(1-hydroxy-3-methylhexan-3-yl)-L-cysteinylglycine (Cys-Gly-3M3SH) uptake. The binder is designed to restrict the conformational transition of PepT<sub>Sh</sub> from the IF to the outward-facing (OF) state, thereby decreasing the efficiency of odor precursor transport into bacterial cells and limiting its subsequent conversion into the odor-causing compound 3M3SH.|
|[BBa_264OP7RL](https://registry.igem.org/parts/bba-264op7rl)|TB4|coding|Encodes a *de novo*-designed transporter binder (TB4) that specifically binds to extracellular features associated with the inward-facing (IF) state of the PepT<sub>Sh</sub> responsible for *S*-(1-hydroxy-3-methylhexan-3-yl)-L-cysteinylglycine (Cys-Gly-3M3SH) uptake. The binder is designed to restrict the conformational transition of PepT<sub>Sh</sub> from the IF to the outward-facing (OF) state, thereby decreasing the efficiency of odor precursor transport into bacterial cells and limiting its subsequent conversion into the odor-causing compound 3M3SH.|
|[BBa_26WUNAJE](https://registry.igem.org/parts/bba-26wunaje)|TB5|coding|Encodes a *de novo*-designed transporter binder (TB5) that specifically binds to extracellular features associated with the inward-facing (IF) state of the PepT<sub>Sh</sub> responsible for *S*-(1-hydroxy-3-methylhexan-3-yl)-L-cysteinylglycine (Cys-Gly-3M3SH) uptake. The binder is designed to restrict the conformational transition of PepT<sub>Sh</sub> from the IF to the outward-facing (OF) state, thereby decreasing the efficiency of odor precursor transport into bacterial cells and limiting its subsequent conversion into the odor-causing compound 3M3SH.|

### CGTase

|**Part Numbers**|**Name**|**Type**|**Part Description**|
|---|---|---|---|
|[BBa_262A5J8E](https://registry.igem.org/parts/bba-262a5j8e)|CGTase WT|coding|Encodes an engineered cyclodextrin glycosyltransferase (CGTase) from *Niallia circulans* that modifies extracellular *S*‑(1‑hydroxy‑3‑methylhexan‑3‑yl)‑ʟ‑cysteinylglycine (Cys-Gly-3M3SH) by transferring an oligosaccharide group onto its hydroxyl group, reducing its recognition and transport by PepT<sub>Sh</sub> transporter and thereby limiting precursor uptake into bacterial cells. The CGTase continuously modifies newly secreted Cys-Gly-3M3SH on the skin surface, providing sustained suppression of downstream 3M3SH production.|
|[BBa_26U1MT3Z](https://registry.igem.org/parts/bba-26u1mt3z)|CGTase T370R|coding|Encodes an engineered cyclodextrin glycosyltransferase (CGTase) from *Niallia circulans* that modifies extracellular *S*‑(1‑hydroxy‑3‑methylhexan‑3‑yl)‑ʟ‑cysteinylglycine (Cys-Gly-3M3SH) by transferring an oligosaccharide group onto its hydroxyl group, reducing its recognition and transport by PepT<sub>Sh</sub> transporter and thereby limiting precursor uptake into bacterial cells. The CGTase continuously targets newly secreted Cys-Gly-3M3SH on the skin surface, providing sustained suppression of downstream 3M3SH production.|
|[BBa_261URR0X](https://registry.igem.org/parts/bba-261urr0x)|CGTase T370R F183W|coding|Encodes an engineered cyclodextrin glycosyltransferase (CGTase) from *Niallia circulans* that modifies extracellular *S*‑(1‑hydroxy‑3‑methylhexan‑3‑yl)‑ʟ‑cysteinylglycine (Cys-Gly-3M3SH) by transferring an oligosaccharide group onto its hydroxyl group, reducing its recognition and transport by PepT<sub>Sh</sub> transporter and thereby limiting precursor uptake into bacterial cells. The CGTase continuously targets newly secreted Cys-Gly-3M3SH on the skin surface, providing sustained suppression of downstream 3M3SH production.|
|[BBa_26KHGJRV](https://registry.igem.org/parts/bba-26khgjrv)|CGTase T370L|coding|Encodes an engineered cyclodextrin glycosyltransferase (CGTase) from *Niallia circulans* that modifies extracellular *S*‑(1‑hydroxy‑3‑methylhexan‑3‑yl)‑ʟ‑cysteinylglycine (Cys-Gly-3M3SH) by transferring an oligosaccharide group onto its hydroxyl group, reducing its recognition and transport by PepT<sub>Sh</sub> transporter and thereby limiting precursor uptake into bacterial cells. The CGTase continuously targets newly secreted Cys-Gly-3M3SH on the skin surface, providing sustained suppression of downstream 3M3SH production.|

### Terpenoid esters

#### Geranyl Butyrate

|**Part Numbers**|**Name**|**Type**|**Part Description**|
|---|---|---|---|
|[BBa_26OP2B7J](https://registry.igem.org/parts/bba-26op2b7j)|FaAAT2-I303G|coding|Encodes an alcohol acyltransferase from *Fragaria ananassa*, which catalyzes the transfer of a butyryl group from butyryl-CoA to geraniol, producing geranyl butyrate. The mutation in FaAAT2 involves the replacement of isoleucine with glycine at residue 303, enhancing the enzyme's substrate selectivity for butyryl-CoA over acetyl-CoA.|
|[BBa_26I8SJIO](https://registry.igem.org/parts/bba-26i8sjio)|Cahbd|coding|Encodes a 3-hydroxybutyryl-CoA dehydrogenase from *Clostridium acetobutylicum*, which catalyzes the conversion of Acetoacetyl-CoA into β-Hydroxybutyryl-CoA.|
|[BBa_26QPLPKW](https://registry.igem.org/parts/bba-26qplpkw)|Cacrt|coding|Encodes a short-chain-enoyl-CoA hydratase from *Clostridium acetobutylicum*, which catalyzes the conversion of 3-hydroxybutyryl-CoA into crotonyl-CoA.|
|[BBa_26WSUN5P](https://registry.igem.org/parts/bba-26wsun5p)|Tdter|coding|Encodes a trans-2-enoyl-CoA reductase from *Treponema denticola*, which catalyzes the reduction of crotonyl-CoA to butyryl-CoA.|
|[BBa_2634YD85](https://registry.igem.org/parts/bba-2634yd85)|CaBACT|coding|Encodes a butyrate-acetoacetate CoA-transferase (CaBACT) from *Clostridium acetobutylicum*, which activates short-chain fatty acids (SCFAs) by converting them into their corresponding acyl-CoA derivatives for subsequent ester biosynthesis.|
|[BBa_26G9CJVF](https://registry.igem.org/parts/bba-26g9cjvf)|FaAAT2-I303G-CaBACT (composite)|composite|Coordinated enzyme system for esterification of geraniol into geranyl butyrate. The mutation of FaAAT2 improves its substrate selectivity toward butyryl-CoA.|
|[BBa_269IWP38](https://registry.igem.org/parts/bba-269iwp38)|EcatoB-Cahbd-Cacrt-Tdter (composite)|composite|Coordinated enzyme system for conversion of acetyl-CoA into butyryl-CoA.|

#### Bornyl Acetate

|**Part Numbers**|**Name**|**Type**|**Part Description**|
|---|---|---|---|
|[BBa_26OFTSJV](https://registry.igem.org/parts/bba-26oftsjv)|DiBPPS|coding|Encodes a bornyl diphosphate synthase (BPPS) from *Dipterocarpus intricatus* that catalyzes the cyclization of geranyl diphosphate (GPP) to produce bornyl diphosphate (BPP).|
|[BBa_26O46SQG](https://registry.igem.org/parts/bba-26o46sqg)|EcNudJ|coding|Encodes a Nudix hydrolase from *Escherichia coli* that catalyzes the hydrolysis of nucleotide diphosphate-related substrates. It is investigated as a candidate enzyme for converting bornyl diphosphate (BPP) into borneol, which can serve as a substrate for subsequent esterification.|
|[BBa_26GL8Q56](https://registry.igem.org/parts/bba-26gl8q56)|LiAAT4|coding|Encodes an alcohol acyltransferase from *Lavandula × intermedia*, which catalyzes the transfer of an acetyl group from acetyl-CoA to borneol, producing bornyl acetate.|
|[BBa_26HC9XRI](https://registry.igem.org/parts/bba-26hc9xri)|t86AgGPPS-DiBPPS-EcNudJ (composite)|composite|Coordinated enzyme system for production of borneol from IPP and DMAPP.|
|[BBa_266MBZD7](https://registry.igem.org/parts/bba-266mbzd7)|LiAAT4-CaBACT (composite)|composite|Coordinated enzyme system for esterification of borneol into bornyl acetate.|

## Terpenoid Ester Synthesis

We applied an established two-strain co-culture strategy to the biosynthesis of two terpenoid esters, bornyl acetate and geranyl butyrate. :fn-ref{#4} For each compound, we constructed an esterification strain and paired it with a monoterpene alcohol-producing strain. We documented the genetic constructs, fermentation conditions, and GC-MS analysis of both systems to provide experimental references for future iGEM teams interested in microbial fragrance production.

::content-components-lightbox-panels
---
src:
  - https://static.igem.wiki/teams/6133/wiki/project/contribution/contribution-index-fig2a.avif
  - https://static.igem.wiki/teams/6133/wiki/project/contribution/contribution-index-fig2b.avif
alt:
  - ""
  - ""
autoLabels: true
caption: "Fig. 2 | Mass-spectrum comparisons used to assess terpenoid ester production. Experimental spectra are compared with library reference spectra for **(a)** bornyl acetate and **(b)** geranyl butyrate."
---

::

## Model

We contribute a reusable Characterize–*DBTL* framework and accessible computational design workflow. :fn-ref{#5} :fn-ref{#6} The framework provided a structured approach to translate biological mechanisms into explicit design requirements. We also share our automation scripts and the decision-gated workflow. This could help future iGEM teams with limited experimental resources integrate deep learning-guided protein engineering into their projects.

::content-components-lightbox-image
---
src:
  - https://static.igem.wiki/teams/6133/wiki/project/contribution/contribution-index-fig3.avif
alt:
  - "Problem definition, biological mechanism, design requirements, and design specification feed into the Design–Build–Test–Learn cycle."
caption: "Fig. 3 | The Characterize stage and its four substages. Problem definition leads to a design specification that guides the subsequent DBTL cycle."
---

::

::content-components-lightbox-image
---
src:
  - https://static.igem.wiki/teams/6133/wiki/project/contribution/contribution-index-fig4.avif
alt:
  - "Four successive screening stages narrow a broad design space to a final testing set."
caption: "Fig. 4 | Decision-gated candidate screening. Successive evaluations reduce the candidate pool before more resource-intensive assessment."
---

::

## Software

We developed *FoundryUI* to make computational protein design more accessible and reusable for the iGEM community, particularly for teams with little command-line interface experience. The software provides a flow-programming-based GUI interface, making protein engineering easy to understand and share. Teams can share reusable workflows and improve others' workflows. This software provides a practical resource for future teams to integrate computational design. :fn-ref{#6}

::content-components-lightbox-image
---
src:
  - https://static.igem.wiki/teams/6133/wiki/project/contribution/contribution-index-fig5.avif
alt:
  - ""
caption: "Fig. 5 | The FoundryUI workbench showing a complete protein-design workflow assembled from connected nodes."
---

::

## Wiki

### Accessibility

We provide **future** iGEM teams with a practical reference for building accessible and responsive wikis. :fn-ref{#7} We documented our [accessible designs](/inclusivity/accessibility), and introduced a development workflow that combines several automated accessibility testing tools. :fn-ref{#8} We also prioritize readability on different devices through responsive design. :fn-ref{#7} Other iGEM teams can adapt the design strategy to improve their own documentation.

::content-components-lightbox-panels
---
src:
  - https://static.igem.wiki/teams/6133/wiki/project/contribution/contribution-index-fig6a.avif
  - https://static.igem.wiki/teams/6133/wiki/project/contribution/contribution-index-fig6b.avif
  - https://static.igem.wiki/teams/6133/wiki/project/contribution/contribution-index-fig6c.avif
alt:
  - ""
  - ""
  - ""
autoLabels: true
caption: "Fig. 6 | Responsive presentation of the same FoundryUI documentation on **(a)** a tablet in portrait orientation, **(b)** a phone and **(c)** a desktop. Navigation and content layout adjust to the available screen width."
---

::

### Interactive Features

We have developed several practical designs that **other** iGEM teams can refer to and build upon:

- a dedicated [**structure viewer**](/structureviewer) page to view all the proteins we designed

- a [**real-time rendered graph**](/model/precursor-binder/md-simulation) to display all RMSD graphs

- a **search bar** to search across all our documents.

- a [sign language game](/inclusivity/game) to complement our *SignBio* Series videos through interactive learning.

- a [viewer of our tactile graphics](/inclusivity/viewmodel/plant_cell/description-en) to explore how we adapted biology diagrams for blind learners.

::content-components-lightbox-panels
---
src:
  - https://static.igem.wiki/teams/6133/wiki/project/contribution/contribution-index-fig7a.avif
  - https://static.igem.wiki/teams/6133/wiki/project/contribution/contribution-index-fig7b.avif
  - https://static.igem.wiki/teams/6133/wiki/project/contribution/contribution-index-fig7c.avif
  - https://static.igem.wiki/teams/6133/wiki/project/contribution/contribution-index-fig7d.avif
alt:
  - ""
  - ""
  - ""
  - ""
autoLabels: true
caption: "Fig. 7 | Interactive wiki features: **(a)** protein structure viewer, **(b)** RMSD plot, **(c)** sign language game and **(d)** tactile graphics viewer."
---

::

### Modular Content Design

For content-rich sections such as Model and iHP, we organized information into multiple shorter, focused documents rather than a single long page. This approach makes the content easier to navigate and understand, reduces loading times, and creates a clearer information structure.

::content-components-lightbox-image
---
src:
  - https://static.igem.wiki/teams/6133/wiki/project/contribution/contribution-index-fig8.avif
alt:
  - "Sidebar groups precursor-binder documents into Characterize, Design, Build, Test, Learn, and molecular dynamics simulation pages."
caption: "Fig. 8 | An example of modular wiki organization, with related documents grouped in a navigable hierarchy."
---

::

## iHP

### Underarm Odor Mental Health Educational Handbook

Following advice from a community psychological counselor, our [underarm odor mental health handbook](/human-practices/stage-5-expanding-impact#cycle-3-school-wellbeing-counselor) translates research into accessible public education. It explains ABCC11 genetics, odor-producing skin bacteria, common misconceptions, and management options, with communication guidance for affected individuals, parents, friends, and teachers. These explanations and audience-specific materials offer a reference for health-related iGEM projects addressing stigma and psychosocial wellbeing.

## Inclusivity

### LIFT+ Framework

*LIFT+* provides a reusable framework for identifying accessibility barriers, designing inclusive resources, incorporating participant feedback, and sharing outcomes with the wider community.

::content-components-lightbox-image
---
src:
  - https://static.igem.wiki/teams/6133/wiki/project/contribution/contribution-index-fig9.avif
alt:
  - ""
caption: "Fig. 9 | The LIFT+ framework, comprising Learn, Intervene, Feedback, Transfer, and Beyond."
---

::

We documented its stages to support the planning and refinement of inclusive activities. The framework can be adapted to different communities, with participant feedback guiding subsequent improvements.

### Blind Community

Our collection of 20 tactile graphics supports biology learning for blind learners in China. It covers 20 fundamental biology topics across five categories:

- **Cell Biology** — Plant Cell, Animal Cell, Bacterial Cell, Egg Cell, Sperm Cell, Neuron, Paramecium

- **Genetics and Molecular Biology** — DNA Structure, Female Karyotype, Male Karyotype

- **Organ Systems** — Digestive System, Respiratory System, Urinary System, Female Reproductive System, Male Reproductive System

- **Organs** — Ear Structure, Eye Structure, Heart Structure

- **Specialized Anatomical Structures** — Alveoli, Nephron

All 20 designs are available through an interactive [graphics viewer](/inclusivity/viewmodel/), with files provided for [download](/inclusivity). Educators and iGEM teams can reproduce the graphics through 3D printing, adapt them to their learners, and extend the collection to additional topics.

### Children on the Autism Spectrum

To accommodate different learning and sensory needs, we developed four [Superb Course multi-sensory teaching kits](/inclusivity#autism-spectrum) for children on the autism spectrum. Sensory activities and flexible participation methods are incorporated throughout the kits, which cover four topics:

- **Plants**

- **Animals**

- **Bacteria**

- **Humans**

A lesson plan and accompanying slides are provided with each kit and are freely available on our iGEM Wiki. Together, they offer a practical starting point for adapting science activities for children on the autism spectrum.

### Individuals from Low Socioeconomic Backgrounds

With six experiments using easily accessible materials, [Handy Lab](/inclusivity#low-socio-economic-backgrounds) offers an experimental toolkit for learners with limited access to hands-on science activities. The experiments cover three subject areas:

- **Physics** — Floating Egg, Bending Water

- **Chemistry** — Red Cabbage pH Indicator, Mini “Volcano”

- **Biology** — Strawberry DNA Extraction, Thirsty Celery

We share the experiment booklets and material lists so that other teams and educators can adapt the activities to local conditions. The collection also provides a basis for adding further experiments for communities with limited access to laboratory resources.



### Modeling Beginners

For modeling beginners, we paired a guidebook with graphical modeling software to make computational methods in synthetic biology more approachable. These resources combine step-by-step explanations with reusable workflows:

**1 Modeling Guidebook**

Covering 3 topics:

- *de novo* Binder Design using:

    - *Proteina-Complexa*

    - *Rosetta Foundry* (*RFdiffusion*, *LigandMPNN*, *RoseTTAFold*)

- Molecular Dynamics

- Property Prediction

**1 [Modeling Software](/software) with Graphical User Interface**

Covering 3 modeling workflows:

- Structure Prediction

- Ligand Binder

- Protein Binder

The guidebook explains the methods, while the software supports their application through graphical workflows. Both can be used to introduce modeling to new team members and provide a starting point for project-specific design work.

::content-components-lightbox-image
---
src:
  - https://static.igem.wiki/teams/6133/wiki/project/contribution/contribution-index-fig10.avif
alt:
  - ""
caption: "Fig. 10 | The FoundryUI *Colab* notebook showing project setup steps for a browser-based start to the workflow."
---

::

## Education

Our education work followed the *TFMFR* (Target, Feature, Method, Feedback, Reflection) framework to guide activity design and improvement. To support teaching-method selection, we developed the Edu Target Profile Radar, recording age, educational level, group size, SynBio knowledge, interest, and engagement. Pre- and post-session comparisons of knowledge, interest, and engagement provide a basis for evaluating outcomes and refining subsequent activities. Clay crafting, slime making, fuse beads, and *Jubensha* (murder mystery games) introduce SynBio through familiar recreational formats. The documented framework, evaluation tools, and activity designs offer adaptable resources for teams planning education for different audiences.

::content-components-lightbox-panels
---
src:
  - https://static.igem.wiki/teams/6133/wiki/project/contribution/contribution-index-fig11a.avif
  - https://static.igem.wiki/teams/6133/wiki/project/contribution/contribution-index-fig11b.avif
alt:
  - ""
  - "Radar chart compares audience profiles before and after the lecture across age, knowledge of synthetic biology, educational level, interest, group size, and engagement."
autoLabels: true
caption: "Fig. 11 | **(a)** TFMFR teaching framework. **(b)** Edu Target Profile Radar before and after the SynBio Intro Lecture at Nanning No. 3 High School."
---

::

## Reference

1. Ellman GL. Tissue sulfhydryl groups. Arch Biochem Biophys. 1959;82(1):70–77. doi: [10.1016/0003-9861(59)90090-6](https://doi.org/10.1016/0003-9861(59)90090-6).

2. Minhas GS, Bawdon D, Herman R, Rudden M, Stone AP, James AG, et al. Structural basis of malodour precursor transport in the human axilla. eLife. 2018;7:e34995. doi: [10.7554/eLife.34995](https://doi.org/10.7554/eLife.34995).

3. Lim CH, Rasti B, Sulistyo J, Hamid MA. Comprehensive study on transglycosylation of CGTase from various sources. Heliyon. 2021;7(2):e06305. doi: [10.1016/j.heliyon.2021.e06305](https://doi.org/10.1016/j.heliyon.2021.e06305).

4. Yang D, Liang H, Li X, Wang B, Zhang C, Yuan M, et al. A microbial platform for selective biosynthesis of monoterpene esters. Nat Commun. 2026;17:4851. doi: [10.1038/s41467-026-71681-9](https://doi.org/10.1038/s41467-026-71681-9).

5. iGEM Technology. Engineering: The Engineering Cycle [Internet]. [cited 2026 Oct 20]. Available from: [iGEM Engineering](https://technology.igem.org/engineering).

6. Rosetta Commons. Protein design with Foundry [Internet]. GitHub; [cited 2026 Oct 20]. Available from: [Rosetta Commons Foundry](https://github.com/RosettaCommons/foundry).

7. World Wide Web Consortium. Web Content Accessibility Guidelines (WCAG) 2.2 [Internet]. W3C Recommendation; 2024 Dec 12 [cited 2026 Oct 20]. Available from: [WCAG 2.2](https://www.w3.org/TR/2024/REC-WCAG22-20241212/).

8. World Wide Web Consortium, Web Accessibility Initiative. Evaluating Web Accessibility Overview [Internet]. [cited 2026 Oct 20]. Available from: [Evaluating Web Accessibility Overview](https://www.w3.org/WAI/test-evaluate/).
