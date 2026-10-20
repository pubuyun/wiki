---
title: "Terpenoid Ester"
description: "Two-strain co-culture production and analytical verification of bornyl acetate and geranyl butyrate."
hasReference: false
order: 6
---

## Bornyl Acetate

### Design

According to our previous survey, around one fifth of our potential customers expressed a preference for woody scents in deodorant products. We selected bornyl acetate, a monoterpenyl ester with a woody and camphorous scent. :fn-ref{#3}

::content-components-lightbox-panels
---
src:
  - https://static.igem.wiki/teams/6133/wiki/wetlab/engineering/engineering-terpenoid-ester-fig14a.avif
  - https://static.igem.wiki/teams/6133/wiki/wetlab/engineering/engineering-terpenoid-ester-fig14b.avif
alt:
  - "Strain 1 converts mevalonate-pathway intermediates to borneol, which strain 2 esterifies using LiAAT4 to produce bornyl acetate."
  - ""
caption: "Fig. 14 | Design of the two-strain co-culture system for bornyl acetate production; **(a)** biosynthetic pathway of bornyl acetate; **(b)** plasmid design showing the MVA pathway and borneol synthesis module in strain 1 and the esterification module in strain 2."
imageBackground: "#ffffff"
preserveFigureNumber: true
layout: stack
---

::

Recent research has shown that monoterpenyl esters can be efficiently produced via co-culturing two *E. coli* strains :fn-ref{#5}. In bornyl acetate production, strain one produces the monoterpene alcohol, borneol, through the MVA pathway and a borneol synthesis module, including bornyl pyrophosphate synthase from *Dipterocarpus intricatus*(DiBPPS), a truncated geranyl diphosphate synthase from *Abies grandis* (t86AgGPPS2), and a Nudix hydrolase J from *E. coli* (EcNudJ).

The second strain produces an alcohol acyltransferase from *Lavandula × intermedia*(LiAAT4), catalyzing the esterification of the acyl-CoA and the monoterpene alcohol, and a butyrate acetoacetate CoA-transferase from *Clostridium acetobutylicum*(CaBACT) for activating short-chain fatty acids into their corresponding acyl-CoAs (Fig. 14a).

Both the borneol synthesis module and the esterification module in strain 1 and strain 2 respectively, use pW1 (pET28a-ptac-RiboJ-BsaI) as cloning vector. This vector is derived from pET-28a, with the T7 promoter replaced by Ptac (IPTG-inducible, LacI-regulated) promoter, but the kanamycin resistance marker and pBR322-type origin were retained. A *RiboJ* was inserted downstream of the Ptac promoter, standardizing the 5′ untranslated region (5′ UTR). The pMVA plasmid constructed by GreatBay-China 2018 for high-yield production of IPP and DMAPP was also used, forming a dual-plasmid system in the borneol-synthesis strain (Fig. 14b).

### Build

The DNA fragments were synthesized by CoWin Biotech and assembled into pW1-t86AgGPPS2-DiBPPS-EcNudJ and pW1-LiAAT4-CaBACT using Golden Gate Assembly. The resulting plasmids were transformed into *E. coli* DH5α competent cells, and positive clones were identified by colony PCR (Fig. 15) and further verified by sequencing.

::content-components-lightbox-image
---
src:
  - https://static.igem.wiki/teams/6133/wiki/wetlab/engineering/engineering-terpenoid-ester-fig15.avif
alt:
  - "Colony PCR gel shows products labeled 3899 bp and 3324 bp for the two bornyl acetate pathway constructs."
caption: "Fig. 15 | Colony PCR of pW1-t86AgGPPS2-DiBPPS-EcNudJ and pW1-LiAAT4-CaBACT in DH5α."
imageBackground: "#ffffff"
preserveFigureNumber: true
width: 1109
height: 1280
---

::

The verified pW1-t86AgGPPS2-DiBPPS-EcNudJ plasmid was then transformed into *E. coli* DH5α ΔtnaA competent cells already carrying pMVA, while pW1-LiAAT4-CaBACT was transformed into plasmid-free competent cells of the same strain. Deletion of *tnaA* prevents indole production, thereby reducing undesirable background odor and allowing the fragrance of bornyl acetate to be more readily distinguished.

The two strains were co-cultured at a volume ratio of 15:1 (borneol-producing strain:esterification strain) :fn-ref{#5}. 10% glycerol was supplied as an extra carbon source supporting cell growth and monoterpene synthesis.  Expression was induced by 0.3 mM IPTG, and a dodecane overlay with a final concentration of 10%-20% (v/v) was added to capture bornyl acetate during fermentation. The culture was fermented at  30 °C and 250 rpm for 30 h.

### Test

The production of bornyl acetate was qualitatively confirmed using gas chromatography–mass spectrometry (GC–MS). The mass spectrum of our product sample was compared with the reference spectrum in the spectral library. The characteristic base peak at **m/z 95**, along with other major fragment ions, were consistent with those in the reference spectrum of bornyl acetate (Fig. 16b), supporting the identification of bornyl acetate.

Subsequent GC analysis quantified bornyl acetate production using a standard curve, yielding a concentration of 1.2269 μg/mL (Fig. 16a).

::content-components-lightbox-panels
---
src:
  - https://static.igem.wiki/teams/6133/wiki/wetlab/engineering/engineering-terpenoid-ester-fig16a.avif
  - https://static.igem.wiki/teams/6133/wiki/wetlab/engineering/engineering-terpenoid-ester-fig16b.avif
alt:
  - "Bornyl acetate standard curve: y = 1766412x − 1811188; R² = 0.9992."
  - "Experimental and library spectra share a dominant m/z 95 peak and several matching fragment peaks."
caption: "Fig. 16 | Results of bornyl acetate synthesis. **(a)** Standard curve for bornyl acetate quantification; **(b)** Comparison of the experimental mass spectrum (upper) with the reference spectrum from the spectral library (lower)."
imageBackground: "#ffffff"
preserveFigureNumber: true
---

::

### Learn

The GC–MS results supported the feasibility of producing bornyl acetate through a two-strain co-culture system, demonstrating the applicability of an established co-culture strategy to our fragrance-production module. The  outcomes provided a foundation for further development of our fragrance production.

## Geranyl Butyrate

### Design

Building on the successful production of bornyl acetate and feedback collected through our survey indicating a preference for floral scents among many participants, we sought to explore the biosynthesis of another terpenoid ester, geranyl butyrate, which possesses a floral scent. :fn-ref{#4}

::content-components-lightbox-panels
---
src:
  - https://static.igem.wiki/teams/6133/wiki/wetlab/engineering/engineering-terpenoid-ester-fig17a.avif
  - https://static.igem.wiki/teams/6133/wiki/wetlab/engineering/engineering-terpenoid-ester-fig17b.avif
alt:
  - "Strain 1 produces geraniol; strain 2 supplies butyryl-CoA and FaAAT2 to esterify geraniol into geranyl butyrate."
  - ""
caption: "Fig. 17 | Overview of geranyl butyrate production using a two-strain co-culture system; **(a)** metabolic pathways involved in geranyl butyrate synthesis; **(b)** plasmid construct of the two engineered strains, including the geraniol synthesis modules in strain 1 and the butyryl-CoA biosynthesis and esterification modules in strain 2."
imageBackground: "#ffffff"
preserveFigureNumber: true
layout: stack
---

::

Similar to bornyl acetate synthesis, geranyl butyrate was designed to be produced using a co-culture system consisting of two engineered *E. coli* strains: a geraniol-producing strain and an esterification strain. The geraniol-producing strain developed by GreatBay-SCIE 2025 was used, while a second strain was engineered to convert geraniol into geranyl butyrate.

The esterification strain was designed to harbor two plasmids. The first contained a butyryl-CoA biosynthesis module that converts acetyl-CoA into butyryl-CoA through four enzymes: acetyl-CoA acetyltransferase from *E. coli* (EcatoB), 3-hydroxybutyryl-CoA dehydrogenase (Cahbd) and crotonase (Cacrt) from *Clostridium acetobutylicum*, and trans-enoyl-CoA reductase from *Treponema denticola* (Tdter). The second plasmid contained an esterification module encoding a mutant alcohol acyltransferase 2 from *Fragaria × ananassa* (FaAAT2-I303G) and CaBACT. The I303G mutation was introduced to enhance the enzyme's selectivity for butyryl-CoA over acetyl-CoA, thereby favoring geranyl butyrate formation over geranyl acetate (Fig. 17a) :fn-ref{#5}.

pW1 was used as the expression vector of the esterification module, while the butyryl-CoA biosynthesis module was cloned into a plasmid carrying a p15A origin of replication and a chloramphenicol resistance marker (Fig. 17b).

### Build

The pW1-FaAAT2-I303G-CaBACT plasmid was constructed using Golden Gate Assembly and transformed into *E. coli* DH5α competent cells. Positive clones were identified by colony PCR (Fig. 18) and further confirmed by sequencing. The butyryl-CoA biosynthesis plasmid, pButy1, was synthesized by CoWin Biotech. Both plasmids were sequentially transformed into *E. coli* DH5α ΔtnaA competent cells to establish the esterification strain.

A 1:1 co-culture system consisting of the geraniol-producing strain and the esterification strain was established, and fermentation was carried out under the same conditions as in [Bornyl Acetate production cycle](/engineering/terpenoid-ester#bornyl-acetate).

::content-components-lightbox-image
---
src:
  - https://static.igem.wiki/teams/6133/wiki/wetlab/engineering/engineering-terpenoid-ester-fig18.avif
alt:
  - "Colony PCR gel shows the pW1-FaAAT2-I303G-CaBACT product labeled 3455 bp."
caption: "Fig. 18 | Colony PCR result of *E. coli* DH5α harboring pW1-FaAAT2-I303G-CaBACT."
imageBackground: "#ffffff"
preserveFigureNumber: true
width: 882
height: 1280
---

::

### Test

To evaluate geranyl butyrate production, the fermentation products were analyzed using GC-MS following the same procedure as in the Bornyl Acetate production cycle. The experimental mass spectrum was compared with the reference spectrum in the spectral library. Several characteristic fragment ions, including those at m/z 69, 93, and 121, were observed in both spectra (Fig. 19b).

The concentration of geranyl butyrate was determined to be 2.0116 μg/mL using GC and a standard curve (Fig. 19a).

::content-components-lightbox-panels
---
src:
  - https://static.igem.wiki/teams/6133/wiki/wetlab/engineering/engineering-terpenoid-ester-fig19a.avif
  - https://static.igem.wiki/teams/6133/wiki/wetlab/engineering/engineering-terpenoid-ester-fig19b.avif
alt:
  - "Geranyl butyrate standard curve: y = 1383650x − 56006; R² = 0.9993."
  - "Experimental and library mass spectra share fragment peaks at m/z 69, 93, and 121."
caption: "Fig. 19 | **(a)** Standard curve of geranyl butyrate for determining concentration; **(b)** Comparison of the yielded geranyl butyrate mass spectrum (upper) with the reference spectrum from the spectral library (lower)."
imageBackground: "#ffffff"
preserveFigureNumber: true
---

::

### Learn

The GC-MS results provided evidence for geranyl butyrate production. However, the relatively low product concentrations observed in both the bornyl acetate and geranyl butyrate cycles highlighted the need for further optimization. Adjusting the co-culture conditions, particularly the ratio between the two strains, may help improve production yields.
