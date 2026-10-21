---
title: Project Description copy
description: Expelliodor combines targeted protein design, precursor modification, and biosynthetic fragrances to address axillary odor while supporting inclusive and responsible product design.
hasReference: false
order: 0
banner: https://static.igem.wiki/teams/6133/wiki/general/banners/description.avif
bannerPosition: 45% 45%
bannerWidth: 2053
bannerHeight: 1232
bannerMobilePosition: 65% 40%
---

## Abstract

Axillary odor is a common concern caused by both genetic variations and axillary microbiota. People with the CT or CC genotypes of the ABCC11 gene express a corresponding transporter that transports odor precursor *S*‑(1‑hydroxy‑3‑methylhexan‑3‑yl)‑ʟ‑cysteinylglycine (Cys-Gly-3M3SH) out to the apocrine gland in axillary area. :fn-ref{#1} The precursor is then imported into *Staphylococcus hominis* through a peptide transporter *S. hominis* (*PepT<sub>Sh</sub>*) from the proton-coupled oligopeptide transporter (POT) family and then converted into a volatile thiol compound 3-methyl-3-sulfanylhexan-1-ol (3M3SH), one of the major contributors to axillary odor. :fn-ref{#2} Conventional odor-control products are frequently associated with adverse effects, such as dryness, skin irritation, and disruption of the natural skin microbiome, whilst surgical approaches may involve additional risks, including hematoma, regional nerve disturbances or even skin necrosis. In order to resolve the problem, GreatBay-SCIE aimed to create a targeted deodorant—Expelliodor. Expelliodor intercepts the import of precursor into *S. hominis*, thus preventing odor production. Specifically, using an AI-based protein design framework, we designed a de novo small-molecule binding protein that selectively sequesters the precursor Cys-Gly-3M3SH, a *de novo* protein binder that inhibits the conformational changes of the transporter PepT<sub>Sh</sub>, and an enzyme that chemically modifies the precursor to make it unrecognizable to the transporter. In addition, we produced monoterpenoid esters, geranyl butyrate and bornyl acetate, to add specific pleasant fragrances to our product according to the needs of our potential customers. :fn-ref{#3} :fn-ref{#4} In summary, Expelliodor provides our users with a safe and inclusive experience, aiming to accommodate the various unmet needs across diverse user groups. Through inclusive design, we hope to make our product accessible to all groups who may benefit from Expelliodor. Simultaneously, we hope to challenge the stigma surrounding underarm odor and foster an environment where it is not something people feel ashamed of.

## Inspiration

One of our teammates first became conscious of her underarm odor during adolescence. After physical education classes or a long day at school, she often worried that people around her might notice it. She tried several deodorants, but none provided the reliable protection she wanted. Eventually, using deodorant became part of her daily routine. Without it, she felt uneasy and constantly worried that others might notice her odor and distance themselves from her.

When she shared this experience with the team, several other members recalled hearing about classmates who had been given hurtful nicknames or socially excluded because of their underarm odor. These experiences helped us realize that axillary odor was more than an unpleasant smell. It can affect self-confidence, interpersonal relationships, and everyday well-being.

## Background

### Problem

Axillary odor is a common concern that affects comfort, confidence, and everyday social interactions. While axillary sweat itself is odorless, it contains *S*‑(1‑hydroxy‑3‑methylhexan‑3‑yl)‑ʟ‑cysteinylglycine (Cys-Gly-3M3SH), which gets converted by skin bacteria into the volatile sulfur compound 3-methyl-3-sulfanylhexan-1-ol (3M3SH) – the primary culprit of axillary odor. :fn-ref{#5}

Despite its prevalence varying across populations due to genetic factors, axillary odor remains a widespread issue worldwide, affecting approximately 4.95 billion people. :fn-ref{#6} :fn-ref{#7} Yet current solutions are often flawed and require trade-offs between effectiveness and skin health.

::content-components-lightbox-image
---
src:
  - https://static.igem.wiki/teams/6133/wiki/project/description/description-project-description-fig1.avif
alt: "Regional odor-associated ABCC11 allele frequencies: Eastern Asian 21.54%, Southern Asian 62.22%, European 97.48%, Oceanian 96.05%, African 99.99%, and American 92.42%."
caption: "Fig. 1 | Odor-associated ABCC11 allele frequency according to  :fn-ref{#7} (excluding Western Asia and Central Asia due to insufficient data)."
imageBackground: white
---
::

### The Odor-Producing Biochemical Pathway

The pathway begins in the human apocrine sweat gland. First, cells produce an odorless glutathione conjugate, glutathione 3-methyl-3-sulfanylhexanol conjugate (SG-3M3SH), and import it into secretory vesicles. Within the secretory vesicle, the enzyme γ-glutamyl transferase 1 (GGT1) cleaves the terminal glutamyl residue, generating Cys-Gly-3M3SH, an odorless dipeptide-conjugated thioalcohol. :fn-ref{#8} This precursor exits the sweat glands to the skin via apocrine secretion. Skin bacteria, specifically *Staphylococcus hominis*, actively transport this precursor across their membrane using the proton-coupled oligopeptide transporter from the POT family of the Major Facilitator Superfamily (MFS), the peptide transporter from *Staphylococcus hominis* (PepT<sub>Sh</sub>). :fn-ref{#2} Once inside the bacteria, the precursor is trimmed by the dipeptidase PepV to remove a glycine, then cleaved by a β-lyase called PatB to release the volatile, malodorous compound 3M3SH (Fig. 2). :fn-ref{#5} :fn-ref{#9}

Importantly, only individuals carrying a functional ATP-binding cassette transporter sub-family C member 11 (ABCC11) protein—specifically those with CC or CT genotypes—can effectively transport the odorless precursor into the secretory vesicles, leading to the presence of Cys-Gly-3M3SH in sweat. This results in regional variations among the affected population (Fig. 2). :fn-ref{#1}

Axillary skin temperature has a range of 36.7 ± 0.41 °C, with a pH between 5.5 and 7. These physiological conditions are optimal for the activity of odor-producing bacteria.

::content-components-lightbox-image
---
src:
  - https://static.igem.wiki/teams/6133/wiki/project/description/description-project-description-fig2.avif
alt: "After uptake into S. hominis, PepV removes glycine from Cys-Gly-3M3SH and PatB cleaves the remaining conjugate to release 3M3SH."
caption: "Fig. 2 | The multi-step pathway of axillary odor generation. People with the CT or CC genotypes of the ABCC11 gene express a corresponding transporter called ABCC11 that imports SG-3M3SH into secretory vesicles; GGT1 cleaves the terminal glutamyl residue, generating the precursor Cys-Gly-3M3SH; the precursor exits the sweat glands to the skin via apocrine secretion; PepT<sub>Sh</sub> transports the precursor into S. hominis; the precursor is converted into 3M3SH; 3M3SH diffuses out of the cell."
imageBackground: white
---
::

## Limitations of Current Approaches

Existing antiperspirants and deodorants rely on several strategies, each with notable drawbacks.

### Antiperspirants

Using metal salts to block sweat ducts. While this is the most effective and well-established approach at an affordable cost, it may cause skin irritation, pore blockage, damage to clothing, axillary skin darkening and alterations to the skin microbiome. :fn-ref{#10} :fn-ref{#11} :fn-ref{#12}

### Antimicrobials

Using broad-spectrum antibacterial agents to suppress odor-producing bacteria. Although this does not affect sweating, it disrupts the skin microbiome ecology and may eliminate beneficial commensals. :fn-ref{#10} :fn-ref{#13}

### Fragrance Masking

Using perfume to conceal odor. It acts fast without obvious side effects but does not solve the underlying problem. Furthermore, fragrance ingredients are a leading cause of contact allergy, and mixing heavy perfume with natural sweat can also create strong, compound scents. :fn-ref{#14} :fn-ref{#15}

### Methenamine (Hexamethylenetetramine)

Releases formaldehyde to block ducts and kill bacteria. It is strong and long-lasting, effective for 3 to 7 days, and cheap. However, formaldehyde is a strong irritant that can cause redness, itching, stinging and dryness. It is also classified as a Group 1 carcinogen by the IARC. :fn-ref{#16}

### Botulinum Toxin Injection

Blocks nerve signals to sweat glands. It is FDA-approved and effective for 4 to 12 months but is invasive, causing pain and bruising. It is also expensive and requires repeated treatment. :fn-ref{#12} :fn-ref{#17}

### Sweat Gland Surgery

Involves surgical removal of the apocrine sweat gland. It provides a permanent solution for severe hyperhidrosis but is invasive and carries a risk of compensatory sweating. Such methods may pose risks of scarring, infection, and delayed wound healing for pregnant women, for whom safety data are lacking. Other risks include postoperative recurrence and damage to nerve endings. :fn-ref{#12} :fn-ref{#17}

## Our Solution

### Deep-Learning-Guided Protein Design

Our literature review found no existing agents specific to this pathway and suitable for our application. Developing one through conventional wet-lab screening would be prohibitively costly and time-consuming. This challenge led us to explore an alternative approach. Recent advances in deep-learning models have transformed protein engineering; therefore, we applied a range of AI-based tools to guide the design of our proteins.

To make this AI-driven design process systematic and biologically grounded, we introduced a new [**Characterize** stage](/model#why-characterize) before the *DBTL* cycle (C-DBTL framework). In this stage, we combine evidence from literature with structural analysis to understand the mechanism and establish clear design requirements. These requirements guide AI-assisted protein design and computational evaluation, allowing us to assess whether proposed candidates meet the intended structural and functional constraints, connecting biological understanding with computational design.

::content-components-lightbox-image
---
src:
  - https://static.igem.wiki/teams/6133/wiki/project/description/description-project-description-fig3.avif
alt: "Four Characterize substages—problem definition, target definition, mechanistic characterization, and design specification—feed into the Design–Build–Test–Learn cycle."
caption: "Fig. 3 | Schematic of the Characterize stage and its four substages, showing the progression from problem definition to design specification, and finally to the conventional DBTL cycle."
imageBackground: white
---
::

### Our Three Technical Routes

Our project adopts a targeted, multi-layered solution that addresses odor formation using three distinct protein products: the precursor binder, the transporter binder and the modifying enzyme.

#### Precursor binder

The precursor binder selectively binds and sequesters the precursor molecule Cys-Gly-3M3SH directly as the precursor is secreted to the skin surface. Once the binder forms a complex with the precursor, the entire structure becomes too large, making it unrecognizable to PepT<sub>Sh</sub> for transport. Without transport, the precursor cannot enter bacteria, and the subsequent conversion to 3M3SH is effectively prevented. This route reduces the concentration of extracellular free precursor available for uptake.

::content-components-lightbox-image
---
src:
  - https://static.igem.wiki/teams/6133/wiki/project/description/description-project-description-fig4.avif
alt: ""
caption: "Fig. 4 | Illustration of the precursor binder. The precursor binder sequesters Cys-Gly-3M3SH, forming a complex and making it unrecognizable to PepT<sub>Sh</sub>."
imageBackground: white
---
::

#### Transporter binder

Even if some precursor molecules remain unsequestered, their entry into the cell still requires protein transporters. We designed a conformation-selective binder targeting the extracellular regions of PepT<sub>Sh</sub>. The binder is designed to stabilize the inward-facing conformation of the transporter, restricting the conformational change required for transporting the precursor. This route inhibits the cellular uptake of free precursor molecules that remain available.

::content-components-lightbox-image
---
src:
  - https://static.igem.wiki/teams/6133/wiki/project/description/description-project-description-fig5.avif
alt: ""
caption: "Fig. 5 | Illustration of the transporter binder. The transporter binder inhibits the conformational change of PepT<sub>Sh</sub>, reducing its transport ability."
imageBackground: white
---
::

#### Precursor-modifying enzyme

Route three is a precursor-modifying enzyme. Because Cys-Gly-3M3SH is continuously replenished on the skin through apocrine secretion while the total amount of precursor binders is finite, the binder approach may not be effective in the long term. We therefore introduce an enzyme designed to continuously process newly secreted precursor molecules. An engineered cyclodextrin glycosyltransferase (CGTase) transfers an oligosaccharide group onto the hydroxyl group of Cys-Gly-3M3SH, :fn-ref{#18} making it less recognizable to the transporter, reducing PepT<sub>Sh</sub>-mediated transport. This route processes the continuously replenished extracellular precursor pool, offering long-term protection.

::content-components-lightbox-image
---
src:
  - https://static.igem.wiki/teams/6133/wiki/project/description/description-project-description-fig6.avif
alt: ""
caption: "Fig. 6 | Illustration of CGTase. CGTase catalyses the transglycosylation reaction of the precursor and cyclodextrin or an oligosaccharide, making the product unrecognizable to PepT<sub>Sh</sub>."
imageBackground: white
---
::

#### When put together

Each route addresses a different limitation in precursor control. The precursor binder rapidly reduces free precursor available on the skin surface, but its capacity is inherently limited by the finite concentration of available binding sites. The conformation-selective transporter binder provides a second, mechanistically distinct protection by inhibiting bacterial uptake of precursor molecules that remain unsequestered. In parallel, the enzymatic modifier continuously processes newly replenished precursor secreted by apocrine glands. Collectively, these three strategies act on complementary aspects of the same pathway, thereby providing a more robust and sustained reduction in malodor precursor than any single strategy alone.

::content-components-lightbox-image
---
src:
  - https://static.igem.wiki/teams/6133/wiki/project/description/description-project-description-fig7.avif
alt: "Three complementary interventions: a precursor binder sequesters free Cys-Gly-3M3SH, a transporter binder blocks PepTSh-mediated uptake, and CGTase adds a sugar group to the precursor."
caption: "Fig. 7 | Schematic of the combination of our three solutions working together to prevent Cys-Gly-3M3SH uptake."
imageBackground: white
---
::

All three routes are designed to be selective and non-disruptive. By targeting either the precursor molecule or the transporter, we avoid directly killing or inhibiting bacterial growth, while causing no harm to the body. This means our approach preserves the natural composition and function of the axillary microbiome, while specifically reducing the production of malodorous compounds.

### Adding a Pleasant Scent: Terpenoid Esters

Blocking odor is one thing, but we also wanted our product to smell nice—without relying on synthetic perfumes made with chemicals that could potentially irritate sensitive skin and pollute the environment. Synthetic fragrance ingredients are a leading cause of allergic contact dermatitis, and deodorants are among the most common culprit products. :fn-ref{#14} Moreover, synthetic musks—widely used in fragrance formulations—are persistent, bioaccumulative, and toxic to aquatic organisms. So we turned to terpenoid esters: natural fragrance compounds found in plants and flowers, responsible for fresh, floral, and fruity scents. They're biodegradable, skin-friendly, and can be produced sustainably through synthetic biology.

Therefore we engineered *E. coli* strains to make two different terpenoid esters: geranyl butyrate (fruity, floral) and bornyl acetate (woody, camphoraceous). Both will be formulated into our roll-on deodorant alongside the three protein-based active components. :fn-ref{#19}

#### Geranyl Butyrate

We use a two-strain system. GreatBay-SCIE 2025 already constructed *E. coli* with the strain 1 plasmid for making geraniol—the alcohol precursor for geranyl butyrate. For the second strain, we're assembling two modules: one supplies butyryl-CoA, a substrate needed for esterification. The other carries the esterification enzyme (FaAAT2-I303G) along with a CoA-transferase (CaBACT) that activates free short-chain fatty acids (e.g., butyrate) into the corresponding acyl-CoA, providing an additional route for increasing the availability of the acyl donor. Together, they convert geraniol and butyryl-CoA into geranyl butyrate.

::content-components-lightbox-image
---
src:
  - https://static.igem.wiki/teams/6133/wiki/project/description/description-project-description-fig8.avif
alt: "Two-strain geranyl butyrate pathway: strain 1 produces geraniol through the MVA and geraniol synthesis pathways; strain 2 supplies butyryl-CoA and an acyltransferase to form geranyl butyrate."
caption: "Fig. 8 | Metabolic pathways involved in geranyl butyrate synthesis."
imageBackground: white
---
::

#### Bornyl Acetate

For a second scent, we're engineering the production of bornyl acetate. The production strain makes borneol from a modified MVA pathway and borneol synthesis module. A separate esterification strain expressing LiAAT4 (*Lavandula* × *intermedia* alcohol acyltransferase 4) and CaBACT then converts borneol into the acetate ester.

::content-components-lightbox-image
---
src:
  - https://static.igem.wiki/teams/6133/wiki/project/description/description-project-description-fig9.avif
alt: "Two-strain bornyl acetate pathway: strain 1 produces borneol through a modified MVA pathway; strain 2 supplies acetyl-CoA and LiAAT4 to esterify borneol into bornyl acetate."
caption: "Fig. 9 | Metabolic pathways involved in bornyl acetate synthesis."
imageBackground: white
---
::

## Responsible Innovation

Our journey with Expelliodor led us beyond synthetic biology to a social question: when does a natural physiological difference become something that people feel obliged to hide? Across 5 stages and 23 cycles of stakeholder interactions, we explored not only the scientific and technical aspects of underarm odor management, but also the stigma and social pressures surrounding it. These insights challenged us to consider both what our product could achieve and the messages it might reinforce. We responded with [supportive communication](/human-practices/stage-4-optimising-product#cycle-1-second-meeting-with-kleank-evonik), [inclusive and engaging designs](/human-practices/stage-5-expanding-impact#cycle-7-social-science-specialists), and consideration of [diverse needs](/human-practices/stage-5-expanding-impact#cycle-8-inclusive-packaging). This process taught us that responsible innovation means looking beyond technical performance to the values a product communicates and the choices it offers. Looking ahead, we hope to make Expelliodor a **good and responsible product**—one that is not only effective and safe for the skin, but also meets the needs of diverse user groups, is socially responsible, and respects individual choice.

## Reference

1. :ref-fn[Stevens BR, Roesch LFW. Interplay of human ABCC11 transporter gene variants with axillary skin microbiome functional genomics. Sci Rep. 2024;14:28037. doi: [10.1038/s41598-024-78711-w](https://doi.org/10.1038/s41598-024-78711-w).]{#1}

2. :ref-fn[Minhas GS, Bawdon D, Herman R, Rudden M, Stone AP, James AG, et al. Structural basis of malodour precursor transport in the human axilla. Elife. 2018;7:e34995. doi: [10.7554/eLife.34995](https://doi.org/10.7554/eLife.34995).]{#2}

3. :ref-fn[The Good Scents Company. Geranyl butyrate &#91;Internet&#93;. The Good Scents Company; &#91;cited 2026 Oct 12&#93;. Available from: <https://www.thegoodscentscompany.com/data/rw1025351.html>.]{#3}

4. :ref-fn[The Good Scents Company. Bornyl acetate &#91;Internet&#93;. The Good Scents Company; &#91;cited 2026 Oct 12&#93;. Available from: <https://www.thegoodscentscompany.com/data/rw1106081.html>.]{#4}

5. :ref-fn[Rudden M, Herman R, Rose M, Bawdon D, Cox DS, Dodson E, et al. The molecular basis of thioalcohol production in human body odour. Sci Rep. 2020;10:12500. doi: [10.1038/s41598-020-68860-z](https://doi.org/10.1038/s41598-020-68860-z).]{#5}

6. :ref-fn[Phillips KA, Stein DJ. Olfactory reference disorder &#91;Internet&#93;. Merck Manual Professional Edition. Merck & Co., Inc.; 2025 Nov &#91;cited 2026 Jul 5&#93;. Available from: <https://www.merckmanuals.com/professional/psychiatric-disorders/obsessive-compulsive-and-related-disorders/olfactory-reference-disorder>.]{#6}

7. :ref-fn[Yoshiura K, Kinoshita A, Ishida T, Ninokata A, Ishikawa T, Kaname T, et al. A SNP in the ABCC11 gene is the determinant of human earwax type. Nat Genet. 2006;38:324-30. doi: [10.1038/ng1733](https://doi.org/10.1038/ng1733).]{#7}

8. :ref-fn[Baumann T, Bergmann S, Schmidt-Rose T, Max H, Martin A, Enthaler B, et al. Glutathione-conjugated sulfanylalkanols are substrates for ABCC11 and γ-glutamyl transferase 1: a potential new pathway for the formation of odorant precursors in the apocrine sweat gland. Exp Dermatol. 2014;23(4):247-52. doi: [10.1111/exd.12354](https://doi.org/10.1111/exd.12354).]{#8}

9. :ref-fn[Herman R, Kinniment-Williams B, Rudden M, James AG, Wilkinson AJ, Murphy B, et al. Identification of a staphylococcal dipeptidase involved in the production of human body odor. J Biol Chem. 2024;300(12):107928. doi: [10.1016/j.jbc.2024.107928](https://doi.org/10.1016/j.jbc.2024.107928).]{#9}

10. :ref-fn[Teerasumran P, Velliou E, Bai S, Cai Q. Deodorants and antiperspirants: new trends in their active agents and testing methods. Int J Cosmet Sci. 2023;45(4):426-43. doi: [10.1111/ics.12852](https://doi.org/10.1111/ics.12852).]{#10}

11. :ref-fn[Zhang J, Han P, Yang F, Jiang B. Advances in the treatment of axillary bromhidrosis. Skin Res Technol. 2024;30(8):e13895. doi: [10.1111/srt.13895](https://doi.org/10.1111/srt.13895).]{#11}

12. :ref-fn[Mayo Clinic. Hyperhidrosis: diagnosis and treatment &#91;Internet&#93;. Mayo Clinic; 2017 &#91;cited 2026 Oct 5&#93;. Available from: <https://www.mayoclinic.org/diseases-conditions/hyperhidrosis/diagnosis-treatment/drc-20367173>.]{#12}

13. :ref-fn[Aras A, Rizvanoglu SS, Tanriverdi ES, Karaca B, Eryilmaz M. The effects of antiperspirant aluminum chlorohydrate on the development of antibiotic resistance in Staphylococcus epidermidis. Microorganisms. 2023;11(4):948. doi: [10.3390/microorganisms11040948](https://doi.org/10.3390/microorganisms11040948).]{#13}

14. :ref-fn[de Groot AC. Fragrances: contact allergy and other adverse effects. Dermatitis. 2020;31(1):13-35. doi: [10.1097/DER.0000000000000463](https://doi.org/10.1097/DER.0000000000000463).]{#14}

15. :ref-fn[Uter W. Contact allergy to fragrances: current clinical and regulatory trends. Allergol Select. 2017;1(2):190-9. doi: [10.5414/ALX01604E](https://doi.org/10.5414/ALX01604E).]{#15}

16. :ref-fn[Goossens A, Aerts O. Contact allergy to and allergic contact dermatitis from formaldehyde and formaldehyde releasers: a clinical review and update. Contact Dermatitis. 2022;87(1):20-7. doi: [10.1111/cod.14089](https://doi.org/10.1111/cod.14089).]{#16}

17. :ref-fn[Grove GL, Henning MAS, Togsverd-Bo K, DiGiorgio CM, Avram MM, Haedersdal M. Local procedures for axillary hyperhidrosis and osmidrosis: a systematic review of prospective and controlled clinical trials. JEADV Clin Pract. 2024;3(4):972-1004. doi: [10.1002/jvc2.415](https://doi.org/10.1002/jvc2.415).]{#17}

18. :ref-fn[Lim CH, Rasti B, Sulistyo J, Hamid MA. Comprehensive study on transglycosylation of CGTase from various sources. Heliyon. 2021;7(2):e06305. doi: [10.1016/j.heliyon.2021.e06305](https://doi.org/10.1016/j.heliyon.2021.e06305).]{#18}

19. :ref-fn[Yang D, Liang H, Li X, Wang B, Zhang C, Yuan M, et al. A microbial platform for selective biosynthesis of monoterpene esters. Nat Commun. 2026;17:4851. doi: [10.1038/s41467-026-71681-9](https://doi.org/10.1038/s41467-026-71681-9).]{#19}
