---
title: "Abstract/Overview"
description: "Engineering strategies for reducing odor precursor uptake, modifying the precursor, and producing terpenoid fragrances."
hasReference: false
order: 1
banner: https://static.igem.wiki/teams/6133/wiki/general/banners/engineering.avif
bannerPosition: 50% 10%
bannerWidth: 2053
bannerHeight: 1232
bannerMobilePosition: 50% 10%
bannerFit: raised
bannerBackground: "#090909"
---

## Overview

Expelliodor is a targeted deodorant designed to reduce the uptake of the odor precursor *S*‑(1‑hydroxy‑3‑methylhexan‑3‑yl)‑ʟ‑cysteinylglycine (Cys-Gly-3M3SH) into *Staphylococcus hominis* cells via its peptide transporter (peptide transporter from *S. hominis*; *PepT<sub>Sh</sub>*) :fn-ref{#1}. The reduced availability of intracellular Cys-Gly-3M3SH may consequently limit its downstream conversion into 3-methyl-3-sulfanylhexan-1-ol (3M3SH), a volatile sulfur compound that contributes significantly to axillary odor :fn-ref{#2}.

Our product incorporates three protein-based strategies: *de novo* designed precursor binders intended to sequester extracellular Cys-Gly-3M3SH, with the aim of reducing its availability for uptake by PepT<sub>Sh</sub>; *de novo* designed transporter binders intended to restrict conformational transitions of PepT<sub>Sh</sub>, thereby reducing its transport activity; and engineered cyclodextrin glucanotransferase (CGTase) variants derived from *Niallia circulans*, designed to glycosylate the hydroxyl group of Cys-Gly-3M3SH, with the aim of reducing its recognition and uptake by PepT<sub>Sh</sub>. In addition, bornyl acetate and geranyl butyrate are incorporated to provide pleasant woody and floral scents :fn-ref{#3}, :fn-ref{#4}. All protein components were expressed in *Escherichia coli*, while the two terpenoid esters were produced using separate two-strain *E. coli* co-culture systems :fn-ref{#5}.

The precursor binders were optimized using ligand-aware sequence engineering message-passing neural network (*LASErMPNN*) :fn-ref{#6} to improve their binding affinity for the target precursor, while CGTase variants were engineered through *SPURS* :fn-ref{#7}-guided mutagenesis and pairwise mutation compatibility analysis to improve their thermostability.

To evaluate the three strategies under our laboratory conditions, we established a surrogate experimental platform by heterologously expressing PepT<sub>Sh</sub> in *E. coli*. This platform enabled functional assessment of the three approaches without requiring experiments involving *S. hominis*.

Together, these components form a targeted axillary odor management system designed to reduce odor formation without relying on aluminum salts commonly used in conventional antiperspirants or broad-spectrum bacterial elimination. Expelliodor aims to offer a potentially eco-friendly alternative to conventional deodorants while minimizing disruption to the skin microbiota.
