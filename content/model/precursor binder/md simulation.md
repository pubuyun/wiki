---
title: MD Simulation
description: Molecular dynamics and binding-energy analysis for precursor binder candidates.
order: 230
---

::code-group{defaultValue="0" sync="md-mmpbsa-workflow" label="Workflow and source code"}

```graph [Workflow]
{
  "nodes": [
    {
      "id": "start",
      "type": "start",
      "label": "Start"
    },
    {
      "id": "prepare",
      "type": "input",
      "label": "Create output directory and simulation inputs"
    },
    {
      "id": "select",
      "type": "loop",
      "label": "Select next PDB file"
    },
    {
      "id": "check-result",
      "type": "decision",
      "label": "Result already exists?"
    },
    {
      "id": "build-system",
      "type": "process",
      "label": "Prepare ligand, protein, topology, and solvent"
    },
    {
      "id": "simulate",
      "type": "subprocess",
      "label": "Run minimization, equilibration, and production MD"
    },
    {
      "id": "analyze",
      "type": "subprocess",
      "label": "Correct trajectory and calculate MMPBSA"
    },
    {
      "id": "more-files",
      "type": "decision",
      "label": "More PDB files?"
    },
    {
      "id": "complete",
      "type": "end",
      "label": "Complete"
    }
  ],
  "edges": [
    {
      "id": "start-prepare",
      "source": "start",
      "target": "prepare"
    },
    {
      "id": "prepare-select",
      "source": "prepare",
      "target": "select"
    },
    {
      "id": "select-check",
      "source": "select",
      "target": "check-result"
    },
    {
      "id": "check-no",
      "source": "check-result",
      "target": "build-system",
      "label": "No"
    },
    {
      "id": "check-yes",
      "source": "check-result",
      "target": "more-files",
      "label": "Yes"
    },
    {
      "id": "build-simulate",
      "source": "build-system",
      "target": "simulate"
    },
    {
      "id": "simulate-analyze",
      "source": "simulate",
      "target": "analyze"
    },
    {
      "id": "analyze-more",
      "source": "analyze",
      "target": "more-files"
    },
    {
      "id": "more-yes",
      "source": "more-files",
      "target": "select",
      "label": "Yes",
      "type": "loop"
    },
    {
      "id": "more-no",
      "source": "more-files",
      "target": "complete",
      "label": "No"
    }
  ]
}
```

```bash [run_md_mmpbsa.sh]
#!/bin/bash

INPUT_DIR="pdbs"
OUTPUT_DIR="results"
mkdir -p "$OUTPUT_DIR"

cat << 'EOF' > em.mdp
integrator  = steep
emtol       = 1000.0
emstep      = 0.01
nsteps      = 50000
nstlist     = 10
cutoff-scheme = Verlet
ns_type     = grid
coulombtype = PME
rcoulomb    = 1.0
rvdw        = 1.0
pbc         = xyz
EOF

cat << 'EOF' > ions.mdp
integrator  = steep
emtol       = 1000.0
nsteps      = 50000
cutoff-scheme = Verlet
coulombtype = cutoff
rcoulomb    = 1.0
rvdw        = 1.0
pbc         = xyz
EOF

cat << 'EOF' > nvt.mdp
integrator              = md
dt                      = 0.002
nsteps                  = 250000
nstxout-compressed      = 5000
continuation            = no
constraint_algorithm    = lincs
constraints             = h-bonds
cutoff-scheme           = Verlet
coulombtype             = PME
tcoupl                  = V-rescale
tc-grps                 = System
tau_t                   = 0.1
ref_t                   = 307
pbc                     = xyz
gen_vel                 = yes
gen_temp                = 307
EOF

cat << 'EOF' > npt.mdp
integrator              = md
dt                      = 0.002
nsteps                  = 250000
nstxout-compressed      = 5000
continuation            = yes
constraint_algorithm    = lincs
constraints             = h-bonds
cutoff-scheme           = Verlet
coulombtype             = PME
tcoupl                  = V-rescale
tc-grps                 = System
tau_t                   = 0.1
ref_t                   = 307
pcoupl                  = C-rescale
pcoupltype              = isotropic
tau_p                   = 2.0
ref_p                   = 1.0
compressibility         = 4.5e-5
pbc                     = xyz
gen_vel                 = no
EOF

cat << 'EOF' > md.mdp
integrator              = md
dt                      = 0.002
nsteps                  = 25000000
nstxout-compressed      = 250000
continuation            = yes
constraint_algorithm    = lincs
constraints             = h-bonds
cutoff-scheme           = Verlet
coulombtype             = PME
tcoupl                  = V-rescale
tc-grps                 = System
tau_t                   = 0.1
ref_t                   = 307
pcoupl                  = C-rescale
pcoupltype              = isotropic
tau_p                   = 2.0
ref_p                   = 1.0
compressibility         = 4.5e-5
pbc                     = xyz
gen_vel                 = no
EOF

cat << 'EOF' > mmpbsa.in
&general
sys_name="Protein-Ligand-307K-pH60",
startframe=21,
endframe=100,
interval=1,
forcefields="oldff/leaprc.ff99SBildn,leaprc.gaff2"
/
&gb
igb=5, saltcon=0.150,
/
EOF

for pdb_file in "${INPUT_DIR}"/*.pdb; do
    [ -e "$pdb_file" ] || continue

    base_name=$(basename "$pdb_file" .pdb)
    FINAL_RESULT_FILE="${OUTPUT_DIR}/${base_name}_307K_pH60_50ns_MMPBSA.dat"

    echo "========================================="
    echo ">>>> Starting system: $base_name"

    if [ -f "$FINAL_RESULT_FILE" ]; then
        echo ">>>> [Skipped] MMPBSA calculation already completed: $FINAL_RESULT_FILE"
        echo "========================================="
        continue
    fi

    WORK_DIR="run_${base_name}"
    mkdir -p "$WORK_DIR"
    cd "$WORK_DIR" || continue

    echo ">>>> Conditions: 307 K, pH 6.0, 50 ns simulation"

    grep "^ATOM" "../$pdb_file" > protein_raw.pdb
    grep "^HETATM.*L:0" "../$pdb_file" | sed 's/L:0/LIG/g' > ligand_raw.pdb

    obabel -i pdb ligand_raw.pdb -o sdf -O ligand_temp.sdf -p 6.0 -d > /dev/null 2>&1
    obabel -i sdf ligand_temp.sdf -o mol2 -O ligand.mol2 > /dev/null 2>&1

    awk '{
        if ($0 ~ /^@<TRIPOS>ATOM/) { in_atom=1; print; next }
        if ($0 ~ /^@<TRIPOS>/ && !($0 ~ /^@<TRIPOS>ATOM/)) { in_atom=0 }
        if (in_atom) { $7="1"; $8="LIG"; print $0 }
        else { print $0 }
    }' ligand.mol2 > ligand_fixed.mol2
    mv ligand_fixed.mol2 ligand.mol2

    NET_CHARGE=$(obprop ligand.mol2 | grep "Charge" | awk '{print $2}')
    if [ -z "$NET_CHARGE" ]; then NET_CHARGE=0; fi
    echo ">> Ligand net charge: $NET_CHARGE"

    acpype -i ligand.mol2 -b ligand -c bcc -n "$NET_CHARGE" -a gaff2 -o gmx > acpype.log 2>&1
    if [ -f "ligand.acpype/ligand_GMX.gro" ]; then
        cp ligand.acpype/ligand_GMX.gro ./
        cp ligand.acpype/ligand_GMX.itp ./
    else
        echo ">> Error: Ligand topology generation failed; skipping system."
        cd .. || exit 1
        continue
    fi

    pdb2pqr --ff=AMBER --titration-state-method=propka --with-ph=6.0 protein_raw.pdb protein_ph60.pdb > /dev/null 2>&1
    gmx pdb2gmx -f protein_ph60.pdb -o protein_gmx.gro -p topol.top -water tip3p -ff amber99sb-ildn -ignh -quiet

    head -n -1 protein_gmx.gro > complex.gro
    tail -n +3 ligand_GMX.gro | head -n -1 >> complex.gro
    tail -n 1 protein_gmx.gro >> complex.gro
    total_atoms=$(wc -l < complex.gro)
    total_atoms=$((total_atoms - 3))
    sed -i "2s/.*/$total_atoms/" complex.gro

    cp topol.top topol.top.bak
    sed -i '/forcefield\.itp"/a #include "ligand_GMX.itp"' topol.top
    echo "ligand    1" >> topol.top

    gmx editconf -f complex.gro -o newbox.gro -c -d 1.0 -bt cubic -quiet
    gmx solvate -cp newbox.gro -cs spc216.gro -o solv.gro -p topol.top -quiet
    gmx grompp -f ../ions.mdp -c solv.gro -p topol.top -o ions.tpr -maxwarn 1 -quiet
    echo "SOL" | gmx genion -s ions.tpr -o solv_ions.gro -p topol.top -pname NA -nname CL -neutral -quiet

    echo ">> Running energy minimization (EM)..."
    gmx grompp -f ../em.mdp -c solv_ions.gro -p topol.top -o em.tpr -maxwarn 1 -quiet
    gmx mdrun -v -deffnm em

    echo ">> Running NVT equilibration..."
    gmx grompp -f ../nvt.mdp -c em.gro -r em.gro -p topol.top -o nvt.tpr -maxwarn 1 -quiet
    gmx mdrun -v -deffnm nvt -nb gpu -pme gpu

    echo ">> Running NPT equilibration..."
    gmx grompp -f ../npt.mdp -c nvt.gro -r nvt.gro -t nvt.cpt -p topol.top -o npt.tpr -maxwarn 1 -quiet
    gmx mdrun -v -deffnm npt -nb gpu -pme gpu

    echo ">> Running 50 ns production MD simulation..."
    gmx grompp -f ../md.mdp -c npt.gro -t npt.cpt -p topol.top -o md.tpr -maxwarn 1 -quiet
    gmx mdrun -v -deffnm md -nb gpu -pme gpu

    echo ">> MD simulation complete; removing PBC jumps..."
    mv md.xtc md_raw_uncleaned.xtc

    echo "0" | gmx trjconv -s md.tpr -f md_raw_uncleaned.xtc -pbc nojump -o md_nojump.xtc -quiet
    echo -e "1\n0" | gmx trjconv -s md.tpr -f md_nojump.xtc -center -pbc mol -ur compact -o md_center.xtc -quiet
    mv md_center.xtc md.xtc
    rm -f md_raw_uncleaned.xtc md_nojump.xtc

    echo -e "1 | r LIG \n q" | gmx make_ndx -f md.tpr -o index.ndx -quiet

    echo ">> Calculating MMPBSA from the final 40 ns of equilibrated data..."
    gmx_MMPBSA -O -i ../mmpbsa.in -cs md.tpr -ci index.ndx -cg 1 13 -ct md.xtc -cp topol.top -nogui

    if [ -f "FINAL_RESULTS_MMPBSA.dat" ]; then
        cp FINAL_RESULTS_MMPBSA.dat "../$FINAL_RESULT_FILE"
        echo ">> Success: Free-energy calculation completed for $base_name; output saved to ${OUTPUT_DIR}/"
    else
        echo ">> Failed: MMPBSA calculation did not complete successfully for $base_name."
    fi

    cd .. || exit 1
done

echo "========================================="
echo "All systems have been processed."
echo "========================================="
```

::
