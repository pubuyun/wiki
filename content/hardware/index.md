---
title: Hardware
description: Protein-compatible roll-on packaging, formulation choices, accessible and wearable designs, cost estimates, and future validation plans for Expelliodor.
hasReference: false
order: 1
banner: https://static.igem.wiki/teams/6133/wiki/general/banners/hardware.avif
bannerPosition: 50% 80%
bannerWidth: 2122
bannerHeight: 1191
bannerMobilePosition: 50% 80%
bannerFit: raised
bannerBackground: "#001b3a"
---

<!-- Image URLs below are predicted for a manual upload to drylab/hardware; uploads have not been verified. -->

## Overview

### Motivation

The efficacy of our product depends on three proteins: a precursor binder that sequesters Cys-Gly-3M3SH, a conformation-selective transporter binder that inhibits *PepT<sub>Sh</sub>*, and a CGTase that modifies newly secreted precursors. Each one operates at a molecular level and is correspondingly sensitive to its immediate environment.

::content-components-lightbox-image
---
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/hardware/hardware-index-fig1.avif
alt: "Three approaches block odour formation: CGTase modifies Cys-Gly-3M3SH, a precursor binder captures it, and a transporter binder blocks its uptake through PepTSh in Staphylococcus hominis."
caption: "Fig. 1 | Our solutions to axillary odour."
width: 1280
height: 960
---

::

Conventional plastic deodorant packaging is unsuitable for biological actives for three reasons. First, adsorption: proteins accumulate at the polymer–liquid and air–liquid interfaces, where they unfold and aggregate; this process is self-limiting in bulk but continuous at the interface. Second, leachables: plasticisers, antioxidants, and residual monomers migrate from the polymer into the formulation, altering protein conformation or nucleating aggregation. Third, surface-induced degradation: certain polymers promote unfolding, an effect amplified by the mechanical agitation of daily use. A proteome-scale study demonstrated that protein loss under these conditions is not primarily driven by nucleation in bulk solution, but by destabilisation at material surfaces, followed by aggregation at the sheared air–liquid interface. :fn-ref{#1}

### Analysis

Two categories of constraints define the design approach.

#### Protein-centric requirements

|Requirement|Rationale|
|---|---|
|Minimise polymer–protein and air–liquid interfacial contact|Reduces absorption and aggregation|
|Avoid leachables from packaging material|Prevents conformational change and aggregation seeding|
|Maintain pH at 6.0 ± 0.2|Matches MES buffer optimum and CGTase stability range|
|Protect against thermal and oxidative stress during storage|Preserves activity over shelf life|
|Avoid aerosolisation|Prevents inhalation of untested proteins|

#### User-centric requirements

|Requirement|Rationale|
|---|---|
|Ergonomic grip and one-handed operation|Accommodates limited grip strength and dexterity|
|Tactile and visual identifiability|Supports users with low vision|
|Low application effort|Reduces friction for users with motor impairments|
|Non-sticky, light skin feel|Determined by expert consultation as a key usability factor|
|Recyclability and reduced virgin plastic|Aligns with sustainability commitments|

### Learn

Design decisions were informed by [formulation experts](/human-practices/stage-4-optimising-product#cycle-2-skincare-product-expert-and-cosmetic-formulation-expert), [industry practitioners](/human-practices/stage-4-optimising-product#cycle-1-evonik-and-second-meeting-with-kleank), and published literature. :fn-ref{#1} :fn-ref{#2} :fn-ref{#3} :fn-ref{#4} :fn-ref{#5} :fn-ref{#6} :fn-ref{#7} Formulation experts identified stability, safety, efficacy, and usability as the four properties a cosmetic product must balance, and recommended specific measures: cooling the base before adding proteins, using solubilisers only where necessary, selecting thickeners for light skin feel, and avoiding freeze-dried formats. [Industry consultation](/human-practices/stage-3-developing-solutions#cycle-2-first-meeting-with-kleank) clarified the six functional categories of cosmetic formulations and advised consulting specialists in protein-based cosmetics. Literature established that polypropylene is among the least favourable polymers for protein stability, and that reducing either material contact, air exposure, or agitation confers protection. :fn-ref{#1}

### Design

Our packaging design features a roll-on applicator in a PP bottle. The roll-on form — selected over spray, stick, freeze-dried powder and gel on protein stability, safety, usability and cost — avoids aerosolisation, protects the formulation in a sealed environment, and delivers active ingredients directly to the axillary surface. The PP material is paired with a high-barrier coating, a hydrophilic inner coating and an optimised ball fit to keep the protein stable. The formulation inside is engineered alongside the packaging, with stabilisers, a protein-compatible buffer, and a solubiliser selected for minimum interference with protein activity.

Accessibility was treated as an important part of our product format. Inspired by *Degree Inclusive*, our packaging concept incorporates a press-to-open hinged lid, enhanced grip geometry, tactile opening cues, Braille labelling, etc. :fn-ref{#8} :fn-ref{#9} :fn-ref{#10}

We also designed accessories for users to personalise Expelliodor, including a necklace pendant and a star-shaped keychain. By turning deodorant into something to display rather than hide, we used trendiness deliberately to challenge stigma surrounding underarm odour and encourage people to use deodorant without shame.

Cost is estimated at approximately ¥1.18 per 50 mL bottle at pilot scale, comprising packaging and formulation materials (excluding the terpenoid esters):

Validation of protein stability in the final container, fabric compatibility, and delivery performance is ongoing and reported separately. The rationale, evidence base, and full specifications are documented in the sections that follow.

## Packaging

### Format

The choice of delivery format determines how active proteins reach the skin, how stable they remain, and how users experience the product. We compared five candidate formats against our dual constraints: preserving protein activity and ensuring user accessibility. We analysed each format through both the consumer and producer perspectives, with interview content as support.

#### Spray

##### Pros

- Consumer perspective: Easy one-press application with wide coverage; hygienic and good for shared use; refreshing, fast-drying and non-sticky. Useful scenarios: quick touch-ups after workouts, whole-body use before going out, deodorising shoes and wardrobes. Target user groups: mass users who want fast-dry and no-touch applications.

- Producer perspective: Mature aerosol/pump filling process with high throughput; standardised containers for good shelf display and controllable unit cost.

- Interview support: A [gym manager](/human-practices/stage-2-identifying-unmet-needs#cycle-3-gym-and-hotel-owners) prefers spray-type products as they are convenient, clean and can instantly control odour.

##### Cons

- Consumer perspective: Mist can be inhaled and the strong scent may be irritating to some; needs a few seconds to dry, so it might feel cold in winter; dosage is hard to control, so it is easy to over-spray. Unsuitable scenarios: restricted on flights (aerosol cans), inconvenient for travel.

- Producer perspective: Aerosol cans involve pressure vessels and propellants, raising licensing and safety requirements and requiring large production-line investment; includes valve and pump, so costs more than other formats; shipping is treated as dangerous goods, increasing logistics and compliance costs.

- Interview support: Skincare expert [Ms. Zhu](/human-practices/stage-4-optimising-product#cycle-2-skincare-product-expert-and-cosmetic-formulation-expert) says active protein must absolutely not be made into sprays, as inhalation risk is toxicologically unacceptable and high-ethanol systems denature most complex proteins. Potential customer [Ms. Chen](/human-practices/stage-2-identifying-unmet-needs#cycle-2-people-having-undergone-axillary-surgery) finds spray less effective than roll-on/ointment: spray needs shaved underarms or it sticks to hair instead of skin, and dosage is hard to control.

#### Ointment

##### Pros

- Consumer perspective: Precise application and controlled dosage, ideal for small target areas like the underarms; alcohol-free formulas are gentler on sensitive skin; no powder or water marks after drying. Useful scenarios: home use or before bed. Target user groups: sensitive and dry-skin users and those who prefer traditional application.

- Producer perspective: Simple filling process with a low equipment threshold; formulation stability (preventing separation or clumping) is controllable; tube/jar packaging is low-cost with a long shelf life and no special shipping restrictions.

- Interview support: Potential customer [Ms. Chen](/human-practices/stage-2-identifying-unmet-needs#cycle-2-people-having-undergone-axillary-surgery) personally recommends an ointment form: it is lighter and easier to carry when travelling and passes airport security without liquid checks; she currently uses a Japanese ointment deodorant.

##### Cons

- Consumer perspective: Leaves residue on hands that requires washing; sticky feel and long drying time; white cream can leave marks on dark clothes and is less effective with heavy sweating. Unsuitable scenarios include: not suitable for rushed outings or hot summer days. Unsuitable user groups: users seeking a dry, fresh feel.

- Producer perspective: Filling weight consistency is hard to control and tube-seal leak prevention is a QC (quality control) pain point; cream stability across high and low temperatures needs repeated testing; low unit price combined with fast consumption leaves thin profit margins.

- Interview support: [Formulation experts](/human-practices/stage-4-optimising-product#cycle-2-skincare-product-expert-and-cosmetic-formulation-expert) generally rank solid stick above roll-on and above spray on stability grounds, noting that alcohol-free cream formats suit protein formulas. While no expert explicitly opposes ointment, Mr. Su mentions that stick is more stable for protein activity, which is why the team weighed both.

#### Patch

##### Pros

- Consumer perspective: Stick-and-go application with no skin contact and no drying time, invisible under most clothes and the contents leave no stains or residue. Useful scenarios include: weddings, interviews and long events where reapplication is inconvenient; lightweight for travel. Target user groups: people who wear heavy sweaters, people who care about keeping clothes clean, and sensitive-skin users who avoid contact application.

- Producer perspective: Strong product differentiation with a novel concept that supports a marketing premium; once the multi-layer composite process (absorbent + adhesive + functional layers) is standardised, it can be mass-produced steadily, and single-piece format suits bundle sales with stable repurchase.

- Interview support: Patches are endorsed by a [hotel proprietor](/human-practices/stage-2-identifying-unmet-needs#cycle-3-gym-and-hotel-owners), who commends their hygiene and convenience.

##### Cons

- Consumer perspective: Single-use format requires daily replacement, resulting in high long-term cost; may peel off or shift during intense exercise; a visible outline may show through thin clothes; adhesives may leave marks on fabric and poor breathability can feel stuffy. Unsuitable user groups: environmentally conscious users may reject single-use disposables.

- Producer perspective: Multi-layer composites demand high process standards and large production-line investment; extensive testing is needed for adhesive-fabric compatibility and skin irritation; high material manufacturing and processing costs require premium pricing, along with concept-education and copy-protection efforts.

- Interview support: Experts lean toward liquid or stick forms rather than patches: skincare expert [Ms. Zhu](/human-practices/stage-4-optimising-product#cycle-2-skincare-product-expert-and-cosmetic-formulation-expert) ranks solid stick above roll-on and above spray; [Director Lu (EMC director)](/human-practices/stage-5-expanding-impact#cycle-6-environmental-experts) warns that complex multi-layer packaging adds transport and waste burdens, which work against a single-use patch design.

#### Roll-on

##### Pros

- Consumer perspective: Dries faster than ointment, and carries no inhalation risk. Useful scenarios: daily commute, gym usage and travel (no aerosol restrictions). Suitable user groups: highest mass acceptance, with alcohol-free options for sensitive skin.

- Producer perspective: Mature filling and ball-assembly process with high yield and standardised lines; moderate packaging cost with glass or plastic options; no dangerous-goods shipping restrictions, low logistics cost and good gross margin.

- Interview support: The internal questionnaire shows respondents leaning toward roll-on in both the [domestic survey (486 responses from local Chinese communities)](/human-practices/stage-1-understanding-the-problem#cycle-1-inspiration-and-public-survey) and the [international survey (105 respondents from 19 countries)](/human-practices/stage-5-expanding-impact#cycle-4-overseas-market); [Mr. Stephen Wood](/human-practices/stage-5-expanding-impact#cycle-4-overseas-market) recommends switching from spray to roll-on or other liquid forms for environmental reasons; packaging company expert [Ms. Chen](/human-practices/stage-5-expanding-impact#cycle-5-amcor) confirms roll-on packaging can hold protein formulas with targeted design.

##### Cons

- Consumer perspective: Brief wet feeling on application and requires about 10+ seconds to dry; alcohol formulas can sting after shaving; hygiene concerns when shared as the ball touches the skin directly; inefficient for large areas such as the back. Unsuitable scenarios: slower than spray when instant dryness is needed.

- Producer perspective: Ball-head (ball + neck ring) sealing and leak prevention is a QC challenge and leakage triggers complaints; ball smoothness needs consistency control; glass bottles risk breakage while plastic bottles feel slightly lower in perceived quality.

- Interview support: Potential customer [Ms. Chen](/human-practices/stage-2-identifying-unmet-needs#cycle-2-people-having-undergone-axillary-surgery) notes roll-on is less ideal for heavy sweaters and that a scented roll-on can mix fragrance with sweat odour thus hurting the experience; packaging expert [Ms. Chen](/human-practices/stage-5-expanding-impact#cycle-5-amcor) warns protein adsorbs to container walls (needs low-adsorption substrates or coatings), PP alone has insufficient oxygen barrier (needs high-barrier coating), and custom roll-on moulds cost hundreds of thousands to over a million RMB.

#### Freeze-dried

##### Pros

- Consumer perspective: lightweight and stable at room temperature, with a long shelf life that survives high-temperature transport and storage.

- Producer perspective: freeze-drying protects protein activity without cold-chain and extends shelf life, which is why it was originally considered for logistics in hot climates.

- Interview support: [Mr. Deng (KleanK Medical R&D Director)](/human-practices/stage-3-developing-solutions#cycle-2-first-meeting-with-kleank) suggested considering a freeze-dried product format to improve stability when products are exposed to 50–60°C during summer transport and storage in southern China.

##### Cons

- Consumer perspective: more complex to use and costly, so less appealing to customers.

- Producer perspective: freeze-drying requires large energy inputs to maintain low-temperature vacuum conditions, raising carbon footprint; it also demands higher-grade packaging (aseptic filling, vials, rubber stoppers, aluminium-plastic caps, multi-layer systems), adding transport and waste burdens.

- Interview support: [formulation expert Mr. Su](/human-practices/stage-4-optimising-product#cycle-2-skincare-product-expert-and-cosmetic-formulation-expert) advised against freeze-dried formats as more complex to use and costly, suggesting a gel-based format instead; [EMC director Mr. Lu](/human-practices/stage-5-expanding-impact#cycle-6-environmental-experts) flagged the extra energy and packaging burden of freeze-drying.

#### Soft packaging (Possible add-on for other options)

*A refill system in which the rigid bottle is reused and refilled from a stand-up flexible pouch (as used for shampoo and laundry detergent); the pouch uses far less plastic and is much lighter.*

##### Pros

- Consumer perspective: reusing the rigid bottle cuts repeated packaging waste and per-use cost; the pouch is lighter to carry and store; widely accepted in markets like Japan where pouch design is mature and attractive.

- Producer perspective: dramatically cheaper than rigid packaging — no mould investment (roll-on custom moulds cost hundreds of thousands to over a million RMB); far less plastic per unit; lighter weight lowers production and transport carbon; logistics cost drops sharply since many more pouches fit per truck or train.

- Interview support: [Packaging company expert Ms. Chen](/human-practices/stage-5-expanding-impact#cycle-5-amcor) described the stand-up pouch refill system for shampoo and laundry detergent, noted that soft packaging is significantly more eco-friendly (less plastic, lighter, lower-carbon), and that single-material refill packs are the domestic mainstream in daily chemicals.

##### Cons

- Consumer perspective: on the shelf, soft packaging looks less formal or premium; in China consumers accept refills mainly when rigid and soft packaging sit together on the shelf, so a pouch-only product needs extra design effort to feel trustworthy.

- Producer perspective: PE is the typical soft-packaging material and its barrier performance for protein contents still needs verification; the refill route adds a second package to manage, and protein stability inside thin flexible films is unvalidated.

- Interview support: [Ms. Chen](/human-practices/stage-5-expanding-impact#cycle-5-amcor) addressed the shelf-appearance disadvantage and the Japan-versus-China difference in consumer acceptance of soft packaging.

#### Decision

Spray was opposed by experts due to the toxicologically unacceptable inhalation risk and protein denaturation in high-ethanol systems; ointment offered no stability or user-experience advantage over roll-on; and patch currently lacks solid research support. Freeze-dried powder was eliminated because the format is more complex to use and costly, less appealing to consumers, and freeze-drying adds heavy energy and packaging burdens. Due to these reasons, we chose roll-on as the format that best balances protein activity, usability and cost.

### Material

#### PP

##### Pros

- Consumer perspective: Better texture and heat resistance than HDPE; semi-transparent finish; widely used for caps and roll-on balls (PP ball is the standard configuration), giving a familiar, reliable feel.

- Producer perspective: Lower cost than aluminium with a mature supply chain (Berry Global offers full-PP roll-on bottles); single-material PP enters recycling streams more cleanly; PCR content can be added for sustainability; easy to mould and colour-customise.

- Interview support:  [Packaging company expert Ms. Chen](/human-practices/stage-5-expanding-impact#cycle-5-amcor) confirmed PCR recycled plastics are widely used in cosmetic and personal-care packaging as a valid green credential; [materials scientist Mr. Cheng](/human-practices/stage-5-expanding-impact#cycle-6-environmental-experts) emphasised single-material designs as the recycling trend.

##### Cons

- Consumer perspective: Semi-transparent rather than clear; perceived as slightly less premium than glass or aluminium packaging.

- Producer perspective: Ordinary PP provides very limited oxygen barrier, which is inadequate for protein formulations — a high-barrier coating (e.g. silicon-oxide sputtered layer) is required; protein tends to adsorb onto the inner wall, and PP is among the least favourable plastics for protein stability (unfolding and aggregation under shaking). :fn-ref{#1}

- Interview support: [Ms. Chen](/human-practices/stage-5-expanding-impact#cycle-5-amcor) stated pure single-PP without barrier treatment will not satisfy shelf-life requirements for protein-containing formulas, and any barrier modification must not break single-material recyclability.

#### PE

##### Pros

- Consumer perspective: Tough, impact-resistant and chemically resistant, so it survives drops and daily handling; the standard, familiar material for deodorant and personal-care bottles.

- Producer perspective: Lowest cost among the three options; mature supply chain (Amcor and Berry Global make HDPE roll-on bottles); excellent chemical resistance (acid and alkali) and impact performance; recyclable with PCR support.

- Interview support: [Mr. Cheng](/human-practices/stage-5-expanding-impact#cycle-6-environmental-experts) noted single-material plastics such as those used for toothpaste tubes and milk/cosmetic containers are both cost-optimal and recyclable — the mainstream industry choice for paste-type products.

##### Cons

- Consumer perspective: Opaque rather than clear, so the product colour cannot be shown; perceived as less premium than aluminium.

- Producer perspective: Plastic has very long degradation times (hundreds of years), low recycling efficiency and toxic-gas release when burned; protein adsorption onto inner walls and leachables remain risks; PE is more typical for flexible soft packaging, and for rigid protein roll-on bottles barrier performance still needs verification.

- Interview support: [Mr. Cheng](/human-practices/stage-5-expanding-impact#cycle-6-environmental-experts) described plastics’ main environmental problems as extremely slow degradation, low reuse rates and burning pollution; [Mr. Lu](/human-practices/stage-5-expanding-impact#cycle-6-environmental-experts) noted plastics’ burden concentrates on petroleum extraction and end-of-life microplastic pollution.

#### PET

##### Pros

- Consumer perspective: High transparency and gloss, so the formulation colour can be shown; tough and impact-resistant, surviving drops and daily handling.

- Producer perspective: Widely recyclable and PCR-PET is available; good resistance to oils, fats and dilute acids/alkalis; moderate cost with a mature supply chain (Amcor offers a 50 mL cylindrical PET roll-on bottle).

- Interview support: Packaging company expert [Ms. Chen](/human-practices/stage-5-expanding-impact#cycle-5-amcor) confirmed PCR recycled plastics are widely used in cosmetics and personal care as a valid green credential; our packaging research lists PET as the transparent, glossy choice with the broadest recycling coverage.

##### Cons

- Consumer perspective: None major in daily use, but the material limits transport and storage temperatures because PET begins to deform above 60°C.

- Producer perspective: PET has a glass transition temperature of roughly 70–80°C and deforms above 60°C, which is risky for temperature-sensitive proteins during transport and storage; it is less chemically inert than PP; packaging shelf life is shorter (2–3 years); protein adsorption onto inner walls remains a risk and ordinary PET is not a barrier material for oxygen.

- Interview support: [Mr. Cheng](/human-practices/stage-5-expanding-impact#cycle-6-environmental-experts) singled out poor recyclability and incineration-related pollutants as the principal environmental weaknesses of plastics, while [Mr. Lu](/human-practices/stage-5-expanding-impact#cycle-6-environmental-experts) traced the heaviest burden to upstream oil extraction and the microplastics released once products reach end of life.

#### HDPE

##### Pros

- Consumer perspective: Tough, impact-resistant and chemically resistant, so it survives drops and daily handling; the familiar, durable standard for deodorant bottles.

- Producer perspective: Lowest cost among the options; mature supply chain (Amcor and Berry Global make HDPE roll-on bottles); excellent chemical resistance (acid and alkali, better oxidation resistance than PP); strong impact performance; recyclable with PCR support; 3-5 year packaging shelf life.

- Interview support: [Materials scientist Mr. Cheng](/human-practices/stage-5-expanding-impact#cycle-6-environmental-experts) noted single-material plastics such as toothpaste tubes and milk/cosmetic containers are cost-optimal and recyclable; our packaging research lists HDPE as the most common, cheap and tough choice with the best chemical resistance for deodorants.

##### Cons

- Consumer perspective: Opaque rather than clear, so product colour cannot be shown; perceived as less premium than aluminium.

- Producer perspective: Protein adsorption onto inner walls and leachables remain risks, and HDPE oxygen barrier is still limited for protein protection; plastic degrades extremely slowly and recycling efficiency is low, with burning releasing toxic gas.

- Interview support: [Mr. Cheng](/human-practices/stage-5-expanding-impact#cycle-6-environmental-experts) described plastics’ main environmental problems as very slow degradation, low reuse rates and burning pollution; [Mr. Lu](/human-practices/stage-5-expanding-impact#cycle-6-environmental-experts) noted plastics’ burden concentrates on petroleum extraction and end-of-life microplastic pollution.

### Design features

Key engineering choices for the protein

- Hydrophilic inner coating: reduces protein adsorption onto the inner wall and shrinks contact at the air-liquid interface, the main inactivation route.

- Smaller-radius ball: minimises the air-liquid interface inside the bottle, further limiting protein unfolding and aggregation.

- High-barrier coating (silicon-oxide layer): compensates for ordinary PP’s limited oxygen barrier while keeping single-material recyclability.

- Optimised ball-fit clearance and smooth surface finish: reduces residual liquid trapped in the roll-on assembly, avoiding waste and odour build-up.

- pH-matched substrate and PCR-ready cap: aligns formulation pH with the material’s chemical resistance; PCR content supports the green story.

- Microbial-growth-resistant inner materials: inner materials should also resist microbial growth in the product; this requires professional packaging-technician evaluation.

Trade-offs

- Each coating must be validated for compatibility with the specific protein formula, durability over shelf life and interactions with other additives.

- Barrier modifications must not break the single-material recyclability of the design.

- Custom roll-on moulds are expensive (hundreds of thousands to over a million RMB), so a high-volume run is required to amortise tooling.

- Interview support: Packaging company expert [Ms. Chen](/human-practices/stage-5-expanding-impact#cycle-5-amcor) outlined these engineering requirements for protein roll-on packaging; our packaging research (HDPE/PP/PET comparison and the CEA protein-instability reference) backs the design choices. :fn-ref{#1}

#### Decision

Our choice: **all-PP construction** (PP bottle body + PP roll-on ball + PP cap), with a **hydrophilic inner-wall** treatment and a high-barrier coating, because:

1. A single-material all-PP design enters recycling streams most cleanly — Berry Global already offers full-PP roll-on bottles, matching the single-material recycling trend;

2. A 25 mm PP ball is the industry standard for coverage and feel;

3. The PP cap supports PCR content for sustainability;

4. The hydrophilic inner coating and a smaller-radius ball reduce protein adsorption and shrink the air-liquid interface, the main inactivation route; :fn-ref{#1}

5. Because ordinary PP has limited oxygen barrier, a high-barrier coating (e.g. silicon-oxide layer) is added to protect the protein while keeping single-material recyclability.

### Cost estimation

#### Specifications and price (per 50 mL bottle)

Custom 50 mL roll-on bottle in PP (PCR-ready), round shape, 46 × 46 × 89 mm, 50 mL nominal / 87 mL overflow capacity, 42 mm screw neck, sloped shoulder, high-gloss finish, fully recyclable; 25 mm PP roll-on ball; PP PCR-ready cap. Price ~ RMB 0.95 per bottle from a customised 1688 supplier offer (1039105610481).

#### Suppliers

Customised 1688 offer at ~ RMB 0.95 (see above); global options Berry Global and Amcor (both offer PP and HDPE roll-on bottles); domestic Shangyu Shenrui Packaging for custom roll-on runs. Note: custom roll-on moulds cost from several hundred thousand to over a million RMB, so a high-volume run is required to amortise tooling.

## Ingredients

The formulation of Expelliodor follows the six functional categories identified during our consultation with [KleanK (Yinwei Care)](/human-practices/stage-3-developing-solutions#cycle-2-first-meeting-with-kleank), a Guangzhou-based deodorant manufacturer: active ingredients, carrier ingredients, structural and emulsifying agents, sensory modifiers, fragrances, and preservatives. Each component was selected against two constraints: preserving the activity of our engineered proteins, and maintaining compatibility with the roll-on device and the underarm environment.

### Active ingredients

The active ingredients are the three engineered proteins that constitute the therapeutic mechanism of Expelliodor.

Substrate pair: β-cyclodextrin and maltodextrin (DE 10–20) at 2% serve as the donor/substrate pair for CGTase. Maltodextrin is the primary glycosyl donor, while β-cyclodextrin provides an additional donor source and acts as a trap for volatile odorants. The choice of maltodextrin over higher-cost cyclodextrin alone reflects the finding that at sufficiently high concentrations, maltodextrin can serve as an efficient alternative donor for transglycosylation. :fn-ref{#2}

All three proteins are produced in-house at pilot scale, at an estimated cost of ¥0.106 per kg of finished product.

### Carrier ingredients

Carrier ingredients form the bulk of the formulation and dissolve or disperse the active components.

Glycerin was retained below 5% to avoid the tacky residue that higher concentrations produce, which would be inconsistent with the light skin feel recommended by formulation experts. :fn-ref{#3} Butylene glycol was selected over propylene glycol because the latter carries a higher irritation risk for sensitive skin. :fn-ref{#11} :fn-ref{#12}

### Structural and emulsifying agents

These components provide the physical structure of the gel, maintain pH, and keep the hydrophobic fragrance components dispersed in the aqueous phase.

**Thickener selection:** CMC-Na was excluded because its anionic nature risks electrostatic interaction with the positively charged binder protein. :fn-ref{#13} Xanthan gum was considered but rejected because its stringy texture is less suitable for a leave-on product. HEC was selected as the best balance of protein compatibility and skin feel.

**Solubiliser selection:** The terpene esters are hydrophobic and require a solubiliser to remain dispersed in the aqueous gel. CO40 was chosen over the Tween series after evaluating solubilisation efficiency, oxidation stability, and skin tolerance. Tween 80 was specifically avoided due to its susceptibility to autoxidation, which could generate peroxides capable of oxidising the active proteins. :fn-ref{#14}

### Sensory modifiers

Sensory modifiers improve the user experience and provide soothing benefits to reduce the risk of skin irritation.

A deliberate constraint was the exclusion of terpene-class soothing agents; none of these components are terpenes. The selection prioritises ingredients with established safety profiles and compatibility with the protein actives.

### Fragrances

|Component|Function|Concentration|Rationale|
|---|---|---|---|
|Geranyl butyrate|Fruity, floral fragrance|0.01%/0.02%|Biosynthesised in engineered E. coli; biodegradable; low irritation potential|
|Bornyl acetate|Woody, camphoraceous fragrance|0.01%/0.02%|Biosynthesised in engineered E. coli; biodegradable; low irritation potential|

Both fragrances are produced through engineered microbial fermentation rather than petrochemical synthesis or plant extraction. This approach avoids the environmental persistence and bioaccumulation of synthetic fragrance ingredients such as synthetic musks :fn-ref{#15}, and avoids the land, water, and solvent demands of plant extraction :fn-ref{#16}. The fragrance profile was selected based on our public survey, in which floral/fruity (41.0%) and woody (35.2%) scents were the most preferred.

（图）

Because both compounds are hydrophobic, they require solubilisation by CO40. The concentration of CO40 was set at the minimum effective level for complete solubilisation, so that the solubiliser does not compromise the active proteins.

### Preservative

The preservative system was selected to replace conventional phenoxyethanol-based systems: published patch-test data show that the sensory irritation of preservatives depends on the preservative combination and formulation type rather than a fixed ingredient ranking. :fn-ref{#17} The three-component combination is intended to provide broad-spectrum protection at low individual concentrations and to maintain compatibility with the protein actives; both properties remain to be confirmed by *ISO 11930* challenge testing and formulation stability studies.

Important note on validation: This preservative system has not yet been evaluated through an ISO 11930 challenge test. :fn-ref{#18} We therefore describe its efficacy as anticipated rather than validated. Future work includes challenge testing against standard organisms (*Staphylococcus aureus*, *Escherichia coli*, *Pseudomonas aeruginosa*, *Candida albicans*, *Aspergillus brasiliensis*) to confirm that the system meets preservative efficacy criteria and to provide microbiological evidence supporting determination of the period-after-opening (PAO).

### Cost estimation

|Function|Ingredient|Amount (g/bottle)|Unit price|Cost (¥/bottle)|Cost (US$/bottle)|
|---|---|---|---|---|---|
|Water phase|Deionized water (q.s.)|q.s. to 50 mL|≈0.005 ¥/kg (in-house DI, RO+EDI)|≈0.0002|≈0.00003|
|Moisturising / protection|Glycerin|1.5 g|9.5 ¥/kg|0.014|0.0021|
|Moisturising / protection|1,3-Butylene glycol|1 g|26 ¥/kg|0.026|0.0039|
|Thickener|HEC (hydroxyethyl cellulose)|0.15 g|14 ¥/kg|0.002|0.0003|
|Solubiliser|CO40 (PEG-40 hydrogenated castor oil)|0.5 g|18.5 ¥/kg|0.009|0.0013|
|Protein protection|Trehalose|1 g|6 ¥/kg|0.006|0.0009|
|Protein protection|L-Lysine HCl|0.25 g|8.4 ¥/kg|0.002|0.0003|
|Soothing|Panthenol (Vitamin B5)|0.5 g|40 ¥/kg|0.020|0.0030|
|Soothing|Niacinamide (Vitamin B3)|1 g|35 ¥/kg|0.035|0.0052|
|Soothing|Allantoin|0.05 g|44 ¥/kg|0.002|0.0003|
|Soothing|Oat β-glucan|0.05 g|350 ¥/kg|0.018|0.0027|
|Soothing|Dipotassium glycyrrhizate|0.05 g|600 ¥/kg|0.030|0.0045|
|Preservative|p-Hydroxyacetophenone|0.15 g|158 ¥/kg|0.024|0.0036|
|Preservative|1,2-Hexanediol|0.25 g|30 ¥/kg|0.008|0.0012|
|Preservative|Ethylhexylglycerin|0.025 g|122.5 ¥/kg|0.003|0.00045|
|Buffer|MES buffer|0.2 g (20 mM)|70 ¥/kg|0.014|0.0021|
|Active|CGTase enzyme|0.005 g|300 ¥/kg|0.002|0.0003|
|Active|Binder protein|0.0075 g|380 ¥/kg (self-produced)|0.003|0.00045|
|Active|PepT<sub>Sh</sub> plug protein|0.0025 g|380 ¥/kg (self-produced)|0.001|0.00015|
|Substrate|Maltodextrin DE 10–20|1 g|6 ¥/kg|0.006|0.0009|
|Fragrance|Bornyl acetate (BA, self-made)|0.005–0.01 g|≈3,300 ¥/g|16.5–33|2.46–4.93|
|Fragrance|Geranyl butyrate (GB, self-made)|0.005–0.01 g|≈2,300 ¥/g|11.5–23|1.72–3.43|
|**Total**|**(excluding self-made terpenoid esters)**|—|—|**≈0.22**|**≈0.033**|
|**Total**|**(incl. self-made terpenoid ester, 0.01–0.02%)**|—|—|**≈16.7–33.2 (BA) / ≈11.7–23.2 (GB)**|**≈2.49–4.96 (BA) / ≈1.75–3.46 (GB)**|

Note: Unit prices are raw-material quotes from Chinese suppliers, excluding processing, packaging, QC and logistics; amounts use the lower end of each formulation range; CNY–USD conversion uses the fixed planning rate USD 1 = CNY 6.715.

#### How we measured the cost of the three proteins

All three proteins are dosed by what they must do, not by weight:

- **Precursor binder** — a stoichiometric capture agent (one binder binds one precursor molecule), so its dose follows the measured axillary precursor flux: Cys-Gly-3M3SH is present at 1–22 µM in axillary sweat. :fn-ref{#4} At Mr ≈ 15 kDa, a Kd ≈ 0.5 µM and 90% target capture (≈5× excess), the working dose is 0.15 g/kg. At the self-produced pilot cost of 0.38 ¥/g (40% of OEM), that is 0.057 ¥/kg ≈ 0.003 ¥ per bottle.

- **Transporter binder** — binds the transporter PepT<sub>Sh</sub>; dosed by transporter stoichiometry at 0.05 g/kg × 0.38 ¥/g = 0.019 ¥/kg ≈ 0.001 ¥ per bottle.

- **CGTase** — an enzyme, dosed at 0.01% (0.1 g/kg) at the food-grade mid-price of 300 ¥/kg = 0.03 ¥/kg ≈ 0.002 ¥ per bottle.

#### How we measured the cost of terpenoid esters

Geranyl butyrate and bornyl acetate are produced in two-strain engineered *E. coli* co-cultures, at GC-MS titers of 1.67 mg/L (GB) and 1.17 mg/L (BA). Dividing the ≈3.9 ¥/L fermentation input by those titers gives ≈2,300 ¥/g (GB) and ≈3,300 ¥/g (BA). The lowest effective loading is 0.01–0.02% (0.1–0.2 g/kg): bornyl acetate has an odour threshold of 75 ppb in water :fn-ref{#5} and geranyl butyrate >1 ppm in air :fn-ref{#6}, so 0.01% (100 ppm) already sits ≈1,300× above the BA water-phase threshold and ≥50× above the GB air-phase threshold. At that loading, a self-made fragrance adds ≈¥16.5–33 (BA) / ≈¥11.5–23 (GB) per bottle. We therefore keep lab-made terpenes as mechanism-validation material only; a commercial fragrance module needs either titers 2–3 orders of magnitude higher or food-grade purchased esters.

## Inclusive Design

### Key Values

Guided by our commitment to inclusivity, we incorporated inclusive design principles into Expelliodor’s packaging to accommodate users with visual impairments or limited grip strength and dexterity, who may face difficulties locating, opening, or handling conventional deodorant packaging.

After analysing Degree Inclusive, we identified several accessible design features that could be adapted for Expelliodor, particularly its enhanced grip placement and Braille instructions. :fn-ref{#7} Building on this inspiration, we developed our own packaging design with additional features to address the diverse needs of our target users.

::content-components-lightbox-image
---
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/hardware/hardware-index-fig2.avif
alt: "Expelliodor roll-on bottle with a press-to-open hinged lid, tactile opening point, Braille markers, large lettering, contoured and textured grips, and a rigid rounded support band."
caption: "Fig. 2 | Our inclusive packaging design with accessible features."
width: 3840
height: 2160
---

::

### Key Features

- **Enhanced Grip Placement**: Inspired by Degree Inclusive, the contoured sides of the bottle provide a more secure grip and facilitate single-handed handling.

- **Tactile Marker**: The word “Deodorant” is displayed in Braille to help users with visual impairments identify the product.

- **Rigid, Rounded Band**: Positioned near the bottle opening, this band functions as either a supporting handle or a hook, allowing the bottle to be hung while supporting its full weight for easier storage and location.

- **Press-to-Open Lid**: Designed to open with a single press, reducing the grip strength and hand dexterity needed to access the product and facilitating single-handed use.

- **Hinged Lid**: Permanently attached to the bottle body, the lid allows users to close the bottle with one hand without repositioning a separate cap, while reducing the risk of loss.

- **Tactile Opening Point:** A clearly defined opening point can be identified by touch, helping users with visual impairments locate where to open the bottle.

- **Raised Grip Texture**: Provides additional friction for a more secure grip, particularly for users with limited hand strength or dexterity.

- **Large Lettering**: Makes the product name easier to read for older adults and users with low vision.

## Trendy Design

### Key Value

To make Expelliodor more appealing to young adults, we created two trendy designs: a necklace and a keychain. Through these designs, we hope to make deodorant a natural part of users’ everyday lives, encouraging a more open and accepting attitude towards underarm odour.

**The meaning behind our design:**

**Destigmatising body odour** — Body odour is a normal biological trait. By turning deodorant into a wearable, trendy item, we shift the conversation from shame to confidence — "Expell Your Way".

### Necklace

One of the variants is a deodorant necklace. The roll-on applicator is enclosed in a spherical pendant. The pendant contains a chamber for the deodorant and is attached to a detachable chain, allowing users to wear it as a necklace. Featuring decorative curves and our brand colours, the pendant makes deodorant more visible and fashionable rather than a product that needs to be concealed. Light and easy to carry, it is more convenient for everyday use. Once the deodorant is used up, the pendant can still function as a necklace instead of being discarded, extending the product's life cycle and reducing the pollution caused by waste packaging.

::content-components-lightbox-image
---
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/hardware/hardware-index-fig3.avif
alt: "A spherical Expelliodor pendant on a beaded necklace, shown closed and with its lid open to reveal the roll-on ball."
caption: "Fig. 3 | Deodorant necklace with a detachable spherical pendant."
width: 1736
height: 1867
---

::

### Keychain

The second design features a star-shaped container that holds the deodorant in either roll-on or spray form. Equipped with a detachable keychain, it can be conveniently hung on bags or outfits, acting as both a practical product and a fashionable accessory. The star shape represents individuality and reminds users that underarm odour does not define who they are, reflecting our belief that underarm odour should not define how we see ourselves or judge others.

::content-components-lightbox-image
---
src:
  - https://static.igem.wiki/teams/6133/wiki/drylab/hardware/hardware-index-fig4.avif
alt: ""
caption: "Fig. 4 | Star-shaped deodorant keychain."
width: 2048
height: 2048
---

::

## Future Plans

### Validation roadmap

Our [engineering page reports how the binder binds Cys-Gly-3M3SH](/engineering/precursor-binder#precursor-binder-cycle-1). Here we plan to validate at the **product level**:

1. **Protein-in-bottle stability** — Activity retention of the formulation stored in PP at 25 °C and 40 °C, compared against the same formulation in glass. Measured at 0, 1, 2, 3, and 6 months using the DTNB thiol-release assay (for the precursor binder) and ITC (for binding affinity). Success criterion: ≥90% activity retention at 3 months at 40 °C. If PP fails stability testing, switch to HDPE with hydrophilic coating. PP packaging compatibility is additionally probed under temperature cycling and light exposure.

2. **Stain & residue** — fabric test on light-coloured textiles to confirm the roll-on leaves no residue or yellowing across the 25 mm ball contact track, both fresh and after the film dries;

3. **Functionality** — delivery volume and axillary coverage of the 25 mm ball, consistent dosing per swipe, and seal integrity of the press-to-open hinged lid under transport agitation.

Beyond the device, the validation roadmap extends to the formulation and its journey to the user:

1. **Preservative efficacy** — ISO 11930:2019 challenge test to confirm the p-hydroxyacetophenone / 1,2-hexanediol / ethylhexylglycerin system and provide microbiological evidence supporting PAO determination;

2. **Skin compatibility & safety** — patch-testing for irritation on sensitive skin, plus in silico screening of the de novo proteins for off-target and immunogenicity signals before human contact;

3. **Transport & storage stability** — temperature-stress shelf-life study (the protein formulation must stay below ≈60 °C) and validation of the high-barrier coating over the full shelf life.

### Terpenoid yield optimization

#### Scale-up

- Switch to the M2 medium (12 g/L tryptone, 24 g/L yeast extract, 26.6 g/L KH₂PO₄ + 8 g/L (NH₄)₂HPO₄ phosphate buffer, 10 g/L glycerol, pH 7.0) in place of LB — on this medium the shake-flask coculture reached 2.40 mg/L bornyl acetate (BA), vs 1.17 mg/L in our LB flask: a ~2× gap from medium richness and phosphate buffering. :fn-ref{#19}

- Move to 1-L fed-batch with pH control. In a 1-L fed-batch (pH 7.0, ammonia/phosphoric acid, continuous aeration, ~12 h glycerol feeding), Yang et al. (Nat. Commun. 2026) reached 11.50 g/L linalyl acetate and 3.16 g/L geranyl butyrate (GB) — ~3.6× and ~10× above that paper's own shake-flask cocultures, versus our current mg/L-level shake-flask titers; :fn-ref{#19} fed-batch gains of 100–1000× over shake flasks are documented across terpenoid systems (e.g., amorphadiene, 24 mg/L to 27.4 g/L, Martin 2003 to Tsuruta 2009, a ~1100× cumulative gain from strain and process engineering). :fn-ref{#20}

- Strain-level levers — beyond medium and bioreactor, add an extra acyltransferase (AAT) gene copy and control glycerol feeding: a controlled *E. coli* system reached 10.36 g/L geranyl acetate at 98.5% selectivity (52.78 mM; ACS Sustainable Chem. Eng. 2022) :fn-ref{#21}, and stoichiometric esterification alone lifted geranyl acetate to 4.8 g/L in fed-batch (Microb. Cell Fact. 2019) :fn-ref{#22} — routes worth testing once our esters enter the g/L regime.

- Target: at 100–1000× titers, in-house cost falls to ≈¥2.3–23/g (GB) / ≈¥3.3–33/g (BA), into the range of food-grade commercial esters.

### Sustainability

#### Sustainable refillable soft-pack

We plan to keep the rigid roll-on bottle and offer refills in a lightweight stand-up pouch (the shampoo / laundry-detergent model): the same bottle, a fraction of the plastic. Our packaging research already lists the soft-pack refill as a future-plan option ([Packaging](#packaging)): the pouch avoids the hundreds-of-thousands-to-a-million RMB mould investment of a second rigid design, cuts plastic per use, and slashes transport weight and carbon; single-material refill packs are already the domestic mainstream in daily chemicals.

The market is moving the same way: refillable systems reduce per-unit packaging material by ~78% across a multi-year lifecycle, and refill pouches use ~85% less plastic by weight than new bottles. Dove's first refillable antiperspirant (2026) pairs a durable case with refills in 97% plant-based packaging. For us, refill also reinforces the accessibility story — the bottle with Braille, tactile cues and the press-to-open lid stays in the user's hand.

What must be validated before committing: PE-film barrier performance against our protein formulation (oxygen and leachables), protein activity inside a thin flexible film over time, refill hygiene (pouch-to-bottle workflow), and shelf perception in China, where refills sell best when rigid and soft packs sit side by side. Next steps: screen barrier films, run a protein-in-pouch stability study with the same activity assay as in the validation section, and pilot the refill workflow inside the KleanK user cohort. We will also offer a 5% discount on refill pouches to encourage packaging reuse and drive adoption of the refill hardware.

#### Sustainable formulation

Our formula is largely bio-based — the protein actives, the self-made terpenoid esters and most humectants are produced by fermentation or from plant sources. Five excipients, however, come from petrochemical routes and carry the main environmental caveat of the formulation: **CO40 (PEG-40 hydrogenated castor oil)**, **1,3-butylene glycol**, **1,2-hexanediol**, **ethylhexylglycerin** and **p-hydroxyacetophenone** — together ≈¥0.07 of the ≈¥0.22/bottle formulation cost (≈30%). We plan to address them in three tiers, each with a concrete reason why we cannot switch today.

**Switch to bio-based glycols first (short-term).** Both 1,3-butylene glycol and 1,2-hexanediol exist as 100% bio-based grades made by fermentation (Genomatica bio-1,3-BG :fn-ref{#23}; bio-based 1,3-BG explained :fn-ref{#24}; SEQENS bio-1,2-hexanediol :fn-ref{#25}). Because the molecule is identical, the formulation does not change — it is a supplier swap, not a reformulation.

**Why we do not do it today:** bio-based grades cost several times more than the petrochemical route and are supplied by few vendors with large minimum orders — unrealistic at lab scale, but the first upgrade once we move to commercial formulation.

**Screen plant-based solubilisers to replace CO40 (medium-term).** CO40 is the hardest to replace: PEG-type solubilisers are ethoxylated from petroleum-derived ethylene oxide, are rated persistent by OECD and are flagged for ethylene-oxide / 1,4-dioxane residues (PEG-40 profile :fn-ref{#26}; EWG Skin Deep :fn-ref{#27}). Candidates: polyglyceryl esters and sucrose esters — plant-based, non-ethoxylated and more readily biodegradable.

**Why we do not do it today:** These natural solubilisers may not dissolve our hydrophobic terpenoid esters as efficiently as PEG-40; changing the solubiliser alters fragrance loading, protein stability and skin feel, so the whole formulation would need re-validation (activity retention, cloud point, shelf stability, sensory) — a full reformulation cycle, not a swap.

**Re-evaluate the preservative system (long-term).** p-Hydroxyacetophenone and ethylhexylglycerin could eventually give way to a milder, more natural preservation strategy (e.g. sorbic/benzoic salts or plant-derived actives) — but only after passing the ISO 11930 preservative-efficacy challenge and protein-compatibility testing already in our validation roadmap.

**Why we do not do it today:** A weaker system risks microbial growth and protein degradation; the current trio was chosen for mildness and low yellowing, and any change must be re-validated end to end before human contact.

### User feedback at scale

KleanK / Yinwei Care, a Guangzhou-based deodorant manufacturer, reached out after our social-media introduction and has since shared two rounds of industry insight (formulation categories, stability-test guidance, patent strategy). They have committed to providing ~50,000 customers/testers — and a collaboration route — once our product works, giving us a real-world feedback channel that few student teams have.

Plan: run a staged protocol with KleanK

(i) a small pilot (dozens to hundreds of users) to validate efficacy, skin compatibility, usability and packaging accessibility;

(ii) scale-up toward the 50,000-user cohort with structured surveys plus open responses, reusing the infrastructure from our domestic survey of local Chinese communities (486 responses) and our international survey distributed across 19 countries (105 respondents). Analyse by subgroup (sensitive skin, adolescents, low-vision users, limited grip and dexterity) and feed results back into formulation, packaging and instruction iterations. Privacy stays central: All responses remain confidential and are used only for product development.

### Accessible usage instructions, with Braille

#### Current Guidance

Our roll-on has honest limitations, and how it is used decides how well it works. We will add usage instructions that turn the formulation's shortfalls into best outcomes:

- **Drying** — the roll-on feels wet for ~10+ seconds after application: apply after showering or towelling dry, wait before dressing;

- **Protein care** — do not shake the bottle (agitation accelerates protein unfolding and aggregation at interfaces); keep the cap sealed and store away from prolonged heat and light;

- **Application** — roll-on only, never aerosolised; the formula is designed for the axilla, not for spraying;

- **Sensitive skin** — patch-test on the inner arm first and stop use if irritation occurs; the soothing system (panthenol, niacinamide, allantoin) is there to help;

- **Tone** — instructions are written as supportive, non-stigmatising self-care, never shame-based messaging.

Accessibility: we will extend our inclusive packaging (press-to-open hinged lid, Braille “Deodorant” label, tactile opening cues, large lettering, raised grip) to the instructions themselves — a Braille instruction leaflet, plus a tactile-marked QR code linking to audio and large-print digital versions. This is also forward-looking regulation: China's 2023 Law on Building a Barrier-Free Environment encourages accessible-format labels and instructions for consumer goods, South Korea's MFDS is drafting Braille-label guidelines for cosmetics, and *ISO 19809* sets the accessible-design standard for packaging information.

## Reference

1. Commissariat à l'énergie atomique et aux énergies alternatives (CEA). Instability of proteins in the presence of plastics [Internet]. IRAMIS. 2024 May 6 [cited 2026 Oct 10]. Available from: https://iramis.cea.fr/en/2024/05/instability-of-proteins-in-the-presence-of-plastics/

2. Lim CH, Rasti B, Sulistyo J, Hamid MA. Comprehensive study on transglycosylation of CGTase from various sources. *Heliyon*. 2021;7(2):e06305. doi:10.1016/j.heliyon.2021.e06305.

3. Wells FV. Glycerin as a constituent of cosmetics and toilet preparations. *J Soc Cosmet Chem*. 1958;9(1):19-25. Available from: https://library.scconline.org/is-cacheable/1708620049291/Glycerin-Constituent-Cosmetics-Toilet-Preparations.pdf

4. Troccaz M, Borchard G, Vuilleumier C, Raviot-Derrien S, Niclass Y, Beccucci S, et al. Gender-specific differences between the concentrations of nonvolatile (R)/(S)-3-methyl-3-sulfanylhexan-1-ol and (R)/(S)-3-hydroxy-3-methyl-hexanoic acid odor precursors in axillary secretions. *Chem Senses*. 2009;34(3):203-210. doi:10.1093/chemse/bjn076.

5. Leffingwell & Associates. Odor & flavor detection thresholds in water (in parts per billion) [Internet]. Winter Haven (FL): Leffingwell & Associates; [cited 2026 Oct 18]. Available from: http://www.leffingwell.com/odorthre.htm

6. van Gemert LJ. Odour thresholds: compilations of odour threshold values in air, water and other media. 2nd ed. Utrecht: Oliemans Punter & Partners; 2011.

7. VML. Degree Inclusive [Internet]. [date unknown] [cited 2026 Oct 21]. Available from: https://www.vml.com/work/degree-inclusive

8. Unilever. The world's first deodorant designed for people with disabilities [Internet]. 2021 Apr 27 [cited 2026 Oct 10]. Available from: https://www.unilever.com/news/news-search/2021/the-worlds-first-deodorant-designed-for-people-with-disabilities/

9. Degree. Degree Inclusive — advertising film [Internet]. YouTube. 2021 [cited 2026 Oct 10]. Available from: https://www.youtube.com/watch?v=dUecdeQw_dk

10. Degree. Degree Inclusive — advertising film with audio description [Internet]. YouTube. 2021 [cited 2026 Oct 10]. Available from: https://www.youtube.com/watch?v=mhh9Vx_W350

11. Jacob SE, Scheman A, McGowan MA. Propylene glycol. *Dermatitis*. 2018;29(1):3-5.

12. Final report on the safety assessment of butylene glycol, hexylene glycol, ethoxydiglycol, and dipropylene glycol. *J Am Coll Toxicol*. 1985;4(5):223-248. doi:10.3109/10915818509078692.

13. Xiong W, Ren C, Xu X, Li J, Wang L, Li B. Thermally induced gelation behavior and fractal analysis of ovalbumin–carboxymethylcellulose electrostatic complexes. *Food Hydrocoll*. 2019;91:214-223.

14. Schröter A, Koulov AV, Huwyler J, Mahler HC, Jahn M. 4-Hydroxynonenal is an oxidative degradation product of polysorbate 80. *J Pharm Sci*. 2021;110(6):2524-2530.

15. Tanabe S. Synthetic musks—arising new environmental menace? *Mar Pollut Bull*. 2005;50(10):1025-1026.

16. Chemat F, Abert Vian M, Cravotto G. Green extraction of natural products: concept and principles. *Int J Mol Sci*. 2012;13(7):8615-8627.

17. Lee E, An S, Choi D, Moon S, Chang I. Comparison of objective and sensory skin irritations of several cosmetic preservatives. *Contact Dermatitis*. 2007;56(3):131-136.

18. International Organization for Standardization. ISO 11930:2019. Cosmetics — Microbiology — Evaluation of the antimicrobial protection of a cosmetic product. Geneva: ISO; 2019.

19. Yang D, Liang H, Li X, Wang B, Zhang C, Yuan M, et al. A microbial platform for selective biosynthesis of monoterpene esters. *Nat Commun*. 2026;17:4851. doi:10.1038/s41467-026-71681-9.

20. Tsuruta H, Paddon CJ, Eng D, Lenihan JR, Horning T, Anthony LC, et al. High-level production of amorpha-4,11-diene, a precursor of the antimalarial agent artemisinin, in *Escherichia coli*. *PLoS One*. 2009;4(2):e4489. doi:10.1371/journal.pone.0004489.

21. Wang X, Zhang X, Zhang J, Xiao L, Zhou Y, Zhang Y, et al. Genetic and bioprocess engineering for the selective and high-level production of geranyl acetate in *Escherichia coli*. *ACS Sustain Chem Eng*. 2022;10(9):2881–2889. doi:10.1021/acssuschemeng.1c07336.

22. Chacón MG, Marriott A, Kendrick EG, Styles MQ, Leak DJ. Esterification of geraniol as a strategy for increasing product titre and specificity in engineered *Escherichia coli*. *Microb Cell Fact*. 2019;18:105. doi:10.1186/s12934-019-1130-0.

23. US EPA. Green Chemistry Challenge: 2020 Greener Synthetic Pathways Award — Genomatica bio-1,3-BG (Brontide™) [Internet]. [cited 2026 Oct 21]. Available from: https://19january2025snapshot.epa.gov/greenchemistry/green-chemistry-challenge-2020-greener-synthetic-pathways-award

24. Juventude. Is butylene glycol natural or synthetic? Where it comes from [Internet]. [cited 2026 Oct 21]. Available from: https://www.juventudeskincare.com/blogs/founders-journal/is-butylene-glycol-natural-or-synthetic-where-it-comes-from

25. SEQENS. AdvensProtect Green Range — AdvensProtect 6 Green: 100% biobased 1,2-hexanediol [Internet]. [cited 2026 Oct 21]. Available from: https://www.seqens.com/personal-care/advensprotect-green-range/

26. RAU Cosmetics. PEG-40 hydrogenated castor oil — ingredient profile [Internet]. [cited 2026 Oct 21]. Available from: https://rau.hk/peg-40

27. EWG. PEG-40 hydrogenated castor oil — EWG Skin Deep® ingredient profile [Internet]. [cited 2026 Oct 21]. Available from: https://www.ewg.org/skindeep/ingredients/704597-peg-40-hydrogenated-castor-oil/

> （注：部分内容由豆包工作 AI 生成）
