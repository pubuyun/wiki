---
title: Protocols (New)
description: Experimental protocols for general molecular biology, E. coli cultivation, protein preparation, and activity assays.
banner: https://static.igem.wiki/teams/6133/wiki/general/banners/protocols.avif
bannerPosition: 55% 80%
bannerWidth: 1097
bannerHeight: 658
bannerMobilePosition: 60% 55%
hasReference: false
order: 999
---

## General

### Preparing Antibiotics

::content-components-protocol-table{title="Preparing Antibiotics"}

#materials

- Ampicillin sodium
- Chloramphenicol
- Kanamycin sulfate
- H₂O
- Ethanol

#equipment

- Lab scale
- 50 mL centrifuge tubes
- 1.5 mL microcentrifuge tubes
- 0.22 μm syringe filter
- Syringe

#procedure

- Prepare the corresponding stock solutions in 50 mL centrifuge tubes according to the ratios in the following table:

  | Antibiotic type | Solute mass (g) | Solvent | Solvent volume (mL) | Concentration (mg/mL) |
  | --- | --- | --- | --- | --- |
  | Ampicillin | 2 | H₂O | 20 | 100 |
  | Chloramphenicol | 0.7 | 100 % Ethanol | 20 | 35 |
  | Kanamycin | 1 | H₂O | 20 | 50 |

- Filter the solutions using a 0.22 μm syringe filter and aliquot them into 1.5 mL microcentrifuge tubes.
- Store the solutions at −20 °C.
- Add the antibiotic stock solutions to LB at a 1:1000 ratio (v/v) to achieve the working concentrations.

::

### Preparing LB

**(Solid/Liquid, with/without antibiotics)**

::content-components-protocol-table{title="Preparing LB"}

#materials

- Tryptone
- NaCl
- Yeast extract
- Purified water
- (for solid LB) agar ≥15 g/L, recommended 18–20 g/L
- (optional) antibiotics

#equipment

- Lab scale
- Graduated cylinder
- Beaker
- Media bottle
- Autoclave
- (For antibiotics) Laminar flow hood (LFH)

#procedure

**Preparing sterile basic solid/liquid LB:**
1. Weigh the tryptone, NaCl, and yeast extract according to the following table and add them to a beaker of the desired volume.

   | Chemicals | Mass/g per L |
   | --- | --- |
   | Tryptone | 10 |
   | NaCl | 10 |
   | Yeast extract | 5 |

2. (For solid LB) Weigh 18 g/L of agar and add it to a beaker of the desired volume.
3. Add purified water to approximately 60 % of the desired volume and stir until all solids are fully dissolved. Agar will not fully dissolve, but make sure that no clumping occurs.
4. Transfer the solution to a graduated cylinder and top up with purified water to the desired volume.
5. Transfer the solution to one or more media bottles, ensuring that the liquid volume is less than 2/3 of the bottle volume.
6. Transfer the media bottles containing LB to the autoclave, leaving the caps loose enough to allow air to flow into and out of the bottles.
7. **(Let a teacher do this if possible)** Autoclave at 121 °C for 20 minutes. **Only open the autoclave when temperature is <80 °C AND pressure gauge reaches 0.**

**Adding antibiotics:**
1. Remove the sterile media bottle containing LB from the autoclave, screw the cap shut, and let it cool to below 50 °C (until you can hold it without getting burned).
2. Transfer the media bottle containing LB and the antibiotic stock solution to the laminar flow hood.
3. Calculate the required volume of antibiotic stock solution using $C_1V_1 = C_2V_2$. As the antibiotic stock solution is $1000\times$ the working concentration, add 1 μL of antibiotic stock solution per 1 mL of LB medium. The volume of antibiotic added can be considered negligible compared to the LB medium volume.
4. Transfer the calculated amount of antibiotic stock solution to the media bottle containing LB and mix thoroughly.

::

### SOE PCR

::content-components-protocol-table{title="SOE PCR"}

#materials

- 10 μM oligo pool
- 10 μM forward outermost primer (Primer-First)
- 10 μM reverse outermost primer (Primer-Last)
- Pfu reaction buffer
- dNTP mix
- TransStart® FastPfu DNA Polymerase (TransGen Biotech)
- ddH₂O

*Other high-fidelity polymerases also work, follow their instruction manual for preparing reaction mixtures and setting PCR parameters*{.block .my-2}



#equipment

- PCR tubes
- Ice box
- Thermocycler
- Vortex mixer
- Microcentrifuge

#procedure

1. Prepare 10 μM oligo pool: mix equal volume of each 10 μM synthesized oligo to generate the mixed oligo working solution. If oligo number > 10, split into 2 even-numbered groups.
2. First Round PCR (25 μL Total Reaction Volume)
    1. Reaction mixture setup

        *Prepare on ice; add Pfu polymerase last, take enzyme from -20 °C freezer right before use*{.block .my-2}



        - 5× TransStart® FastPfu Buffer (TransGen Biotech): 5 μL
        - Oligo pool: 1 μL
        - dNTPs: 2 μL
        - TransStart® FastPfu DNA Polymerase (TransGen Biotech): 0.5 μL
        - ddH₂O: 16.5 μL
        - Total Volume: 25 μL

        *Mix gently by flicking the tube, then briefly centrifuge to collect the solution.*{.block .my-2}



    2. Amplification Program
        - Initial denaturation: 95 °C, 5 min
        - Cycling stage:
            - Denaturation: 95 °C, 20 s
            - Annealing: 56 °C, 20 s
            - Extension: 72 °C, 15 s

            *Annealing and extension parameters may be adjusted depending on Tm & length of fragment*{.block .my-2}



            Total 30 cycles
        - Final extension: 72 °C, 5 min
        - Hold: 10 °C indefinitely
3. Second Round PCR (50 μL Total Reaction Volume)
    1. Reaction mixture setup

        *Prepare on ice; add Pfu polymerase last*{.block .my-2}



        - Pfu buffer: 10 μL
        - 10 μM Primer-First: 1 μL
        - 10 μM Primer-Last: 1 μL
        - 1st round PCR product: 2 μL
        - dNTPs: 4 μL
        - Pfu DNA polymerase: 1 μL
        - ddH₂O: 31 μL
        - Total Volume: 50 μL
    2. Amplification Program

        *Use identical thermal cycling program as described in Section 2b*{.block .my-2}



::

### PCR

::content-components-protocol-table{title="PCR"}

#materials

- Template DNA
- Forward primer, 10 μM
- Reverse primer, 10 μM
- 2 × Phanta Max Master Mix (Dye Plus) (Vazyme p525), or other polymerase master mixes
- ddH₂O

#equipment

- PCR tubes
- PCR tube rack
- Ice box and ice
- Microcentrifuge
- Vortex mixer
- Thermocycler

#procedure

**Below is an example using 2 × Phanta Max Master Mix (Dye Plus) (Vazyme p525), please refer to the instruction manual of the exact polymerase master mix being used.**
1. Thaw the 2× Phanta Max Master Mix, forward primer, reverse primer, template DNA, and nuclease-free water on ice.
2. Mix each reagent gently by pipetting. Briefly centrifuge all tubes to collect the liquid at the bottom.
3. Label one PCR tube for each DNA sample. Also prepare:
    - One negative-control tube
    - One positive-control tube, if positive-control DNA is available

4. In a sterile microcentrifuge tube, prepare the PCR master mix. For one 25 μL reaction, add:
    - 12.5 μL 2× Phanta PCR Master Mix
    - 1.0 μL 10 μM forward primer
    - 1.0 μL 10 μM reverse primer
    - 10.5 μL nuclease-free water
5. The total master-mix volume is 24 μL per reaction.
6. Mix the prepared master mix gently by pipetting up and down. Briefly centrifuge the tube.
7. Transfer 24 μL master mix into each labeled PCR tube.
8. Add template or control material to the corresponding tubes:
    - Experimental reaction: add 1.0 μL template DNA
    - Negative control: add 1.0 μL nuclease-free water
    - Positive control: add 1.0 μL positive-control DNA
9. The final volume of each reaction should be 25 μL.
10. Close the PCR tubes securely.
11. Mix each reaction gently by pipetting or lightly tapping the tube. Avoid producing bubbles.
12. Briefly centrifuge the PCR tubes to collect all liquid at the bottom.
13. Place the PCR tubes into the Thermocycler.
14. Program the Thermocycler using the following conditions:
15. Amplification Program
    - Initial denaturation: 98 °C, 30 s
    - Cycling stage:
        - Denaturation: 94 °C, 10 s
        - Annealing: 58 °C, 15 s
        - Extension: 72 °C, 20 s

        *Annealing and extension parameters may be adjusted depending on Tm & length of fragment*{.block .my-2}



        Total 30 cycles
    - Final extension: 72 °C, 1 min
    - Hold: 10 °C indefinitely
16. Start the PCR program.
17. Optional: store the PCR products temporarily at 4 °C or at −20 °C for longer-term storage.

::

### Colony PCR

::content-components-protocol-table{title="Colony PCR"}

#materials

- 2×Flash PCR MasterMix (Dye) (CWBIO, CW3009M), or other polymerase master mixes
- Forward Primer (10 μM)
- Reverse Primer (10 μM)
- ddH₂O
- LB agar plate with single colonies
- Empty LB agar plate of corresponding antibiotic

#equipment

- PCR tube
- Thermocycler
- Ice box
- Laminar flow hood (LFH)

#procedure

**Below is an example using 2×Flash PCR MasterMix (Dye) (CWBIO, CW3009M), please refer to the instruction manual of the exact polymerase master mix being used.**
1. Prepare PCR master mix on ice (25 μL total system per reaction):
12.5 μL 2×Flash Mix + 1 μL Forward primer + 1 μL Reverse primer + 10.5 μL ddH₂O. Label each tube with a unique label.
2. Draw grids on empty agar plate, label each grid to correspond with a PCR tube. This would be the replica plate.
3. Pick independent colonies with sterile pipette tip:
First mark the colony position on the agar plate, then dip the tip into a PCR tube containing reaction mix and swirl gently to elute bacterial cells.
Do not pick overgrown merged colonies or excess agar.
4. Gently dab the leftover liquid on the tip onto the corresponding grid on the replica plate.
5. Controls:
• Negative control: swirl clean pipette tip
• Positive control(optional): use verified recombinant plasmid as template
6. Set up Thermocycler program:
    1. Initial denaturation: 98 °C, 3 min (lyse bacterial cells fully)
    2. 25–30 cycles:
     Denaturation: 95 °C, 30 s
     Annealing: $T_\mathrm{m} - 5\ ^\circ\mathrm{C}$, 15 s
     Extension: 72 °C, 20–30 s per kb of target fragment
    3. Final extension: 72 °C, 5–10 min
    4. Hold at 4 °C indefinitely
7. Incubate the replica plate at 37 °C.
8. Run agarose gel electrophoresis to check band size against DNA Marker:
Correct band size = positive clone; no band / incorrect size = negative clone.
9. If positive clones are present, you could recover the strain from the corresponding grid on the replica plate.

::

### Plasmid extraction

::content-components-protocol-table{title="Plasmid extraction"}

#materials

- TIANprep Rapid Mini Plasmid Kit, or any other plasmid extraction kit, be sure to also have:
    - Silica membrane spin columns
    - collection tubes
- 4ml overnight bacterial culture

#equipment

- Microcentrifuge
- Vortex mixer
- Dry block heater
- Microplate reader
- 1.5ml microcentrifuge tube

#procedure

**Below is an example using TIANprep Rapid Mini Plasmid Kit, please refer to the instruction manual of the exact polymerase master mix being used.**
1. Label a 2 mL microcentrifuge tube with the plasmid name. Transfer 2 mL of overnight bacterial culture into the tube and centrifuge at 12,000 rpm for 1 min. Discard the supernatant. Repeat this step with another 2 mL of overnight bacterial culture using the same tube. After centrifugation, discard the supernatant to retain the bacterial pellet.
2. Add 150 μL of Buffer P1 (**make sure RNase A is already added to Buffer P1 and the color of the solution is red;** do not use if the buffer is pale) to the microcentrifuge tube and vortex until the bacterial pellet is completely resuspended. The suspension should appear uniformly cloudy and red.
3. Add 150 μL of Buffer P2, mix gently by inverting until solution turns fully purple and clear. **Do not vortex!**
4. Add 350 μL of Buffer P5, mix immediately and quickly by inverting. The solution should become yellow and cloudy. Centrifuge at 12000 rpm for 2 min, repeat if free-floating solids are still present.
5. Transfer the supernatant into the Spin Column CP3 (put in a collection tube). Centrifuge for 30 s at 12000 rpm. Discard the eluate and set the spin column back into the collection tube.
6. Wash the Spin Column CP3 by adding 300 µL Buffer PWT **(Make sure that anhydrous ethanol has been added to Buffer PWT)** and centrifuging for 30 s at 12,000 rpm. Discard the eluate, and put the spin column back into the collection tube.
7. Centrifuge for 1 min at 12000 rpm to remove residual wash buffer.
8. Place the spin column in a clean 1.5 mL microcentrifuge tube. (Optional) Heat the column and tube at 42 °C to evaporate residual ethanol.
9. Add 50-100 μl Buffer TB to the center of the spin column. **Do not touch the silica membrane with pipette tip!** Centrifuge for 30 s at 12000 rpm. Remove the spin column and keep the eluate.
10. Measure concentration and purity by measuring absorbance at 260 nm and 280 nm with a microplate reader.
11. Store the remaining solution in -20 °C fridge.

::

### AGE (agarose gel electrophoresis)

::content-components-protocol-table{title="AGE (agarose gel electrophoresis)"}

#materials

- Agarose **(Not agar!)**
- 1XTAE buffer
- SYBR Safe DNA dye
- PCR product
- Loading buffer (If needed)
- DNA marker (with suitable range)

#equipment

- Gel casting tray
- Conical flask
- Microwave
- Electrophoresis tank
- DC power supply
- Gel transilluminator

#procedure

**Preparing the gel**
1. Choose the well size and gel size according to your sample.
2. Measure out ingredients according to the gel size (1 % agarose):
    Large gel: 1 g agarose, 100 mL 1XTAE buffer
    Medium gel: 0.5 g agarose, 50 mL 1XTAE buffer
    Small gel: 0.25 g agarose, 25 mL 1XTAE buffer
    (for very long/short fragments, you could adjust the agarose concentration for better separation)
    Add to conical flask, mix thoroughly
3. Heat the mixture in the microwave at high heat for 30 s and shake to dissolve the agarose. Repeat this step until there is no solid agarose.
4. While the mixture cools down, assemble the gel casting tray according to your well size and gel size.
5. When the mixture stops emitting fumes, add SYBR Safe according to your gel size with micropipette, mix thoroughly while minimizing bubble formation.
    Large gel: 10 μL dye
    Medium gel: 5 μL dye
    Small gel: 2.5 μL dye
6. Immediately pour the mixture to the gel casting tray. Make sure that no bubbles accumulate, especially around the comb.
7. Wait >20 minutes for the gel to solidify.

**Electrophoresis**
1. Remove the gel from the casting tray (you could keep the inner tray on) and place it into the tank, gently shake/tap to dislodge any bubbles from the wells.
2. Add loading buffer to all necessary samples. Some enzymes (e.g. Pfu) have their own recommended buffers. Other buffer mixes (e.g. Flash, Phanta) contains the loading buffer/dye pre-mixed, and doesn't require extra loading buffer.
    Simple way to determine if you need loading buffer:
    If sample is colored (Blue/purple) => most likely no need
    If sample is colorless => needs loading buffer
    Please see the instruction manual of the enzyme/buffer mix for exact requirements
3. Add marker to the leftmost intact well of the gel. Add 8 μL for large wells, and 5 μL for small wells. Pipette gently while the tip is suspended about halfway in the well to prevent the marker from being launched out of the well.
4. Add your samples into the wells with the same caution as adding the marker. Add 5 μL for each small well, and 45 μL for each large well. Take extra caution when adding samples into large wells, as it's very easy to overflow. If you have a lot more wells than samples, it is best to leave one or more well(s) empty as a barrier between different (categories of) samples.
5. (Optional) For medium/large gels (especially with small wells), it is best to add another well with marker in the middle/right for easier comparison.
6. Place the tank lid on and connect it to the DC power supply. Run at 150 V and 250 mA until the marker moves below 2/3 length of the gel. (set time at 20–30 min first)
7. Turn off the power supply, remove the gel from the tank. Use the gel transilluminator to take pictures

::

### Gel extraction

::content-components-protocol-table{title="Gel extraction"}

#materials

- Any gel DNA extraction kit

#equipment

- Microcentrifuge
- Vortex mixer
- Dry block heater (Metal bath)
- 1.5 mL microcentrifuge tubes
- Silica membrane spin columns
- Collection tubes
- Microplate reader
- Lab scale
- Blue light transilluminator
- Scalpel or razor blade

#procedure

**Below is an example using Vazyme FastPure Gel DNA Extraction Mini Kit, please refer to the instruction manual of the exact gel DNA extraction kit being used.**
1. Excise desired DNA band from agarose gel in blue light transilluminator using a razor blade and place it into a 1.5 mL microcentrifuge tube.
2. Measure the mass of the DNA band using a lab scale. (tare the weight of an empty tube)
3. Add buffer GDP in a volume equal to the mass of the excised gel ($0.1\ \mathrm{g} = 100\ \mu\mathrm{L}$); Place the tube in a 53 °C metal bath and wait for 5–10 min to melt the gel completely.
4. Transfer the gel solution into the FastPure DNA Mini Columns-G placed in a collection tube. Centrifuge for 1 min at 12,000 rpm.
5. Retransfer solution in the collection tube to the column and centrifuge for 1 min at 12,000 rpm.
6. Discard the solution in the collection tube; add 300 μL buffer GDP into the column and wait for 1 min. Then centrifuge for 1 min at 12,000 rpm.
7. Discard the solution in the collection tube; add 700 μL buffer GW (with anhydrous ethanol added according to the manual) into the column, and then centrifuge for 1 min at 12,000 rpm.
8. Repeat step 7.
9. Discard the solution in the collection tube and centrifuge for 2 min at 12,000 rpm.
10. Place the column in metal bath to dry for 2-3 min with the lid open; make sure no ethanol is left in the column
11. Discard the collection tube; transfer column to a centrifuge tube (1.5 mL).
12. Add 20–30 μL Elution Buffer into column on the membrane; wait for 2 min and centrifuge for 2 min at 12000 rpm. Discard FastPure DNA Mini Columns-G.
13. Measure concentration and purity by measuring absorbance at 260 nm and 280 nm with a microplate reader.
14. Store the remaining solution in -20 °C fridge.

::

### Gibson Assembly

::content-components-protocol-table{title="Gibson Assembly"}

#materials

- Gibson Mix (2 X Ezmax Universal CloneMix)
- DNA fragments and vectors
- ddH₂O

#equipment

- Ice box
- Thermocycler
- PCR tubes
- Vortex mixer
- Microcentrifuge

#procedure

1. Carry out the following actions in an ice bucket.
2. Calculate the volume of vectors and inserts needed using the following formula:
    $X = 3Y\dfrac{C_{\mathrm{vector}}M_{\mathrm{fragment}}}{C_{\mathrm{fragment}}M_{\mathrm{vector}}}$
3. Follow the following table, add all the components into a PCR tube:

   | Chemicals | Volume (µL) |
   | --- | --- |
   | Gibson mix | 5 |
   | DNA (fragments) | X |
   | Vector | Y |
   | ddH₂O | Up to 10 (µL) |

4. Mix the mixture with gentle pipetting, and collect all the liquid at the bottom of the tube by microcentrifuge for a few seconds.
5. Place the tubes in the Thermocycler and run the following process:

   | Step | Temperature (°C) | Duration (min) |
   | --- | --- | --- |
   | 1 | 37 | 30 |
   | 2 | 4 | hold |

::

### Golden Gate Assembly

::content-components-protocol-table{title="Golden Gate Assembly"}

#materials

- T4 DNA ligase buffer
- Plasmid vector
- Insert DNA fragments
- T4 DNA ligase
- BsaI restriction endonuclease
- ddH₂O

#equipment

- Thermocycler
- Ice box
- PCR tubes

#procedure

1. Set up the reaction mix in a PCR tube according to the table below:

   | Reagents | Volume (µL) |
   | --- | --- |
   | T4 DNA ligase buffer | 2 |
   | Insert DNA fragments | X |
   | Plasmid vector | Y |
   | T4 DNA ligase | 1 |
   | BsaI | 1 |
   | ddH₂O | Up to 20 |
   | Total volume | 20 |

    *Calculate the volume of vectors and inserts needed using the following formula:*{.block .my-2}

    *$X = 3Y\dfrac{C_{\mathrm{vector}}M_{\mathrm{fragment}}}{C_{\mathrm{fragment}}M_{\mathrm{vector}}}$*{.block .my-2}

    *C = concentration*{.block .my-2}

    *M = length of the fragment or plasmid*{.block .my-2}


    *Keep the enzymes on ice while pipetting*{.block .my-2}



2. Place the PCR tubes into the Thermocycler, then run the following program:

   | Step | Temperature (°C) | Duration (min) |
   | --- | --- | --- |
   | 1 | 37 | 5 |
   | 2 | 16 | 5 |

    Repeat steps 1 and 2 for 31 cycles in total.

   | Step | Temperature (°C) | Duration (min) |
   | --- | --- | --- |
   | 3 | 37 | 10 |
   | 4 | 60 | 5 |
   | 5 | 4 | Hold |

::

### DpnI Digestion

::content-components-protocol-table{title="DpnI Digestion"}

#materials

- DpnI restriction endonuclease
- 10x rCutSmart buffer
- DNA sample
- ddH₂O

#equipment

- PCR tubes
- Ice box
- Microcentrifuge
- Thermocycler

#procedure

1. Place the DpnI restriction endonuclease and 10x rCutSmart buffer in an ice box.
2. Add all the components according to the following table into a PCR tube. Keep everything chilled on ice.

   | Chemicals | Volume |
   | --- | --- |
   | DpnI restriction endonuclease | 1 µL |
   | 10x rCutSmart buffer | 5 µL |
   | DNA sample | 1 μg |
   | ddH₂O | Up to 50 µL |

3. Gently mix the reaction by pipetting up and down and microfuge briefly.
4. Place the tubes in the Thermocycler and run the following process.

   | Step | Temperature (°C) | Duration (min) |
   | --- | --- | --- |
   | 1 | 37 | 60 |

::

## *E. coli*

### Cryopreservation

**(Preserving glycerol stocks of bacterial strains)**

::content-components-protocol-table{title="Cryopreservation"}

#materials

- Sterile 50% glycerol
- Bacterial culture

#equipment

- Sterile 1.5 mL microcentrifuge tubes
- Laminar flow hood

#procedure

1. Transfer the sterile 1.5 mL microcentrifuge tubes, 50% glycerol, and bacterial culture to the laminar flow hood.
2. Prepare 3 1.5 mL microcentrifuge tubes for each strain of bacteria.
3. Transfer 300-500 µL of 50% glycerol to each 1.5 mL microcentrifuge tube.
4. Transfer a volume of bacterial culture equal to the volume of 50% glycerol to each 1.5 mL microcentrifuge tube. Make 3 glycerol stocks for each strain.
5. Mix thoroughly, then freeze in a -80°C freezer.

**For other glycerol concentrations, make sure that the final glycerol concentration in the glycerol stock is 20-25%.**

::

### Reviving culture

**(creating new cultures from cryopreserved glycerol stock)**

::content-components-protocol-table{title="Reviving culture"}

#materials

- Glycerol stock
- Liquid LB
- Antibiotic stock solutions
- (optional) LB agar plates

#equipment

- Sterile culture tubes
- Incubator

#procedure

1. Transfer the glycerol stock or existing culture, liquid LB, and culture tubes to the laminar flow hood.
2. Measure out 3-5mL of LB into each culture tube.
3. Add the desired antibiotic at a volume equal to 0.1% of the LB volume to each culture tube.
4. Add glycerol stock at a volume equal to 0.1% of the LB volume to each culture tube.
5. Cap the culture tubes and incubate at 37°C and 220RPM overnight.

::

### Preparing competent *E. coli* using kit

::content-components-protocol-table{title="Preparing competent E. coli using kit"}

#materials

- Culture of *E. coli* with OD600 0.5-0.6 (50mL portions)
- Sangon Biotech Ultra-Competent Cell Preps Kit

#equipment

- Sterile 1.5 mL microcentrifuge tubes
- Centrifuge tubes
- Centrifuge with cooling
- Ice box & ice
- Laminar flow hood (LFH)

#procedure

1. Pre-cool the centrifuge to 4°C with suitable adaptor sleeves for the centrifuge tubes inside.
2. Centrifuge the culture at 4°C, 4500RPM for 5-10 minutes.
3. Transfer the centrifuged culture and ice bath to the laminar flow hood.
4. Decant the supernatant and cool the tubes on ice. **After this step, always keep the *E. coli*on ice when possible.**
5. Add BT buffer A to centrifuge tubes, 16mL for every 50mL culture (1 bottle per tube in this case). **It is recommended to start with adding ~3mL buffer A.**
6. Resuspend the pellet gently with a micropipette. Do not dispense buffer directly onto the center of the pellet. Instead, start from the edges and slowly advance toward the center. Avoid aspirating the pellet with the micropipette.
7. Incubate the resuspended mixture in an ice bath for 15 minutes.
8. Centrifuge the resuspended mixture at 4°C and 4500RPM for 5-10 minutes.
9. Transfer the centrifuged mixture and sterile 1.5 mL microcentrifuge tubes to the laminar flow hood.
10. Decant the supernatant. Add BT buffer B, 4mL for every 50mL culture (1 bottle per tube in this case). Repeat step 6.
11. Transfer the resuspended mixture into sterile 1.5 mL microcentrifuge tubes in 100μL portions.
12. Store the aliquots of the resuspended mixture in the -80°C fridge. BT buffer B already contains glycerol, so there is no need to add extra glycerol.

::

### Transformation & selection plating

**(transforming plasmids into cells & plating on antibiotic agar to select for successfully transformed strains)**

::content-components-protocol-table{title="Transformation & selection plating"}

#materials

- Competent cells
- Plasmid solution
- Liquid LB
- LB+antibiotic agar plates

#equipment

- Laminar flow hood (LFH)
- Dry block heater ("Metal bath")
- Ice box & ice
- Cell spreader
- Incubator

#procedure

1. Thaw the competent cells in the ice box. Keep the competent cells on ice throughout the protocol and avoid directly touching the part of the tube containing liquid.
2. Aliquot the competent cells into 50µL portions in 1.5 mL microcentrifuge tubes.
3. Add 1μL of plasmid solution (or the entire Gibson/Golden Gate assembly product) to the competent cells.
4. Gently tap the 1.5 mL microcentrifuge tube to mix.
5. Incubate in an ice bath for 30 minutes. During this incubation, preheat the dry block heater to 42 °C.
6. Place the competent cells in the dry block heater at 42°C for heat shock.

    *Different competent cells require different heat-shock durations; refer to the table below.*{.block .my-2}



   | *E. coli* strain | Time/s |
   | --- | --- |
   | SHuffle T7 | 30 |
   | BL21(DE3) | 90 |
   | DH5α (from Sangon) | 45 |
   | ZS01 (DH5α ΔtnaA) | 45 |

    **Immediately** return them to the ice bath after this.
7. Incubate in an ice bath for 5 minutes (DH5α requires only 2 minutes in the ice bath).
8. Transfer the competent cells, together with the ice bath, and the liquid LB to the LFH.
9. Add 300 μL of LB to each 1.5 mL microcentrifuge tube. Incubate at 37°C and 220RPM for 1 hour.
10. Transfer the transformed cell culture and LB plates containing the corresponding antibiotic to the LFH.
11. Pipette 50-100μL of culture onto each LB plate and spread evenly with a cell spreader until mostly dry.
12. Seal the Petri dishes (LB plates) with PVDC wrap and incubate at 37°C overnight.

::

### Inoculation

::content-components-protocol-table{title="Inoculation"}

#materials

- LB plates with single colonies
- Liquid LB
- Antibiotic stock solution

#equipment

- Laminar flow hood (LFH)
- Culture tubes
- Shaking incubator

#procedure

1. Transfer the LB plates with single colonies and the antibiotic stock solution to the LFH.
2. Fill multiple culture tubes with 3-5mL of liquid LB and add antibiotic stock solution at a volume equal to 0.1% of the LB volume.
3. Select a single colony from the LB plate and inoculate it into the culture tube.
4. Incubate at 37°C and 220RPM overnight.

::

### Extended inoculation

#### For protein expression

::content-components-protocol-table{title="For protein expression"}

#materials

- Liquid LB
- Culture tubes with inoculated *E. coli*
- corresponding antibiotic stock solution

#equipment

- Laminar flow hood (LFH)
- Conical flask
- Breathable sealing film
- Heat-resistant rubber bands
- Shaking incubator

#procedure

1. Transfer the culture tubes containing inoculated *E. coli* and the antibiotic stock solution to the LFH.
2. Add the antibiotic to conical flasks containing sterilized liquid LB at a volume equal to 0.1% of the LB volume.
3. Inoculate the conical flask with 1–2% (v/v) of the overnight *E. coli* culture.
4. Incubate at 37°C and 220RPM until the OD600 reaches 0.6-0.8 (this may take about 2-3 hours).

::

#### For terpenoid ester production

::content-components-protocol-table{title="For terpenoid ester production"}

#materials

- Liquid LB
- Culture tubes with inoculated *E. coli*
- Corresponding antibiotic stock solution
- 50% glycerol

#equipment

- Laminar flow hood (LFH)
- Conical flask
- Breathable sealing film
- Heat-resistant rubber bands
- Shaking incubator

#procedure

1. Transfer the glycerol, culture tubes containing inoculated *E. coli*, and antibiotic stock solution to the LFH.
2. Add the antibiotic to conical flasks containing sterilized liquid LB at a volume equal to 0.1% of the LB volume.
3. Add glycerol to the conical flask to a final concentration of 10 g/L (1% w/v).
4. Inoculate the conical flask with 1-2% (v/v) of the overnight *E. coli* culture and reseal the flask (more or less culture may be used to reduce or increase the incubation time, respectively).
5. Incubate at 37 °C and 250RPM until the OD600 reaches 2.0.

::

### Induction

::content-components-protocol-table{title="Induction"}

#materials

- Bacterial culture with OD600=0.6~0.8
- 1M IPTG stock solution or 1% ʟ‑arabinose (w/w)

#equipment

- Laminar flow hood (LFH)
- Shaking incubator

#procedure

1. Transfer the IPTG or arabinose stock solution, culture tubes containing inoculated *E. coli*, and antibiotic stock solution to the LFH.
2. Calculate the volume of stock solution needed:
    1. 15 μL IPTG stock per 50mL culture
    2. 50 μL arabinose stock per 50mL culture
3. Transfer the calculated amount of stock solution to each conical flask.
4. Incubate at:
    1. IPTG: 16 °C 220RPM overnight
    2. Arabinose: 30 °C 220RPM overnight

::

### Streaking

::content-components-protocol-table{title="Streaking"}

#materials

1. LB agar plates without/with appropriate antibiotic
2. Glycerol stock of required strain

#equipment

1. Laminar flow hood (LFH)

#procedure

Numbered directions refer to Fig. 1.
1. Transfer LB agar plates and the glycerol stock into the LFH
2. Transfer 2.5 μL of glycerol stock to the pale red circle using a micropipette.
3. Using the same pipette, gently streak the drop of glycerol stock in the direction indicated by 1. Do not streak toward the start of the stroke or damage the agar.
4. Repeat step 2 with direction as indicated by 2, 3, 4.
    - If the glycerol stock is of good quality (e.g., purchased directly), use a new pipette tip for every set of strokes: 1 (swap) 2 (swap) 3 (swap) 4 5.
    - Otherwise, use a new pipette tip for every 2 sets of strokes: 1 2 (swap) 3 4 5.

:::content-components-lightbox-image
---
src:
  - https://static.igem.wiki/teams/6133/wiki/wetlab/protocols/protocols-streaking-fig1.avif
alt:
  - Agar plate with a pale red inoculation spot at the lower left. Arrow groups 1 through 4 run around the plate in sequence; stroke 5 zigzags into the center.
caption: 'Fig. 1 | Streaking guide. Numbers 1–5 correspond to the stroke directions described in the procedure.'
---

:::

::

### Terpenoid ester co-culture

::content-components-protocol-table{title="Terpenoid ester co-culture"}

#materials

- 1M IPTG stock solution
- Dodecane
- Bacterial cultures from **Extended inoculation for terpenoid ester production**
    - Geraniol synthesis strain culture
    - Geraniol esterification strain culture
    - Borneol synthesis strain culture
    - Borneol esterification strain culture

#equipment

- Sterile conical flask
- Laminar flow hood (LFH)
- Breathable sealing film
- Heat-resistant rubber bands
- Shaking incubator

#procedure

1. Transfer IPTG stock solution, dodecane, and bacterial cultures to the LFH.
2. To an empty sterile conical flask add Terpene synthesis strain (strain1) culture and Esterification strain (strain2) culture according to the following table:
    (the total volume should not exceed 1/3 of the conical flask's capacity)

   | Terpenoid ester | Strain1:Strain2 volume ratio |
   | --- | --- |
   | Bornyl acetate | 15:1 |
   | Geranyl butyrate | 1:1 |

3. If the OD600 of strain1 and strain2 differs significantly, the more concentrated bacteria culture should first be diluted with sterile LB+10g/L glycerol.
4. Calculate the volume of IPTG stock needed to achieve 0.3mM final concentration. (15 μL for a 50mL culture)
5. Add dodecane to the conical flask to a final concentration of 10%-20% (v/v).
6. Incubate the reaction at 30 °C 250 rpm for 30 h.

::

## Protein

### Sonication

**(Using ultrasonic probe to lyse cells)**

::content-components-protocol-table{title="Sonication"}

#materials

- Bacterial culture
- 20mM  tris(hydroxymethyl)aminomethane-Hydrochloric Acid  (Tris-HCl) buffer (pH 8.0)

#equipment

- 50mL centrifuge tubes
- Digital scale
- Centrifuge
- Sonicator

#procedure

1. Centrifuge the bacterial culture at 7500 rpm for 15 min at 4°C.
2. Resuspend the pellet in 10 mL of 20mM Tris-HCl buffer.
3. Clean the sonicator probe using 75% ethanol.
4. Sonicate the bacterial suspension at 60 W with 3 s on / 6 s off cycles at 4 °C, keeping the centrifuge tube in an ice-water mixture throughout the process, until the lysate becomes mostly transparent and the cloudiness disappears.
5. Centrifuge the sonicated lysate at 9000 rpm for 10 min at 4 °C.
6. Transfer the supernatant to a separate labeled 50 mL centrifuge tube and resuspend the pellet in 10 mL of 20 mM Tris-HCl buffer.

::

### SDS-PAGE

::content-components-protocol-table{title="SDS-PAGE"}

#materials

- 5x loading buffer
- 5x SDS loading buffer
- Staining buffer
- Fast SDS-PAGE staining buffer (Feto)
- PAGE Gel Fast Preparation Kit (15%) [Epizyme Biotech, China]
    - Upper gel solution
    - Upper gel buffer
    - Lower gel solution
    - Lower gel buffer
- ddH₂O

#equipment

- Spacer plate
- Short plate
- Gel casting stand
- Gel casting frame
- Gel comb
- Clamping Frame
- Buffer Dam
- Electrode assembly
- Electrophoresis tank
- DC power supply
- Thermocycler
- Vortex mixer

#procedure

**Buffer Preparation**
1. Mix 100 mL of 10× Tris-Glycine-SDS Running Buffer with 900 mL of distilled water to obtain 1× Tris-Glycine-SDS Running Buffer.

**Gel Preparation**
2. Clean and dry the short plate and spacer plate.
3. Assemble the glass plates in the gel casting frame and secure the frame onto the casting stand.
4. Fill the gap between the two plates with water and leave for 5 minutes to check for leakage.
5. If no leakage is observed, discard the water.
6. Prepare the gel solution according to the following table:

   | Thickness/mm | Upper gel solution+upper gel buffer (mL) | Lower gel solution+lower gel buffer (mL) |
   | --- | --- | --- |
   | 1.00 | 0.75 each | 2.7 each |

7. Just before adding the prepared gel solutions to the gel casting, add 60 μL of modified polymerization catalyst and mix gently to avoid introducing air bubbles.
8. Load the prepared lower gel solution using a 1000 μL micropipette until the surface is about 1 cm below the bottom of the comb.
9. Carefully overlay with pure water and leave the gel for 15–30 min to polymerize.
10. Remove the water and add the prepared upper gel solution.
11. Insert the comb gently and wait for 15–30 min for the stacking gel to polymerize.
    If the assembled gel is not used immediately, do not remove the comb and seal the cassette bottom with parafilm, place it in a seal bag and submerge it completely with 1× Tris-Glycine-SDS Running Buffer. Store at 4 °C.
12. Place the gel cassette into the electrode assembly, with the shorter glass plate facing inward.
13. Secure the gel cassette using the clamping frame, ensuring that the glass plates are properly positioned against the sealing gasket.
14. Use a buffer dam as a place holder on the other side of the electrode assembly if only one gel is assembled.
15. Place the assembled electrode unit into the electrophoresis tank.
16. Add 1× SDS-PAGE running buffer to the inner chamber until the sample wells are fully submerged, fill the outer chamber with running buffer to the level indicated on the electrophoresis tank, and leave for 5 minutes to check for leakage.
    The inner buffer must be fresh, while the outer buffer can be reused.
17. If no leakage occur, carefully remove the comb.

**Sample Preparation**
18. Mix the protein sample with 5x SDS loading buffer and heat at 98 °C for 5–10 minutes to fully denature the proteins.
19. Load the prepared samples and pre-stained marker into the wells, avoiding overflow or air bubbles.

**Electrophoresis**
20. Run the stacking gel at 80 V constant voltage, then switch to 120 V constant voltage once the bromophenol blue enters the separating gel, until the dye front reaches the bottom of the gel.

**Staining and Destaining**
21. After electrophoresis, place the gel in a staining tray.
22. Add sufficient Fast SDS-PAGE staining buffer solution to cover the gel and incubate on an orbital shaker at room temperature with gentle shaking for approximately 1 hour.
23. Discard the staining solution, add ddH₂O, and change it several times until the background is clear and the bands are distinct.
24. Transfer gel onto a white background and image the gel using a gel documentation system.
25. Compare the sample bands with the protein marker to estimate their molecular weights.

::

### DTNB Ellman's Assay

#### GSH standard curve

::content-components-protocol-table{title="GSH standard curve"}

#materials

- DTNB Ellman’s Reagent Solution (from Beyotime S0138, prepared fresh: 1:35 DTNB stock : Assay Buffer)
- Assay Buffer (from Beyotime kit)
- 8 mM GSH stock solution

#equipment

- Vortex mixer
- 96-well plate
- Microplate reader

#procedure

1. Prepare GSH standards at concentrations of 0, 0.125, 0.25, 0.5, 1, 2, and 4 mM through serial dilution with Assay Buffer, as summarized in the following table:

   | GSH concentration (mM) | GSH solution (µL) | Assay Buffer (µL) |
   | --- | --- | --- |
   | 4 | 200 (8 mM stock) | 200 |
   | 2 | 200 (4 mM) | 200 |
   | 1 | 200 (2 mM) | 200 |
   | 0.5 | 200 (1 mM) | 200 |
   | 0.25 | 200 (0.5 mM) | 200 |
   | 0.125 | 200 (0.25 mM) | 200 |
   | 0 | 0 | 200 |

2. Add 20 µL of each GSH standard and 180 µL of Ellman's Reagent Solution to a 96-well plate. Include three technical replicates per concentration.
3. Incubate at room temperature (20–25°C) for 15 minutes.
4. Measure absorbance at 412 nm using a microplate reader.
5. Plot absorbance against GSH concentration to generate a standard curve. Use the resulting calibration equation to determine free thiol concentrations in experimental samples.

::

#### PepT<sub>Sh</sub> activity assay

::content-components-protocol-table{title="PepTSh activity assay"}

#materials

- Cys‑Gly‑3M3SH 10mM stock solution
- DTNB Ellman’s Reagent Solution (from Beyotime S0138, prepared fresh: 1:35 DTNB stock : Assay Buffer)
- Assay Buffer (from Beyotime kit)
- *E. coli*BL21 resting cells with PepT<sub>Sh</sub> expressed
- 1x  M9 salt solution (6 g/L Na2HPO4, 3 g/L KH2PO4, 0.5 g/L NaCl)

#equipment

- 96‑well microplate
- Centrifuge (sealed tubes, low speed)
- Microplate reader (412 nm)
- 1.5 mL microcentrifuge tube
- Incubator

#procedure

1. Harvest *E. coli*PepT<sub>Sh</sub> resting cells by centrifugation at 3500 rpm 10 min.
2. Resuspend the cells with M9 salts, to OD650 = 5.
3. To a 1.5 mL microcentrifuge tube, add the following components:

   | chemical | Sample | Control (substrate only) | Control (cell only) | Negative control |
   | --- | --- | --- | --- | --- |
   | Cys-Gly-3M3SH | 40 µL | 40 µL | 0 µL | 40 µL |
   | PepT<sub>Sh</sub> resting cells | 160 µL | 0 µL | 160 µL | 0 µL |
   | Empty vector resting cells | 0 µL | 0 µL | 0 µL | 160 µL |

*Total volume of mixture should be 200µL, replenish volume of controls with the solution the main ingredient is dissolved in, e.g. ddH2O for controls without S-Cys-Gly-3M3SH, M9 salt for controls without E. coli resting cells.*{.block .my-2}



4. Incubate the reactions at 37 °C for 1h.
5. Centrifuge at 4 °C 10000 rpm for 10 min,
6. To a 96‑well microplate, add the following components:

   | Chemicals | Sample / controls | Blank control |
   | --- | --- | --- |
   | Ellman's reagent solution | 180 µL | 180 µL |
   | Reaction supernatant | 20 µL | 0 µL |
   | Assay buffer | 0 µL | 20 µL |

    Mix by pipetting up and down and incubate at room temperature for 15 min  to complete color development.
7. Measure absorbance at 412 nm using microplate reader.
8. Data Analysis
    - Calculate mean A412 and SD for each condition (uncorrected&blank-corrected) from three replicates.
    - ΔA\_blank-corrected = A\_uncorrected − A\_blank
    - ΔA\_net = ΔA\_(cells + substrate) − ΔA\_(cells only) − ΔA\_(substrate only)
        - (if used uncorrected data, remember to add A\_blank)
    - GSH-equivalent thiol concentration:
        - C = (ΔA\_net − b) / k
    - Concentration SD (standard deviation):
        - SD\_C = SD\_(ΔA\_net) / \|k\|
    - Report results as mean ± SD, n = 3.

::

#### Precursor binders activity assay

::content-components-protocol-table{title="Precursor binders activity assay"}

#materials

- Cys‑Gly‑3M3SH 10mM stock solution
- DTNB Ellman’s Reagent Solution (from Beyotime S0138, prepared fresh: 1:35 DTNB stock : Assay Buffer)
- Assay Buffer (from Beyotime kit)
- *E. coli*BL21 resting cells with PepT<sub>Sh</sub> expressed
- Protein binder solution
- 1x Phosphate Buffered Saline (0.2 g/L KH2PO4, 0.2 g/L KCl, 1.15 g/L Na2HPO4, 8.5 g/L NaCl)
- 1x  M9 salt solution (6 g/L Na2HPO4, 3 g/L KH2PO4, 0.5 g/L NaCl)

#equipment

- 96‑well microplate
- Centrifuge (sealed tubes, low speed)
- Microplate reader (412 nm)
- 1.5 mL microcentrifuge tube
- Incubator

#procedure

1. Harvest *E. coli*PepT<sub>Sh</sub> resting cells by centrifugation at 3500 rpm 10 min. Discard the supernatant and keep the pellet.
2. Resuspend the cells with M9 salt solution to OD650 = 5.
3. Dilute the binders to ensure that the concentrations of all the binders are approximately the same. (e.g. 0.3 mg/ml)
4. **(optional)** For different molar ratios of CG3M3SH to precursor binder (assuming 20 kDa MW, 0.3 mg/mL), **dilute the 10mM CG3M3SH first to 1mM (e.g. 100 μL 10mM CG3M3SH + 900 μL water). Use this as the stock solution for further dilution.**

   | Desired final concentration | Stock solution | Water |
   | --- | --- | --- |
   | 10x (350 µM) | 70 µL | 130 µL |
   | 5x (175 µM) | 35 µL | 165 µL |
   | 2x (70 µM) | 14 µL | 186 µL |
   | 1x (35 µM) | 7 µL | 193 µL |

5. To a 1.5 mL microcentrifuge tube, add the following components:

   | chemical | Sample | Negative control |
   | --- | --- | --- |
   | Binders | 140 µL | 0 µL |
   | Cys-Gly-3M3SH solution | 60 µL | 60 µL |
   | Harvested *E. coli* PepT<sub>Sh</sub> resting cells | 100 µL | 100 µL |
   | 1x Phosphate Buffered Saline | 0 µL | 140 µL |

6. Incubate the reactions at 37 °C for 1 h.
7. Centrifuge at 4 °C 10000 rpm for 10 min.
8. To a 96‑well microplate, add the following components:

   | Chemicals | Sample/ Negative control | Blank control |
   | --- | --- | --- |
   | Ellman's reagent solution | 180 µL | 180 µL |
   | Reaction supernatant | 20 µL | 0 µL |
   | Assay buffer | 0 µL | 20 µL |

    Mix by pipetting up and down and incubate at room temperature for 15 min to complete color development.
9. Measure absorbance at 412 nm using microplate reader.

::

#### Transporter binder activity assay (outdated)

Note: Our PepT<sub>Sh</sub> binders are too bulky to enter the cell wall of Gram-negative bacteria, so we have scrapped this protocol. To test PepT<sub>Sh</sub> binder activity, use the newer version below.

::content-components-protocol-table{title="Transporter binder activity assay (outdated)"}

#materials

- Cys‑Gly‑3M3SH stock solution 10mM
- DTNB Ellman’s Reagent Solution (from Beyotime S0138, prepared fresh: 1:35 DTNB stock : Assay Buffer)
- Assay Buffer (from Beyotime kit)
- *E.coli BL21 resting cells with PepT<sub>Sh</sub> expressed*
- PepT<sub>Sh</sub> plug solution
- 1x Phosphate Buffered Saline (0.2 g/L KH2PO4, 0.2 g/L KCl, 1.15 g/L Na2HPO4, 8.5 g/L NaCl)
- 1x  M9 salt solution (6 g/L Na2HPO4, 3 g/L KH2PO4, 0.5 g/L NaCl)

#equipment

- 96‑well microplate
- Centrifuge (sealed tubes, low speed)
- Microplate reader (412 nm)
- 1.5 mL microcentrifuge tube
- Incubator

#procedure

1. Harvest *E. coli*PepT<sub>Sh</sub> resting cells by centrifugation at 3500 rpm 10 min.
2. Resuspend the cells with M9 salt solution to OD650 = 5.
3. Dilute the PepT<sub>Sh</sub> binders to ensure that the concentrations of all the PepT<sub>Sh</sub> binders are approximately the same.
4. To a 1.5 mL microcentrifuge tube, add the following components:

   | chemical | Sample | Negative control |
   | --- | --- | --- |
   | PepT<sub>Sh</sub> binders | 140 µL | 0 µL |
   | Cys-Gly-3M3SH solution | 60 µL | 60 µL |
   | Harvested *E. coli* PepT<sub>Sh</sub> resting cells | 100 µL | 100 µL |
   | 1x Phosphate Buffered Saline | 0 µL | 140 µL |

5. Incubate the reactions at 37 °C for 1 h.
6. Centrifuge at 4 °C 10000 rpm for 10 min.
7. To a 96‑well microplate, add the following components:

   | Chemicals | Sample/ Negative control | Blank control |
   | --- | --- | --- |
   | Ellman's reagent solution | 180 µL | 180 µL |
   | Reaction supernatant | 20 µL | 0 µL |
   | Assay buffer | 0 µL | 20 µL |

    Mix by pipetting up and down and incubate at room temperature for 15 min to complete color development.
8. Measure absorbance at 412 nm using microplate reader.

::

#### Transporter binder activity assay (via DsbA)

Note: Here, PepT<sub>Sh</sub> binders are joined with DsbA signal peptide to transport it from the cytoplasm to the periplasmic space in order to bypass the cell wall. PepT<sub>Sh</sub> binders only bind to the extracellular domain of PepT<sub>Sh</sub>, so PepT<sub>Sh</sub> binders within the cell membrane should not interfere with the results.

::content-components-protocol-table{title="Transporter binder activity assay (via DsbA)"}

#materials

- Standard Cys‑Gly‑3M3SH substrate solution 10mM
- DTNB Ellman’s Reagent Solution (from Beyotime S0138, prepared fresh: 1:35 DTNB stock : Assay Buffer)
- Assay Buffer (from Beyotime kit)
- *E. coli* BL21 resting cells with PepT<sub>Sh</sub> and DsbA-TB1~5 expressed
- *E. coli* BL21 resting cells with only PepT<sub>Sh</sub> expressed
- 1x  M9 salt solution (6 g/L Na2HPO4, 3 g/L KH2PO4, 0.5 g/L NaCl)

#equipment

- 96‑well microplate
- Centrifuge (sealed tubes, low speed)
- Microplate reader (412 nm)
- 1.5 mL microcentrifuge tube
- Incubator

#procedure

1. Harvest *E. coli*PepT<sub>Sh</sub> + DsbA-TB1~5 and *E. coli*PepT<sub>Sh</sub> resting cells by centrifugation at 3500 rpm 10 min .
2. Resuspend the cells with M9 salt solution to OD650 = 5.
3. To a 1.5 mL microcentrifuge tube, add the following components:

   | chemical | Sample | Negative control |
   | --- | --- | --- |
   | Cys-Gly-3M3SH solution | 40 µL | 40 µL |
   | Harvested *E. coli* PepT<sub>Sh</sub> + DsbA-TB1~5 resting cells | 160 µL | 0µL |
   | Harvested *E. coli* PepT<sub>Sh</sub> resting cells | 0 µL | 160 µL |

4. Incubate the reactions at 37 °C for 1h.
5. Centrifuge at 4 °C 10,000 rpm for 10 min.
6. To a 96‑well microplate, add the following components:

   | Chemicals | Sample/ Negative control | Blank control |
   | --- | --- | --- |
   | Ellman's reagent solution | 180 µL | 180 µL |
   | Reaction supernatant | 20 µL | 0 µL |
   | Assay buffer | 0 µL | 20 µL |

    Mix by pipetting up and down and incubate at room temperature for 15 min to complete color development.
7. Measure absorbance at 412 nm using microplate reader.

::

#### CGTase activity assay

::content-components-protocol-table{title="CGTase activity assay"}

#materials

- Cys‑Gly‑3M3SH stock solution 10 mM
- DTNB Ellman’s Reagent Solution (from Beyotime S0138, prepared fresh: 1:35 DTNB stock : Assay Buffer)
- Assay Buffer (from Beyotime kit)
- *E. coli* BL21 resting cells with *PepT<sub>Sh</sub>* expressed
- CGTase solution
- Maltodextrin
- 1x Phosphate Buffered Saline (0.2 g/L KH2PO4, 0.2 g/L KCl, 1.15 g/L Na2HPO4, 8.5 g/L NaCl)
- 1x  M9 salt solution (6 g/L Na2HPO4, 3 g/L KH2PO4, 0.5 g/L NaCl)
- H₂O

#equipment

- 96‑well microplate
- Centrifuge (sealed tubes, low speed)
- Microplate reader (412 nm)
- 1.5 mL microcentrifuge tube
- Incubator
- Lab scale

#procedure

1. Prepare a 20 mg/mL maltodextrin solution by dissolving maltodextrin in H₂O.
2. Harvest *E. coli*PepT<sub>Sh</sub> resting cells by centrifugation at 3500 rpm 10 min.
3. Resuspend the cells with M9 salt solution to OD650 = 5.
4. Dilute the CGTases to ensure that the concentrations of all the CGTases are approximately the same. (e.g. 0.3 mg/ml)
5. To a 1.5 mL microcentrifuge tube, add the following components:

   | Chemicals | Sample | Negative control |
   | --- | --- | --- |
   | 10 mM CG3M3SH | 60 µL | 60 µL |
   | 20 mg/mL maltodextrin | 40 µL | 40 µL |
   | CGTase | 100 µL | 0 µL |
   | 1x Phosphate Buffered Saline | 0 µL | 100 µL |

6. Incubate at 37 °C for 1h.
7. To each microcentrifuge tube, add 100 µL harvested *E. coli* PepT<sub>Sh</sub> resting cells.
8. Incubate the reactions at 37 °C for 1 h.
9. Centrifuge at 4 °C 10000 rpm for 10 min.
10. To a 96‑well microplate, add the following components:

    | Chemicals | Sample/ Negative control | Blank control |
    | --- | --- | --- |
    | Ellman's reagent solution | 180 µL | 180 µL |
    | Reaction supernatant | 20 µL | 0 µL |
    | Assay buffer | 0 µL | 20 µL |

Mix by pipetting up and down and incubate at room temperature for 15 min to complete color development.
11. Measure absorbance at 412 nm using microplate reader.

::

### Protein Purification by His tag

::content-components-protocol-table{title="Protein Purification by His tag"}

#materials

- 20% ethanol
- NaH₂PO4
- NaCl
- Imidazole
- 1M NaOH
- HCl
- dH₂O
- Ni-NTA sepharose resin

#equipment

- Lab scale
- Graduated cylinder
- Beaker
- Centrifugation tubes
- Clamp and stand
- Syringe barrel
- Filter plate

#procedure

1. Prepare the binding buffer
    1. Add the chemicals in the table below to a beaker

       | Chemical | Mass (g) |
       | --- | --- |
       | NaH₂PO4 | 3.12 |
       | NaCl | 29.25 |

    2. Dissolve the chemicals with purified water
    3. Adjust the pH of the solution to 8.0 using NaOH and HCl
    4. Transfer solution to graduated cylinder, top up with purified water to 1 L
2. Prepare the 500 mM imidazole elution buffer
    1. Add the chemicals in the table below to a beaker

       | Chemical | Mass (g) |
       | --- | --- |
       | NaH₂PO4 | 3.12 |
       | NaCl | 29.25 |
       | imidazole | 34.04 |

    2. Dissolve the chemicals with purified water
    3. Adjust the pH of the solution to 8.0 using NaOH and HCl
    4. Transfer solution to graduated cylinder, top up with purified water to 1 L
3. Use the binding buffer and the  500mM imidazole elution buffer to prepare 20 mM and 250 mM elution buffer
4. Assemble the Ni-NTA column
    1. Place the syringe on a clamp and place a filter plate at the bottom of the syringe barrel
    2. Mix the Ni-NTA beads with the storage buffer thoroughly, then slowly add the mixture into the syringe
    3. Allow the storage buffer to drip out and discard
5. Wash the beads with 3 column volumes (CV) of purified water.
6. Wash the beads with 3 CV of binding buffer.

*From the next step onwards, store the eluate of every "Wash" step separately*{.block .my-2}



7. Place a 15 mL centrifugation tube under the syringe and gently add the supernatant of induced and lysed cells in. Keep the eluate for analysis in case of low yields.
8. Wash with 10 CV binding buffer.
9. Wash with 10 CV 20 mM elution buffer.
10. Wash with 10 CV 70 mM elution buffer.

*Omit step 10 because wet lab results showed that washing with 70 mM elution buffer did not remove any impurities, but decreased yields.*{.block .my-2}



11. Wash with 10 CV 250 mM elution buffer.
12. Wash with 10 CV 500 mM elution buffer.
13. Wash with 10 CV ddH2O, wait until dripping stops.
14. Fill syringe with 20% ethanol and store in the refrigerator at 4 °C.
15. Do **SDS-PAGE** on each eluate sample for evaluation.

::

### Protein Dialysis and Concentration

::content-components-protocol-table{title="Protein Dialysis and Concentration"}

#materials

- Phosphate buffered saline, pH=7.4 (PBS)
- Dialysis tube roll of suitable permeability
- Purified water
- Polyethylene glycol (PEG) average Mn 20000

#equipment

- Large beaker
- Hot plate or any other heating device capable of boiling water
- Dialysis bag clips
- 2 mL microcentrifuge tubes

#procedure

**Dialysis**
1. Cut the dialysis tube roll into sections of suitable lengths.
2. Soak the tube sections in room temperature purified water until soft, then boil for 5-10 minutes in boiling water.
3. **Be careful!** Take the boiled tubes out and soak in cold water to cool. Attach clips to one end of each tube to seal.
4. Add the protein eluate inside the tube. Leave enough space on the other end, and seal the other end with a clip.
5. Label the clips with protein names and imidazole concentration.
6. Soak the dialysis bags in copious amounts of PBS, store in 4 °C fridge, drain and refill PBS every 4 hours, for 2 days total.
7. Proceed to concentration.

**Concentration**
1. Sprinkle a layer of polyethylene glycol (PEG) evenly in a clean dry beaker.
3. Place the dialysis bag containing the protein solution flat onto the PEG layer.
4. Cover the dialysis bag completely with an additional layer of PEG to ensure full encapsulation.
5. Place the beaker in the 4°C refrigerator
6. When the PEG becomes transparent and viscous, replace it with fresh PEG.
6. Once the internal volume of the dialysis bag is reduced to 1/2–1/3 of the original, rinse the outer surface of the dialysis bag thoroughly with distilled water.
7. Aliquot the concentrated protein solution into 2 mL microcentrifuge tubes, measure the protein concentration, and store the aliquots at −20 °C.

::

### Protein Thermal Stability Assay

::content-components-protocol-table{title="Protein Thermal Stability Assay"}

#materials

- CGTase solution
- ddH₂O

#equipment

- PCR tubes
- Thermocycler

#procedure

1. Dilute the CGTases to ensure that the concentrations of all the CGTases are approximately the same (e.g., 0.15 mg/mL).
2. Add 150 µL of CGTase solution to each labeled PCR tube.
3. Place the PCR tubes in the Thermocycler and keep the control at room temperature.
4. Program the Thermocycler to 85 °C for 5 min and start the program.
5. Observe the solution for precipitate formation and compare it with the control.
6. If necessary, repeat steps 4-5.

::

### Cell Lysis Using 5x TES

::content-components-protocol-table{title="Cell Lysis Using 5x TES"}

#materials

- Bacterial culture
- 5X Tris-EDTA-Salt (TES) buffer(pH 8.0)
- 20mM  tris(hydroxymethyl)aminomethane-Hydrochloric Acid  (Tris-HCl) buffer (pH 8.0)
- H₂O

#equipment

- Cryogenic centrifuge tubes
- Lab scale
- Centrifuge
- Shaking incubator

#procedure

1. Centrifuge the bacterial culture at 7500 rpm for 15 min at 4°C.
2. Resuspend the pellet in 5 mL of 5x TES buffer.
3. Transfer the cell suspension into labeled cryogenic centrifuge tubes.
4. Place the cryogenic centrifuge tubes into -80°C refrigerator for at least 3 hours
5. Dilute 5x TES buffer with H₂O to obtain 1x TES buffer
6. After 3 hours, add 10 mL of 1x TES buffer and place the cryogenic centrifuge tubes in a shaking incubator at 16°C and 220 rpm for 1 h.
7. Centrifuge the lysate at 9000 rpm for 10 min at 4 °C.
8. Transfer the supernatant to a separate labeled 50 mL centrifuge tube and resuspend the pellet in 15 mL of 20 mM Tris-HCl buffer.

::
